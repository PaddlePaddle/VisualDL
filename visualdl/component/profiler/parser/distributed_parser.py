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
from collections import defaultdict

from .utils import get_device_nodes
from .utils import intersection_ranges
from .utils import merge_ranges
from .utils import merge_self_ranges
from .utils import rebuild_node_trees
from .utils import sum_ranges
from .utils import traverse_tree

_CommunicationOpName = ['allreduce', 'broadcast', 'rpc']


class DistributedParser:
    r"""
    Analysis communication and computation time range, and their overlap.
    The computation time is all kernel except kernels for communication like nccl.
    """

    def __init__(self):
        self.steps_data = defaultdict(lambda: defaultdict(list))
        self.calls = defaultdict(lambda: defaultdict(int))
        self.steps_time = defaultdict(lambda: defaultdict(float))
        self.profile_steps_time = {}

    def parse(self, nodetrees):
        '''
        Collect all communication and computation time ranges.
        '''
        total_time = 0.0
        nodetrees = rebuild_node_trees(nodetrees)
        thread2hostnodes = traverse_tree(nodetrees)
        thread_count = 0
        for threadid, hostnodes in thread2hostnodes.items():
            for hostnode in hostnodes[1:]:  # skip root node
                # case 1: TracerEventType is Communication
                if hostnode.type == 'ProfileStep':
                    if thread_count == 0:
                        total_time += (hostnode.end_ns - hostnode.start_ns)
                    self._parse_step(hostnode)
                    continue
            thread_count += 1

        new_steps_data = defaultdict(lambda: defaultdict(list))
        self.profile_steps_time['All'] = total_time
        for step, step_data in self.steps_data.items():
            self.calls[step]['cpu_communication_range'] = len(
                step_data['cpu_communication_range'])
            self.calls[step]['gpu_communication_range'] = len(
                step_data['gpu_communication_range'])
            new_steps_data[step][
                'cpu_communication_range'] = merge_self_ranges(
                    step_data['cpu_communication_range'], is_sorted=False)
            new_steps_data[step][
                'gpu_communication_range'] = merge_self_ranges(
                    step_data['gpu_communication_range'], is_sorted=False)
            new_steps_data[step]['communication_range'] = merge_ranges(
                new_steps_data[step]['cpu_communication_range'],
                new_steps_data[step]['gpu_communication_range'],
                is_sorted=True)
            new_steps_data[step]['computation_range'] = merge_self_ranges(
                step_data['computation_range'], is_sorted=False)
            new_steps_data[step]['overlap_range'] = intersection_ranges(
                new_steps_data[step]['communication_range'],
                new_steps_data[step]['computation_range'],
                is_sorted=True)
            self.steps_time[step]['communication_time'] = sum_ranges(
                new_steps_data[step]['communication_range'])
            self.steps_time[step]['computation_time'] = sum_ranges(
                new_steps_data[step]['computation_range'])
            self.steps_time[step]['overlap_time'] = sum_ranges(
                new_steps_data[step]['overlap_range'])
            self.steps_time[step]['others_time'] = self.profile_steps_time[
                step] - self.steps_time[step][
                    'communication_time'] - self.steps_time[step][
                        'computation_time'] + self.steps_time[step][
                            'overlap_time']
        self.steps_data = new_steps_data

    def _parse_step(self, profile_step_node):
        step = profile_step_node.name.split('#')[1]
        self.profile_steps_time[
            step] = profile_step_node.end_ns - profile_step_node.start_ns
        nodes = []
        stack = []
        stack.append(profile_step_node)
        while stack:
            current_node = stack.pop()
            nodes.append(current_node)
            for childnode in current_node.children_node:
                stack.append(childnode)
        for hostnode in nodes:
            if hostnode.type == 'Communication':
                self.steps_data[step]['cpu_communication_range'].append(
                    (hostnode.start_ns, hostnode.end_ns))
                self.steps_data['All']['cpu_communication_range'].append(
                    (hostnode.start_ns, hostnode.end_ns))
                device_nodes = get_device_nodes(hostnode)
                for device_node in device_nodes:
                    if device_node.type == 'Kernel':
                        self.steps_data[step][
                            'gpu_communication_range'].append(
                                (device_node.start_ns, device_node.end_ns))
                        self.steps_data['All'][
                            'gpu_communication_range'].append(
                                (device_node.start_ns, device_node.end_ns))

            # case 2: TracerEventType is Operator but is communication op
            elif hostnode.type == 'Operator' and any([
                    name in hostnode.name.lower()
                    for name in _CommunicationOpName
            ]):
                self.steps_data[step]['cpu_communication_range'].append(
                    (hostnode.start_ns, hostnode.end_ns))
                self.steps_data['All']['cpu_communication_range'].append(
                    (hostnode.start_ns, hostnode.end_ns))
                device_nodes = get_device_nodes(hostnode)
                for device_node in device_nodes:
                    if device_node.type == 'Kernel':
                        self.steps_data[step][
                            'gpu_communication_range'].append(
                                (device_node.start_ns, device_node.end_ns))
                        self.steps_data['All'][
                            'gpu_communication_range'].append(
                                (device_node.start_ns, device_node.end_ns))

            # case 3: Others, filter kernels named with nccl
            else:
                for runtimenode in hostnode.runtime_node:
                    for devicenode in runtimenode.device_node:
                        if devicenode.type == 'Kernel':
                            if 'nccl' in devicenode.name.lower():
                                self.steps_data[step][
                                    'gpu_communication_range'].append(
                                        (devicenode.start_ns,
                                         devicenode.end_ns))
                                self.steps_data['All'][
                                    'gpu_communication_range'].append(
                                        (devicenode.start_ns,
                                         devicenode.end_ns))
                            else:
                                self.steps_data[step][
                                    'computation_range'].append(
                                        (devicenode.start_ns,
                                         devicenode.end_ns))
                                self.steps_data['All'][
                                    'computation_range'].append(
                                        (devicenode.start_ns,
                                         devicenode.end_ns))
