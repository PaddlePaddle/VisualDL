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

from .utils import merge_ranges
from .utils import merge_self_ranges
from .utils import rebuild_node_trees
from .utils import sum_ranges
from .utils import traverse_tree

StageType = ['Dataloader', 'Forward', 'Backward', 'Optimization']

CPUType = [
    'Operator', 'CudaRuntime', 'UserDefined', 'OperatorInner', 'Communication',
    'PythonOp', 'PythonUserDefined', 'MluRuntime'
]

GPUType = ['Kernel', 'Memcpy', 'Memset']


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


class ModelPerspectiveItem:
    def __init__(self, name):
        self.name = name
        self.call = 0
        self.cpu_time = 0
        self.max_cpu_time = 0
        self.min_cpu_time = float('inf')
        self.gpu_time = 0
        self.max_gpu_time = 0
        self.min_gpu_time = float('inf')
        self.cpu_times = {}
        self.gpu_times = {}

    @property
    def avg_cpu_time(self):
        return self.cpu_time / self.call

    @property
    def avg_gpu_time(self):
        return self.gpu_time / self.call

    def add_call(self):
        self.call += 1

    def add_cpu_time(self, time):
        self.add_call()
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

    def set_gpu_time(self, time):
        '''
        Use this to set total gpu time in case gpu time calculated by add_gpu_time include overlap.
        '''
        self.gpu_time = time


class OverviewParser:
    r"""
    Analyse time ranges for each TracerEventType, and summarize the time.
    """

    def __init__(self):
        # event name: GeneralItem
        self.memory_manipulation_items = {}  # for memory manipulation summary
        self.userdefined_items = {}  # for userdefined summary
        self.model_perspective_items = {}
        # phase name:
        #   device name:
        #     stage idx:
        #      thread name:
        #        event type:
        #             {"events" :[], "times": []}
        self.events_per_stage = collections.defaultdict(
            lambda: collections.defaultdict(lambda: collections.defaultdict(
                lambda: collections.defaultdict(
                    lambda: collections.defaultdict(lambda: collections.
                                                    defaultdict(list))))))
        # phase name:
        #   device name:
        #     stage idx:
        #      event type:
        #           { "calls" :[], "times": [], "total_time": 0 }

        self.merged_events_per_stage = collections.defaultdict(
            lambda: collections.defaultdict(lambda: collections.defaultdict(
                lambda: collections.defaultdict(lambda: collections.
                                                defaultdict(list)))))

        self.stage_nums = 0
        self.gpu_ulitization = 0.0
        self.has_forward = False
        self.has_device = False

    def parse(self, nodetrees):  # noqa: C901
        r"""
        Analysis node trees in profiler result, and get time range for different tracer event type.
        """
        self._parse_events(nodetrees)
        # statistic calling times
        # merge time, get time summarization
        for stage_name, stage_data in self.events_per_stage.items():
            for device_name, steps_data in stage_data.items():
                for step_idx, thread_data in steps_data.items():
                    for thread_id, events in thread_data.items():
                        for event_type, events_data in events.items():
                            if 'calls' not in self.merged_events_per_stage[
                                    stage_name][device_name][step_idx][
                                        event_type]:
                                self.merged_events_per_stage[stage_name][
                                    device_name][step_idx][event_type][
                                        'calls'] = 0
                            if 'total_time' not in self.merged_events_per_stage[
                                    stage_name][device_name][step_idx][
                                        event_type]:
                                self.merged_events_per_stage[stage_name][
                                    device_name][step_idx][event_type][
                                        'total_time'] = 0
                            events_data['times'] = merge_self_ranges(
                                events_data['times'], is_sorted=False)
                            self.merged_events_per_stage[stage_name][
                                device_name][step_idx][event_type][
                                    'calls'] += len(events_data['events'])
                            self.merged_events_per_stage[stage_name][device_name][step_idx][event_type]['times'] =\
                                merge_ranges(
                                self.merged_events_per_stage[stage_name][device_name][step_idx][event_type]['times'],
                                events_data['times'], is_sorted=True)

        # merge different stages into profile step
        stage_names = list(self.merged_events_per_stage.keys())
        self.merged_events_per_stage['ProfileStep']
        for stage_name in stage_names:
            stage_data = self.merged_events_per_stage[stage_name]
            for device_name, steps_data in stage_data.items():
                for step_idx, events in steps_data.items():
                    for event_type, events_data in events.items():
                        events_data['total_time'] = sum_ranges(
                            events_data['times'])
                        if 'calls' not in self.merged_events_per_stage[
                                'ProfileStep'][device_name][step_idx][
                                    event_type]:
                            self.merged_events_per_stage['ProfileStep'][
                                device_name][step_idx][event_type]['calls'] = 0
                        if 'total_time' not in self.merged_events_per_stage[
                                'ProfileStep'][device_name][step_idx][
                                    event_type]:
                            self.merged_events_per_stage['ProfileStep'][
                                device_name][step_idx][event_type][
                                    'total_time'] = 0
                        self.merged_events_per_stage['ProfileStep'][
                            device_name][step_idx][event_type][
                                'calls'] += events_data['calls']
                        self.merged_events_per_stage['ProfileStep'][
                            device_name][step_idx][event_type][
                                'total_time'] += events_data['total_time']
                        self.merged_events_per_stage['ProfileStep'][
                            device_name][step_idx][event_type][
                                'times'] = merge_ranges(
                                    self.merged_events_per_stage['ProfileStep']
                                    [device_name][step_idx][event_type]
                                    ['times'],
                                    events_data['times'],
                                    is_sorted=True)

        # add gpu time for model perspective summary
        for stage_name, stage_data in self.merged_events_per_stage.items():
            for device_name, steps_data in stage_data.items():
                for step_idx, events in steps_data.items():
                    if 'Kernel' in events:
                        if step_idx == 'ALL':
                            self.model_perspective_items[
                                stage_name].set_gpu_time(
                                    events['Kernel']['total_time'])
                            continue
                        self.model_perspective_items[stage_name].add_gpu_time(
                            events['Kernel']['total_time'])
                        self.model_perspective_items[stage_name].gpu_times[
                            step_idx] = events['Kernel']['total_time']

        if self.has_device:
            self.gpu_ulitization = self.merged_events_per_stage['ProfileStep'][
                'GPU']['ALL']['Kernel'][
                    'total_time'] / self.model_perspective_items[
                        'ProfileStep'].cpu_time

    def _fill_stage_events(  # noqa: C901
            self, node, stage_idx, should_recursive=True):
        if node.type == 'Forward':
            stage_name = 'Forward'
            self.has_forward = True
        elif node.type == 'Backward':
            stage_name = 'Backward'
        elif node.type == 'Optimization':
            stage_name = 'Optimization'
        elif node.type == 'Dataloader':
            stage_name = 'Dataloader'
        else:
            stage_name = 'Other'

        if should_recursive:
            stack = []
            if node.type in StageType:
                for children in node.children_node:
                    stack.append(children)
            else:
                stack.append(node)
            while stack:
                current_node = stack.pop()
                for childnode in current_node.children_node:
                    stack.append(childnode)
                for runtimenode in current_node.runtime_node:
                    self.events_per_stage[stage_name]["CPU"][stage_idx][
                        runtimenode.thread_id][
                            runtimenode.type]['events'].append(runtimenode)
                    self.events_per_stage[stage_name]["CPU"][stage_idx][
                        runtimenode.thread_id][
                            runtimenode.type]['times'].append(
                                (runtimenode.start_ns, runtimenode.end_ns))
                    self.events_per_stage[stage_name]["CPU"]['ALL'][
                        runtimenode.thread_id][
                            runtimenode.type]['events'].append(runtimenode)
                    self.events_per_stage[stage_name]["CPU"]['ALL'][
                        runtimenode.thread_id][
                            runtimenode.type]['times'].append(
                                (runtimenode.start_ns, runtimenode.end_ns))
                    for devicenode in runtimenode.device_node:
                        self.has_device = True
                        self.events_per_stage[stage_name]["GPU"][stage_idx][
                            devicenode.stream_id][
                                devicenode.type]['events'].append(devicenode)
                        self.events_per_stage[stage_name]["GPU"][stage_idx][
                            devicenode.stream_id][
                                devicenode.type]['times'].append(
                                    (devicenode.start_ns, devicenode.end_ns))
                        self.events_per_stage[stage_name]["GPU"]['ALL'][
                            devicenode.stream_id][
                                devicenode.type]['events'].append(devicenode)
                        self.events_per_stage[stage_name]["GPU"]['ALL'][
                            devicenode.stream_id][
                                devicenode.type]['times'].append(
                                    (devicenode.start_ns, devicenode.end_ns))
                if current_node.type == 'Forward' or current_node.type == 'UserDefined':
                    continue
                node_type = current_node.type
                if node_type == 'PythonUserDefined':
                    node_type = 'UserDefined'
                self.events_per_stage[stage_name]["CPU"][stage_idx][
                    current_node.thread_id][node_type]['events'].append(
                        current_node)
                self.events_per_stage[stage_name]["CPU"][stage_idx][
                    current_node.thread_id][node_type]['times'].append(
                        (current_node.start_ns, current_node.end_ns))
                self.events_per_stage[stage_name]["CPU"]['ALL'][
                    current_node.thread_id][node_type]['events'].append(
                        current_node)
                self.events_per_stage[stage_name]["CPU"]['ALL'][
                    current_node.thread_id][node_type]['times'].append(
                        (current_node.start_ns, current_node.end_ns))

        else:
            for runtimenode in node.runtime_node:
                self.events_per_stage[stage_name]["CPU"][stage_idx][
                    runtimenode.thread_id][runtimenode.type]['events'].append(
                        runtimenode)
                self.events_per_stage[stage_name]["CPU"][stage_idx][
                    runtimenode.thread_id][runtimenode.type]['times'].append(
                        (runtimenode.start_ns, runtimenode.end_ns))
                self.events_per_stage[stage_name]["CPU"]['ALL'][
                    runtimenode.thread_id][runtimenode.type]['events'].append(
                        runtimenode)
                self.events_per_stage[stage_name]["CPU"]['ALL'][
                    runtimenode.thread_id][runtimenode.type]['times'].append(
                        (runtimenode.start_ns, runtimenode.end_ns))
                for devicenode in runtimenode.device_node:
                    self.has_device = True
                    self.events_per_stage[stage_name]["GPU"][stage_idx][
                        devicenode.stream_id][
                            devicenode.type]['events'].append(devicenode)
                    self.events_per_stage[stage_name]["GPU"][stage_idx][
                        devicenode.stream_id][devicenode.type]['times'].append(
                            (devicenode.start_ns, devicenode.end_ns))
                    self.events_per_stage[stage_name]["GPU"]['ALL'][
                        devicenode.stream_id][
                            devicenode.type]['events'].append(devicenode)
                    self.events_per_stage[stage_name]["GPU"]['ALL'][
                        devicenode.stream_id][devicenode.type]['times'].append(
                            (devicenode.start_ns, devicenode.end_ns))

    def _parse_events(self, nodetrees):
        node_wrapped_trees = rebuild_node_trees(nodetrees)
        node_wrapped_threadlist = traverse_tree(node_wrapped_trees)
        # analyse user-defined summary
        for threadid, wrapped_nodes in node_wrapped_threadlist.items():
            for wrapped_node in wrapped_nodes[1:]:  # skip root node
                if wrapped_node.type == 'PythonUserDefined':
                    self.add_userdefined_item(wrapped_node)

        # analyse all events in per stage
        thread_count = 0
        for threadid, root_wrapped_node in node_wrapped_trees.items():
            thread_count += 1
            wrapped_profiler_step_nodes = []
            for wrapped_node in root_wrapped_node.children_node:
                wrapped_profiler_step_nodes.append(wrapped_node)
            self.stage_nums = 0
            current_stage_idx = None
            for wrapped_profiler_step_node in wrapped_profiler_step_nodes:
                if wrapped_profiler_step_node.type == 'ProfileStep':
                    self.process_id = wrapped_profiler_step_node.process_id
                    stage_idx = wrapped_profiler_step_node.name.split('#')[1]
                    total_time = 0
                    accumulated_stage_time = 0
                    if thread_count == 1:
                        self.add_model_perspective_item(
                            wrapped_profiler_step_node)
                        self.model_perspective_items['ProfileStep'].cpu_times[
                            stage_idx] = wrapped_profiler_step_node.cpu_time
                        total_time = wrapped_profiler_step_node.cpu_time
                    self.stage_nums += 1
                    for stage_wrapped_node in wrapped_profiler_step_node.children_node:
                        if thread_count == 1:
                            self.add_model_perspective_item(stage_wrapped_node)
                            if stage_wrapped_node.type in StageType:
                                self.model_perspective_items[
                                    stage_wrapped_node.type].cpu_times[
                                        stage_idx] = stage_wrapped_node.cpu_time
                            if stage_wrapped_node.type in StageType:
                                accumulated_stage_time += stage_wrapped_node.cpu_time
                        self._fill_stage_events(stage_wrapped_node, stage_idx)
                    if 'Other' not in self.model_perspective_items:
                        self.model_perspective_items[
                            'Other'] = ModelPerspectiveItem('Other')
                    if thread_count == 1:
                        self.model_perspective_items['Other'].add_cpu_time(
                            total_time - accumulated_stage_time)
                        self.model_perspective_items['Other'].cpu_times[
                            stage_idx] = total_time - accumulated_stage_time
                    self._fill_stage_events(
                        wrapped_profiler_step_node,
                        stage_idx,
                        should_recursive=False)
                else:
                    self._fill_stage_events(wrapped_profiler_step_node,
                                            current_stage_idx)
            self._fill_stage_events(
                root_wrapped_node, current_stage_idx, should_recursive=False)

    def add_userdefined_item(self, userdefined_node):
        if userdefined_node.name not in self.userdefined_items:
            self.userdefined_items[userdefined_node.name] = GeneralItem(
                userdefined_node.name)
        self.userdefined_items[userdefined_node.name].add_item(
            userdefined_node)

    def add_memory_manipulation_item(self, memory_manipulation_node):
        if memory_manipulation_node.name not in self.memory_manipulation_items:
            self.memory_manipulation_items[
                memory_manipulation_node.name] = GeneralItem(
                    memory_manipulation_node.name)
        self.memory_manipulation_items[memory_manipulation_node.name].add_item(
            memory_manipulation_node)

    def add_model_perspective_item(self, model_perspective_node):
        if model_perspective_node.type == 'Forward':
            name = 'Forward'
        elif model_perspective_node.type == 'Backward':
            name = 'Backward'
        elif model_perspective_node.type == 'Optimization':
            name = 'Optimization'
        elif model_perspective_node.type == 'Dataloader':
            name = 'Dataloader'
        elif model_perspective_node.type == 'ProfileStep':
            name = 'ProfileStep'
        else:
            return
        if name not in self.model_perspective_items:
            self.model_perspective_items[name] = ModelPerspectiveItem(name)
        self.model_perspective_items[name].add_cpu_time(
            model_perspective_node.cpu_time)
