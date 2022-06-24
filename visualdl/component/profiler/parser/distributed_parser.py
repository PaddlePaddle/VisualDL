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

class DistributedParser:
    r"""
    Analysis communication and computation time range, and their overlap.
    The computation time is all kernel except kernels for communication like nccl.
    """

    def __init__(self):
        self.cpu_communication_range = []
        self.gpu_communication_range = []
        self.communication_range = []
        self.computation_range = []
        self.overlap_range = []
        self.cpu_calls = 0
        self.gpu_calls = 0

    def parse(self, nodetrees):
        '''
        Collect all communication and computation time ranges.
        '''
        thread2hostnodes = traverse_tree(nodetrees)
        for threadid, hostnodes in thread2hostnodes.items():
            for hostnode in hostnodes[1:]:  #skip root node
                # case 1: TracerEventType is Communication
                if hostnode.type == TracerEventType.Communication:
                    self.cpu_communication_range.append(
                        (hostnode.start_ns, hostnode.end_ns))
                    device_nodes = get_device_nodes(hostnode)
                    for device_node in device_nodes:
                        if device_node.type == TracerEventType.Kernel:
                            self.gpu_communication_range.append(
                                (device_node.start_ns, device_node.end_ns))

                #case 2: TracerEventType is Operator but is communication op
                elif hostnode.type == TracerEventType.Operator and any([
                        name in hostnode.name.lower()
                        for name in _CommunicationOpName
                ]):
                    self.cpu_communication_range.append(
                        (hostnode.start_ns, hostnode.end_ns))
                    device_nodes = get_device_nodes(hostnode)
                    for device_node in device_nodes:
                        if device_node.type == TracerEventType.Kernel:
                            self.gpu_communication_range.append(
                                (device_node.start_ns, device_node.end_ns))

                #case 3: Others, filter kernels named with nccl
                else:
                    for runtimenode in hostnode.runtime_node:
                        for devicenode in runtimenode.device_node:
                            if devicenode.type == TracerEventType.Kernel:
                                if 'nccl' in devicenode.name.lower():
                                    self.gpu_communication_range.append(
                                        (devicenode.start_ns,
                                         devicenode.end_ns))
                                else:
                                    self.computation_range.append(
                                        (devicenode.start_ns,
                                         devicenode.end_ns))
        self.cpu_calls = len(set(self.cpu_communication_range))
        self.gpu_calls = len(set(self.gpu_communication_range))
        self.cpu_communication_range = merge_self_ranges(
            self.cpu_communication_range, is_sorted=False)
        self.gpu_communication_range = merge_self_ranges(
            self.gpu_communication_range, is_sorted=False)
        self.communication_range = merge_ranges(self.cpu_communication_range,
                                                self.gpu_communication_range,
                                                is_sorted=True)
        self.computation_range = merge_self_ranges(self.computation_range,
                                                   is_sorted=False)
        self.overlap_range = intersection_ranges(self.communication_range,
                                                 self.computation_range,
                                                 is_sorted=True)
