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


class GeneralItem:

    def __init__(self, name):
        self.name = name
        self.call = 0
        self.cpu_time = 0
        self.max_cpu_time = 0
        self.min_cpu_time = float('inf')
        self.gpu_time = 0
        self.max_gpu_time = 0
        self.min_gpu_time = float('inf')
        self.general_gpu_time = 0
        self.min_general_gpu_time = float('inf')
        self.max_general_gpu_time = 0

    @property
    def avg_cpu_time(self):
        return self.cpu_time / self.call

    @property
    def avg_gpu_time(self):
        return self.gpu_time / self.call

    @property
    def avg_general_gpu_time(self):
        return self.general_gpu_time / self.call

    def add_cpu_time(self, time):
        if time > self.max_cpu_time:
            self.max_cpu_time = time
        if time < self.min_cpu_time:
            self.min_cpu_time = time
        self.cpu_time += time

    def add_gpu_time(self, time):
        if time > self.max_gpu_time:
            self.max_gpu_time = time
        if time < self.min_gpu_time:
            self.min_gpu_time = time
        self.gpu_time += time

    def add_general_gpu_time(self, time):
        if time > self.max_general_gpu_time:
            self.max_general_gpu_time = time
        if time < self.min_general_gpu_time:
            self.min_general_gpu_time = time
        self.general_gpu_time += time

    def add_call(self):
        self.call += 1

    def add_item(self, node):
        self.add_call()
        self.add_cpu_time(node.cpu_time)
        self.add_gpu_time(node.gpu_time)
        self.add_general_gpu_time(node.general_gpu_time)


class OverviewParser:
    r"""
    Analyse time ranges for each TracerEventType, and summarize the time.
    """

    def __init__(self):
        self.CPUTimeRange = collections.defaultdict(list)
        self.GPUTimeRange = collections.defaultdict(
            lambda: collections.defaultdict(
                list))  # GPU events should be divided into different devices
        self.CPUTimeRangeSum = collections.defaultdict(int)
        self.GPUTimeRangeSum = collections.defaultdict(
            lambda: collections.defaultdict(int))
        self.call_times = collections.defaultdict(int)

        self.userdefined_items = {}  # for userdefined summary
        self.userdefined_thread_items = collections.defaultdict(
            dict)  # for userdefined summary
        self.model_perspective_items = {}  # for model summary
        self.memory_manipulation_items = {}  # for memory manipulation summary

    def parse(self, nodetrees):
        r"""
        Analysis node trees in profiler result, and get time range for different tracer event type.
        """
        self._parse_time_range(nodetrees)
        self._parse_general_events(nodetrees)
       

    def _parse_time_range(self, nodetrees):
        thread2hostnodes = traverse_tree(nodetrees)
        for threadid, hostnodes in thread2hostnodes.items():
            CPUTimeRange = collections.defaultdict(list)
            GPUTimeRange = collections.defaultdict(
                lambda: collections.defaultdict(lambda: collections.defaultdict(
                    list)))  # device_id/type/stream_id
            for hostnode in hostnodes[1:]:  #skip root node
                CPUTimeRange[hostnode.type].append(
                    (hostnode.start_ns, hostnode.end_ns))
                self.call_times[hostnode.type] += 1
                for runtimenode in hostnode.runtime_node:
                    CPUTimeRange[runtimenode.type].append(
                        (runtimenode.start_ns, runtimenode.end_ns))
                    self.call_times[runtimenode.type] += 1
                    for devicenode in runtimenode.device_node:
                        GPUTimeRange[devicenode.device_id][devicenode.type][
                            devicenode.stream_id].append(
                                (devicenode.start_ns, devicenode.end_ns))
                        self.call_times[devicenode.type] += 1

            for event_type, time_ranges in CPUTimeRange.items():
                time_ranges = merge_self_ranges(time_ranges, is_sorted=False)
                self.CPUTimeRange[event_type] = merge_ranges(
                    self.CPUTimeRange[event_type], time_ranges, is_sorted=True)
            for device_id, device_time_ranges in GPUTimeRange.items():
                for event_type, event_time_ranges in device_time_ranges.items():
                    for stream_id, time_ranges in event_time_ranges.items():
                        time_ranges = merge_self_ranges(time_ranges,
                                                        is_sorted=False)
                        self.GPUTimeRange[device_id][event_type] = merge_ranges(
                            self.GPUTimeRange[device_id][event_type],
                            time_ranges,
                            is_sorted=True)

        for event_type, time_ranges in self.CPUTimeRange.items():
            self.CPUTimeRangeSum[event_type] = sum_ranges(time_ranges)
        for device_id, device_time_ranges in self.GPUTimeRange.items():
            for event_type, time_ranges in device_time_ranges.items():
                self.GPUTimeRangeSum[device_id][event_type] = sum_ranges(
                    time_ranges)
    
    def _parse_general_events(self, nodetrees):
        node_statistic_trees, thread2host_statistic_nodes = wrap_tree(nodetrees)
        for threadid, host_statistic_nodes in thread2host_statistic_nodes.items(
        ):
            for host_statistic_node in host_statistic_nodes[
                    1:]:  #skip root node
                if host_statistic_node.type == TracerEventType.UserDefined\
                    or host_statistic_node.type == TracerEventType.PythonUserDefined:
                    if 'memcpy' in host_statistic_node.name.lower() or 'memorycopy' in host_statistic_node.name.lower()\
                        or 'memset' in host_statistic_node.name.lower():
                        self.add_memory_manipulation_item(host_statistic_node)
                    else:
                        self.add_userdefined_item(host_statistic_node)

        for threadid, root_statistic_node in node_statistic_trees.items():
            deque = collections.deque()
            deque.append(root_statistic_node)
            while deque:
                current_node = deque.popleft()
                for child in current_node.children_node:
                    if child.type == TracerEventType.Forward or child.type == TracerEventType.Dataloader\
                        or child.type == TracerEventType.Backward or child.type == TracerEventType.Optimization:
                        self.add_model_perspective_item(
                            child)  #find first model perspective node
                    else:
                        if child.type == TracerEventType.ProfileStep:
                            self.add_model_perspective_item(child)
                        deque.append(child)

    
    def add_userdefined_item(self, userdefined_node):
        if userdefined_node.name not in self.userdefined_items:
            self.userdefined_items[
                userdefined_node.name] = GeneralItem(
                    userdefined_node.name)

        self.userdefined_items[userdefined_node.name].add_item(userdefined_node)

        if userdefined_node.name not in self.userdefined_thread_items[
                userdefined_node.thread_id]:
            self.userdefined_thread_items[userdefined_node.thread_id][
                userdefined_node.name] = GeneralItem(
                    userdefined_node.name)
        self.userdefined_thread_items[userdefined_node.thread_id][
            userdefined_node.name].add_item(userdefined_node)

    def add_memory_manipulation_item(self, memory_manipulation_node):
        if memory_manipulation_node.name not in self.memory_manipulation_items:
            self.memory_manipulation_items[
                memory_manipulation_node.name] = GeneralItem(
                    memory_manipulation_node.name)
        self.memory_manipulation_items[memory_manipulation_node.name].add_item(
            memory_manipulation_node)


    def add_model_perspective_item(self, model_perspective_node):
        if model_perspective_node.type == TracerEventType.Forward:
            name = 'Forward'
        elif model_perspective_node.type == TracerEventType.Backward:
            name = 'Backward'
        elif model_perspective_node.type == TracerEventType.Optimization:
            name = 'Optimization'
        elif model_perspective_node.type == TracerEventType.Dataloader:
            name = 'Dataloader'
        elif model_perspective_node.type == TracerEventType.ProfileStep:
            name = 'ProfileStep'
        else:
            return
        if name not in self.model_perspective_items:
            self.model_perspective_items[name] = GeneralItem(name)
        self.model_perspective_items[name].add_item(model_perspective_node)


    def get_gpu_devices(self):
        return self.GPUTimeRange.keys()

    def get_gpu_range_sum(self, device_id, event_type):
        return self.GPUTimeRangeSum[device_id][event_type]

    def get_cpu_range_sum(self, event_type):
        return self.CPUTimeRangeSum[event_type]


