# Copyright (c) 2022 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =======================================================================
import collections


class TC_Allowlist(dict):
    # Refer to https://github.com/NVIDIA/PyProf/blob/fd1b2902e3306119eee40ba6b6e8b2f816920c29/pyprof/prof/tc.py#L19
    allowlist = [
        'h884', 's884', 'h1688', 's1688', 'hmma', 'i8816', '16816',
        'dgrad_1x1_stride_2x2', 'first_layer_wgrad_kernel', 'conv1x1',
        'conv2d_c1_k1', 'direct_group', 'xmma_implicit_gemm',
        'xmma_sparse_conv', 'xmma_warp_specialized_implicit_gemm', 'xmma_gemm',
        'xmma_sparse_gemm', 'c1688'
    ]

    def __init__(self):
        pass

    def __contains__(self, item):
        # If kernel name contains substring equal to any one in allowlist, then it uses tensor core.
        for pattern in self.allowlist:
            if pattern in item:
                return True
        return False


_allow_list = TC_Allowlist()


class DeviceItem:
    def __init__(self, name):
        self.name = name
        self.call = 0
        self.gpu_time = 0
        self.max_gpu_time = 0
        self.min_gpu_time = float('inf')
        self.tensorcore_used = True if name in _allow_list else False
        self.sum_blocks_per_sm = 0.0
        self.sum_occupancy = 0.0

    @property
    def avg_gpu_time(self):
        return self.gpu_time / self.call

    def add_gpu_time(self, time):
        if time > self.max_gpu_time:
            self.max_gpu_time = time
        if time < self.min_gpu_time:
            self.min_gpu_time = time
        self.gpu_time += time

    def add_item(self, node):
        self.call += 1
        self.add_gpu_time(node.end_ns - node.start_ns)
        self.sum_blocks_per_sm += node.blocks_per_sm
        self.sum_occupancy += node.occupancy


class KernelParser:
    def __init__(self):
        self.kernel_items = {}  # for kernel summary
        self.kernel_items_with_op_name_attributes = collections.defaultdict(
            dict)
        self.gpu_ids = set()
        self.occupancy = 0.0
        self.sm_efficiency = 0.0
        self.tensor_core_ratio = 0.0

    def parse(self, nodelists):  # noqa: C901
        total_duration = 0.0
        weighted_occupancy = 0.0
        weighted_sm_efficiency = 0.0
        for threadid, nodes in nodelists.items():
            for node in nodes:
                if node.type == 'Operator':
                    op_name = node.name
                    for children in node.children_node:
                        if children.type == 'OperatorInner':
                            for runtime_node in children.runtime_node:
                                for device_node in runtime_node.device_node:
                                    if device_node.type == 'Kernel':
                                        op_attribute_name = self._translate_op_name_attributes_to_string(
                                            op_name, device_node)
                                        if op_attribute_name not in self.kernel_items_with_op_name_attributes[
                                                device_node.name]:
                                            self.kernel_items_with_op_name_attributes[
                                                device_node.name][
                                                    op_attribute_name] = DeviceItem(
                                                        device_node.name)
                                        self.kernel_items_with_op_name_attributes[
                                            device_node.
                                            name][op_attribute_name].add_item(
                                                device_node)
                    for runtime_node in node.runtime_node:
                        for device_node in runtime_node.device_node:
                            if device_node.type == 'Kernel':
                                op_attribute_name = self._translate_op_name_attributes_to_string(
                                    op_name, device_node)
                                if op_attribute_name not in self.kernel_items_with_op_name_attributes[
                                        device_node.name]:
                                    self.kernel_items_with_op_name_attributes[
                                        device_node.
                                        name][op_attribute_name] = DeviceItem(
                                            device_node.name)
                                self.kernel_items_with_op_name_attributes[
                                    device_node.
                                    name][op_attribute_name].add_item(
                                        device_node)
                elif node.type == 'OperatorInner':
                    continue
                op_name = node.name
                for runtime_node in node.runtime_node:
                    for device_node in runtime_node.device_node:
                        if device_node.type == 'Kernel':
                            op_attribute_name = self._translate_op_name_attributes_to_string(
                                op_name, device_node)
                            if op_attribute_name not in self.kernel_items_with_op_name_attributes[
                                    device_node.name]:
                                self.kernel_items_with_op_name_attributes[
                                    device_node.
                                    name][op_attribute_name] = DeviceItem(
                                        device_node.name)
                            self.kernel_items_with_op_name_attributes[
                                device_node.name][op_attribute_name].add_item(
                                    device_node)

        for threadid, nodes in nodelists.items():
            for node in nodes:
                for runtime_node in node.runtime_node:
                    for device_node in runtime_node.device_node:
                        if device_node.type == 'Kernel':
                            name = device_node.name
                            if name not in self.kernel_items:
                                self.kernel_items[name] = DeviceItem(name)
                            self.kernel_items[name].add_item(device_node)
                            weighted_occupancy += (
                                device_node.occupancy / 100) * (
                                    device_node.end_ns - device_node.start_ns)
                            if device_node.blocks_per_sm > 1:
                                sm_efficiency = 1
                            else:
                                sm_efficiency = device_node.blocks_per_sm
                            weighted_sm_efficiency += sm_efficiency * (
                                device_node.end_ns - device_node.start_ns)
                            total_duration += (
                                device_node.end_ns - device_node.start_ns)
                            self.gpu_ids.add(device_node.device_id)
        self.occupancy = weighted_occupancy / total_duration if total_duration != 0 else 0.0
        self.sm_efficiency = weighted_sm_efficiency  # to divide ProfileStep time in ProfileData
        total_time = 0
        total_tensorcore_time = 0
        for name, node in self.kernel_items.items():
            if node.tensorcore_used:
                total_tensorcore_time += node.gpu_time
            total_time += node.gpu_time
        self.tensor_core_ratio = total_tensorcore_time / total_time if total_time != 0 else 0.0

    def _translate_op_name_attributes_to_string(self, op_name, event):
        result = '{}-[{},{},{}]-[{},{},{}]-{}-{}'.format(
            op_name, event.grid_x, event.grid_y, event.grid_z, event.block_x,
            event.block_y, event.block_z, event.registers_per_thread,
            event.shared_memory)
        return result
