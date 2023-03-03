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
from collections import OrderedDict

from .parser.distributed_parser import DistributedParser
from .parser.kernel_parser import KernelParser
from .parser.memory_parser import MemoryParser
from .parser.operator_parser import OperatorParser
from .parser.overview_parser import CPUType
from .parser.overview_parser import GPUType
from .parser.overview_parser import OverviewParser
from .parser.trace_parser import TraceParser
from .parser.utils import format_float
from .parser.utils import format_memory
from .parser.utils import format_ratio
from .parser.utils import format_time
from .parser.utils import traverse_tree


def filter_type(node_trees):
    nodelists = traverse_tree(node_trees)
    for thread_id, nodelist in nodelists.items():
        for node in nodelist:
            if not isinstance(node.type, str):
                node.type = str(node.type).split('.')[1]


class ProfilerData:
    '''
  Hold all parsed data to serve for user requests.
  '''

    def __init__(self, run, worker_name, span_indx, profiler_result):
        self.run = run
        self.worker_name = worker_name
        self.span_indx = span_indx
        self.node_trees = profiler_result.get_data()
        filter_type(self.node_trees)
        self.extra_infos = profiler_result.get_extra_info()
        self.span_idx = profiler_result.get_span_idx()
        self.device_infos = profiler_result.get_device_infos()
        self.overview_parser = None
        self.operator_parser = None
        self.distributed_parser = None
        self.memory_parser = None
        self.kernel_parser = None
        self.trace_parser = None
        self.has_gpu = profiler_result.has_device()

        if profiler_result.has_host():
            # overview parser
            self.overview_parser = OverviewParser()
            self.overview_parser.parse(self.node_trees)
            self.merged_events_per_stage = self.overview_parser.merged_events_per_stage
            self.model_perspective_items = self.overview_parser.model_perspective_items
            self.userdefined_items = self.overview_parser.userdefined_items
            self.gpu_ulitization = self.overview_parser.gpu_ulitization
            self.process_id = self.overview_parser.process_id
            # operator parser
            self.operator_parser = OperatorParser()
            self.operator_parser.parse(self.node_trees)
            self.operator_items = self.operator_parser.items
            self.operator_items_with_input_shape = self.operator_parser.items_with_input_shape

            # distributed parser
            if profiler_result.has_device():
                self.distributed_parser = DistributedParser()
                self.distributed_parser.parse(self.node_trees)
                self.distributed_time = self.distributed_parser.steps_time

            if profiler_result.has_memory():
                # memory parser
                self.memory_parser = MemoryParser()
                self.memory_parser.parse(self.node_trees)
                self.memory_curve = self.memory_parser.memory_curve
                self.allocated_items = self.memory_parser.allocated_items
                self.reserved_items = self.memory_parser.reserved_items
                self.paired_events = self.memory_parser.paired_events
                self.size_ranges = self.memory_parser.size_ranges
                self.peak_allocation_values = self.memory_parser.peak_allocation_values

        if profiler_result.has_device():
            # kernel parser
            self.kernel_parser = KernelParser()
            self.kernel_parser.parse(traverse_tree(self.node_trees))
            self.kernel_items = self.kernel_parser.kernel_items
            self.kernel_items_with_op_name_attributes = self.kernel_parser.kernel_items_with_op_name_attributes
            self.occupancy = self.kernel_parser.occupancy
            self.sm_efficiency = self.kernel_parser.sm_efficiency
            self.tensorcore_ratio = self.kernel_parser.tensor_core_ratio
            self.gpu_ids = self.kernel_parser.gpu_ids

        # trace parser
        self.trace_parser = TraceParser()
        self.trace_parser.parse(profiler_result.content)

    def get_views(self):
        '''
        Return available views this profile data can provide.
        '''
        views = []
        if self.overview_parser:
            if self.overview_parser.has_forward:
                views.append('Overview')
        if self.operator_parser:
            if self.operator_items:
                views.append('Operator')
        if self.kernel_parser:
            if self.kernel_items:
                views.append('GPU Kernel')
        if self.memory_parser:
            if self.memory_curve:
                views.append('Memory')
        if self.distributed_parser:
            if self.distributed_time:
                views.append('Distributed')
        views.append('Trace')
        return views

    def get_device_infos(self):
        if not self.overview_parser:
            return
        if not self.overview_parser.has_device:
            device_type = 'CPU'
            return {
                "device_type": device_type,
                "CPU": {
                    "process_utilization":
                    format_ratio(
                        float(self.extra_infos["Process Cpu Utilization"])),
                    "system_utilization":
                    format_ratio(
                        float(self.extra_infos["System Cpu Utilization"]))
                }
            }
        else:
            device_type = 'GPU'
            gpu_id = int(next(iter(self.gpu_ids)))
            if gpu_id in self.device_infos:
                return {
                    "device_type": device_type,
                    "CPU": {
                        "process_utilization":
                        format_ratio(
                            float(
                                self.extra_infos["Process Cpu Utilization"])),
                        "system_utilization":
                        format_ratio(
                            float(self.extra_infos["System Cpu Utilization"]))
                    },
                    "GPU": {
                        "name":
                        self.device_infos[gpu_id]['name'],
                        "memory":
                        "{} GB".format(
                            format_memory(
                                self.device_infos[gpu_id]['totalGlobalMem'],
                                'GB')),
                        "compute_capability":
                        '{}.{}'.format(
                            self.device_infos[gpu_id]['computeMajor'],
                            self.device_infos[gpu_id]['computeMinor']),
                        "utilization":
                        format_ratio(self.gpu_ulitization),
                        "sm_efficiency":
                        format_ratio(
                            self.sm_efficiency / self.
                            model_perspective_items['ProfileStep'].cpu_time),
                        "achieved_occupancy":
                        format_ratio(self.occupancy),
                        "tensor_core_percentage":
                        format_ratio(self.tensorcore_ratio)
                    }
                }
            else:
                return {
                    "device_type": device_type,
                    "CPU": {
                        "process_utilization":
                        format_ratio(
                            float(
                                self.extra_infos["Process Cpu Utilization"])),
                        "system_utilization":
                        format_ratio(
                            float(self.extra_infos["System Cpu Utilization"]))
                    },
                    "GPU": {
                        "name":
                        "-",
                        "memory":
                        "-",
                        "compute_capability":
                        '-',
                        "utilization":
                        format_ratio(self.gpu_ulitization),
                        "sm_efficiency":
                        format_ratio(
                            self.sm_efficiency / self.
                            model_perspective_items['ProfileStep'].cpu_time),
                        "achieved_occupancy":
                        format_ratio(self.occupancy),
                        "tensor_core_percentage":
                        format_ratio(self.tensorcore_ratio)
                    }
                }

    def get_model_perspective(self, time_unit):
        '''
        Get total cpu and gpu statistics for model perspective of each profiler step.
        '''
        if not self.overview_parser:
            return
        data = OrderedDict()
        data['column_name'] = [
            "name", "calls", "total_time", "avg_time", "max_time", "min_time",
            "ratio"
        ]
        data['cpu'] = []
        if self.overview_parser.has_device:
            data['gpu'] = []
        total_cpu_time = self.model_perspective_items['ProfileStep'].cpu_time
        total_gpu_time = self.model_perspective_items['ProfileStep'].gpu_time
        for stage_name in [
                'ProfileStep', 'Dataloader', 'Forward', 'Backward',
                'Optimization', 'Other'
        ]:
            if stage_name in self.model_perspective_items:
                cpu_stage_data = OrderedDict()
                cpu_stage_data['name'] = stage_name
                cpu_stage_data['calls'] = self.model_perspective_items[
                    stage_name].call
                cpu_stage_data['total_time'] = format_time(
                    self.model_perspective_items[stage_name].cpu_time,
                    time_unit)
                cpu_stage_data['avg_time'] = format_time(
                    self.model_perspective_items[stage_name].avg_cpu_time,
                    time_unit)
                cpu_stage_data['max_time'] = format_time(
                    self.model_perspective_items[stage_name].max_cpu_time,
                    time_unit)
                cpu_stage_data['min_time'] = format_time(
                    self.model_perspective_items[stage_name].min_cpu_time,
                    time_unit,
                    inf_subs=0)
                cpu_stage_data['ratio'] = format_ratio(
                    self.model_perspective_items[stage_name].cpu_time /
                    total_cpu_time)
                if self.overview_parser.has_device:
                    gpu_stage_data = OrderedDict()
                    gpu_stage_data['name'] = stage_name
                    gpu_stage_data['calls'] = self.model_perspective_items[
                        stage_name].call
                    gpu_stage_data['total_time'] = format_time(
                        self.model_perspective_items[stage_name].gpu_time,
                        time_unit)
                    gpu_stage_data['avg_time'] = format_time(
                        self.model_perspective_items[stage_name].avg_gpu_time,
                        time_unit)
                    gpu_stage_data['max_time'] = format_time(
                        self.model_perspective_items[stage_name].max_gpu_time,
                        time_unit)
                    gpu_stage_data['min_time'] = format_time(
                        self.model_perspective_items[stage_name].min_gpu_time,
                        time_unit,
                        inf_subs=0)
                    gpu_stage_data['ratio'] = format_ratio(
                        self.model_perspective_items[stage_name].gpu_time /
                        total_gpu_time)
                data['cpu'].append(cpu_stage_data)
                if self.overview_parser.has_device:
                    data['gpu'].append(gpu_stage_data)
        return data

    def get_model_perspective_perstep(self, device_type, time_unit):
        if not self.overview_parser:
            return
        try:
            data = OrderedDict()
            data['order'] = []
            steps = [
                int(step_id) for step_id in
                self.model_perspective_items['ProfileStep'].cpu_times.keys()
            ]
            steps = sorted(steps)
            data['steps'] = steps
            for stage_name in [
                    'Dataloader', 'Forward', 'Backward', 'Optimization',
                    'Other'
            ]:
                if stage_name not in self.model_perspective_items:
                    continue
                data['order'].append(stage_name)
                data[stage_name] = []
                for stage_idx in steps:
                    stage_idx = str(stage_idx)
                    if device_type == 'cpu':
                        if stage_idx in self.model_perspective_items[
                                stage_name].cpu_times:
                            data[stage_name].append(
                                format_time(
                                    self.model_perspective_items[stage_name].
                                    cpu_times[stage_idx], time_unit))
                        else:
                            data[stage_name].append(0)
                    else:
                        if stage_idx in self.model_perspective_items[
                                stage_name].gpu_times:
                            data[stage_name].append(
                                format_time(
                                    self.model_perspective_items[stage_name].
                                    gpu_times[stage_idx], time_unit))
                        else:
                            data[stage_name].append(0)
        except Exception as e:
            print('error in get_model_perspective_perstep', e)
        new_data = {}
        new_data['order'] = data['order']
        new_data['steps'] = data['steps']
        new_data['data'] = []
        for name in new_data['order']:
            new_data['data'].append(data[name])
        return new_data

    def get_event_type_perspective(self, device_type, time_unit):
        if not self.overview_parser:
            return
        data = OrderedDict()
        data['order'] = []
        if device_type == 'cpu':
            for event_type in CPUType:
                event_type_data = {}
                event_type_data['calling_times'] = {}
                event_type_data['calling_times']['key'] = []
                event_type_data['calling_times']['value'] = []
                event_type_data['durations'] = {}
                event_type_data['durations']['key'] = []
                event_type_data['durations']['value'] = []
                event_type_data['ratios'] = {}
                event_type_data['ratios']['key'] = []
                event_type_data['ratios']['value'] = []
                for stage_name in [
                        'Dataloader', 'Forward', 'Backward', 'Optimization',
                        'Other'
                ]:
                    if stage_name in self.merged_events_per_stage:
                        if event_type in self.merged_events_per_stage[
                                stage_name]['CPU']['ALL']:
                            event_type_data['calling_times']['key'].append(
                                stage_name)
                            event_type_data['durations']['key'].append(
                                stage_name)
                            event_type_data['ratios']['key'].append(stage_name)
                            event_type_data['calling_times']['value'].append(
                                self.merged_events_per_stage[stage_name]['CPU']
                                ['ALL'][event_type]['calls'])
                            event_type_data['durations']['value'].append(
                                format_time(
                                    self.merged_events_per_stage[stage_name]
                                    ['CPU']['ALL'][event_type]['total_time'],
                                    time_unit))
                            event_type_data['ratios']['value'].append(
                                format_ratio(
                                    self.merged_events_per_stage[stage_name]
                                    ['CPU']['ALL'][event_type]['total_time'] /
                                    self.merged_events_per_stage['ProfileStep']
                                    ['CPU']['ALL'][event_type]['total_time']))
                if event_type_data['calling_times']['key']:
                    data[event_type] = event_type_data
                    data['order'].append(event_type)
        else:
            for event_type in GPUType:
                event_type_data = {}
                event_type_data['calling_times'] = {}
                event_type_data['calling_times']['key'] = []
                event_type_data['calling_times']['value'] = []
                event_type_data['durations'] = {}
                event_type_data['durations']['key'] = []
                event_type_data['durations']['value'] = []
                event_type_data['ratios'] = {}
                event_type_data['ratios']['key'] = []
                event_type_data['ratios']['value'] = []
                for stage_name in [
                        'Dataloader', 'Forward', 'Backward', 'Optimization',
                        'Other'
                ]:
                    if stage_name in self.merged_events_per_stage:
                        if event_type in self.merged_events_per_stage[
                                stage_name]['GPU']['ALL']:
                            event_type_data['calling_times']['key'].append(
                                stage_name)
                            event_type_data['durations']['key'].append(
                                stage_name)
                            event_type_data['ratios']['key'].append(stage_name)
                            event_type_data['calling_times']['value'].append(
                                self.merged_events_per_stage[stage_name]['GPU']
                                ['ALL'][event_type]['calls'])
                            event_type_data['durations']['value'].append(
                                format_time(
                                    self.merged_events_per_stage[stage_name]
                                    ['GPU']['ALL'][event_type]['total_time'],
                                    time_unit))
                            event_type_data['ratios']['value'].append(
                                format_ratio(
                                    self.merged_events_per_stage[stage_name]
                                    ['GPU']['ALL'][event_type]['total_time'] /
                                    self.merged_events_per_stage['ProfileStep']
                                    ['GPU']['ALL'][event_type]['total_time']))
                if event_type_data['calling_times']['key']:
                    data[event_type] = event_type_data
                    data['order'].append(event_type)
        return data

    def get_event_type_model_perspective(self, time_unit):  # noqa: C901
        if not self.overview_parser:
            return
        data = OrderedDict()
        data['order'] = []
        data['phase_type'] = []
        try:
            for event_type in CPUType:
                if event_type in self.merged_events_per_stage['ProfileStep'][
                        'CPU']['ALL']:
                    data['order'].append(event_type)
                    data[event_type] = []
            if self.overview_parser.has_device:
                for event_type in GPUType:
                    if event_type in self.merged_events_per_stage[
                            'ProfileStep']['GPU']['ALL']:
                        data['order'].append(event_type)
                        data[event_type] = []
            for stage_name in [
                    'ProfileStep', 'Dataloader', 'Forward', 'Backward',
                    'Optimization', 'Other'
            ]:
                if stage_name in self.merged_events_per_stage:
                    data['phase_type'].append(stage_name)
                    for event_type in data['order']:
                        if event_type in CPUType:
                            if event_type in self.merged_events_per_stage[
                                    stage_name]['CPU']['ALL']:
                                data[event_type].append(
                                    format_time(
                                        self.merged_events_per_stage[
                                            stage_name]['CPU']['ALL']
                                        [event_type]['total_time'], time_unit))
                            else:
                                data[event_type].append(0)
                        elif event_type in GPUType:
                            if event_type in self.merged_events_per_stage[
                                    stage_name]['GPU']['ALL']:
                                data[event_type].append(
                                    format_time(
                                        self.merged_events_per_stage[
                                            stage_name]['GPU']['ALL']
                                        [event_type]['total_time'], time_unit))
                            else:
                                data[event_type].append(0)
            newdata = OrderedDict()
            newdata['order'] = data['order']
            newdata['phase_type'] = data['phase_type']
            newdata['data'] = []
            for key in newdata['order']:
                newdata['data'].append(data[key])

        except Exception as e:
            print('error in get_event_type_model_perspective', e)
        return newdata

    def get_userdefined_perspective(self, time_unit):
        if not self.overview_parser:
            return
        data = OrderedDict()
        if self.overview_parser.has_device:
            data['column_name'] = [
                'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                'cpu_max_time', 'cpu_min_time', 'cpu_ratio', 'gpu_total_time',
                'gpu_avg_time', 'gpu_max_time', 'gpu_min_time', 'gpu_ratio'
            ]
            data['has_gpu'] = True
        else:
            data['column_name'] = [
                'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                'cpu_max_time', 'cpu_min_time', 'cpu_ratio'
            ]
            data['has_gpu'] = False
        data['events'] = []

        total_cpu_time = 0
        total_gpu_time = 0
        for name, event in self.userdefined_items.items():
            total_cpu_time += event.cpu_time
            total_gpu_time += event.general_gpu_time
        for name, event in self.userdefined_items.items():
            if self.overview_parser.has_device:
                data['events'].append({
                    "name":
                    name,
                    "calls":
                    event.call,
                    "cpu_total_time":
                    format_time(event.cpu_time, time_unit),
                    "cpu_avg_time":
                    format_time(event.avg_cpu_time, time_unit),
                    "cpu_max_time":
                    format_time(event.max_cpu_time, time_unit),
                    "cpu_min_time":
                    format_time(event.min_cpu_time, time_unit),
                    "cpu_ratio":
                    format_ratio(event.cpu_time / total_cpu_time
                                 if total_cpu_time != 0 else 0.0),
                    "gpu_total_time":
                    format_time(event.general_gpu_time, time_unit),
                    "gpu_avg_time":
                    format_time(event.avg_general_gpu_time, time_unit),
                    "gpu_max_time":
                    format_time(event.max_general_gpu_time, time_unit),
                    "gpu_min_time":
                    format_time(event.min_general_gpu_time, time_unit),
                    "gpu_ratio":
                    format_ratio(event.general_gpu_time / total_gpu_time
                                 if total_gpu_time != 0 else 0.0)
                })
            else:
                data['events'].append({
                    "name":
                    name,
                    "calls":
                    event.call,
                    "cpu_total_time":
                    format_time(event.cpu_time, time_unit),
                    "cpu_avg_time":
                    format_time(event.avg_cpu_time, time_unit),
                    "cpu_max_time":
                    format_time(event.max_cpu_time, time_unit),
                    "cpu_min_time":
                    format_time(event.min_cpu_time, time_unit),
                    "cpu_ratio":
                    format_ratio(event.cpu_time / total_cpu_time
                                 if total_cpu_time != 0 else 0.0),
                })
        return data

    def get_operator_pie(self, topk, time_unit='ms'):
        if not self.operator_parser:
            return
        data = OrderedDict()
        data['column_name'] = [
            "name", "calls", "total_time", "avg_time", "max_time", "min_time",
            "ratio"
        ]
        data['cpu'] = []
        if self.has_gpu:
            data['gpu'] = []
            gpu_sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].general_gpu_time,
                reverse=True)

        cpu_sorted_items = sorted(
            self.operator_items.items(),
            key=lambda x: x[1].cpu_time,
            reverse=True)

        if topk <= 0:
            cpu_items = cpu_sorted_items
            if self.has_gpu:
                gpu_items = gpu_sorted_items
        else:
            cpu_items = cpu_sorted_items[:topk]
            if self.has_gpu:
                gpu_items = gpu_sorted_items[:topk]
        total_cpu_time = 0.0
        total_gpu_time = 0.0
        for op_name, item in cpu_items:
            total_cpu_time += item.cpu_time
        if self.has_gpu:
            for op_name, item in gpu_items:
                total_gpu_time += item.general_gpu_time

        for op_name, item in cpu_items:
            cpu_stage_data = OrderedDict()
            cpu_stage_data['name'] = op_name
            cpu_stage_data['calls'] = item.call
            cpu_stage_data['total_time'] = format_time(item.cpu_time,
                                                       time_unit)
            cpu_stage_data['avg_time'] = format_time(item.avg_cpu_time,
                                                     time_unit)
            cpu_stage_data['max_time'] = format_time(item.max_cpu_time,
                                                     time_unit)
            cpu_stage_data['min_time'] = format_time(item.min_cpu_time,
                                                     time_unit)
            cpu_stage_data['ratio'] = format_ratio(
                item.cpu_time / total_cpu_time)
            data['cpu'].append(cpu_stage_data)
        if self.has_gpu:
            for op_name, item in gpu_items:
                gpu_stage_data = OrderedDict()
                gpu_stage_data['name'] = op_name
                gpu_stage_data['calls'] = item.call
                gpu_stage_data['total_time'] = format_time(
                    item.general_gpu_time, time_unit)
                gpu_stage_data['avg_time'] = format_time(
                    item.avg_general_gpu_time, time_unit)
                gpu_stage_data['max_time'] = format_time(
                    item.max_general_gpu_time, time_unit)
                gpu_stage_data['min_time'] = format_time(
                    item.min_general_gpu_time, time_unit)
                gpu_stage_data['ratio'] = format_ratio(
                    item.general_gpu_time / total_gpu_time)
                data['gpu'].append(gpu_stage_data)
        return data

    def get_operator_pie_expand(  # noqa: C901
            self, topk, device_type, time_unit):
        if not self.operator_parser:
            return
        data = OrderedDict()
        data['order'] = []
        data['phase_type'] = []
        data['data'] = []
        if device_type == 'cpu':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].cpu_time,
                reverse=True)

        else:
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].general_gpu_time,
                reverse=True)
        if topk <= 0 or topk >= 20:
            items = sorted_items[:20]
            other_items = sorted_items[20:]
        else:
            items = sorted_items[:topk]
            other_items = []
        data['order'].extend(
            ['infer_shape', 'compute', 'node_creation', 'others'])
        inner_op_data = defaultdict(list)
        for op_name, event in items:
            data['phase_type'].append(op_name)
            innerop_knownsub_times = 0
            have_innerop_name = set()
            for innerop_name, item in event.operator_inners.items():
                if 'infer_shape' in innerop_name or 'infer_meta' in innerop_name:
                    innerop_name = 'infer_shape'
                elif 'compute' in innerop_name:
                    innerop_name = 'compute'
                elif 'node_creation' in innerop_name:
                    innerop_name = 'node_creation'
                else:
                    continue
                have_innerop_name.add(innerop_name)
                if device_type == 'cpu':
                    inner_op_data[innerop_name].append(
                        format_time(item.cpu_time, time_unit))
                    innerop_knownsub_times += item.cpu_time
                else:
                    inner_op_data[innerop_name].append(
                        format_time(item.general_gpu_time, time_unit))
                    innerop_knownsub_times += item.general_gpu_time
            if device_type == 'cpu':
                inner_op_data['others'].append(
                    format_time(event.cpu_time - innerop_knownsub_times,
                                time_unit))
            else:
                inner_op_data['others'].append(
                    format_time(
                        event.general_gpu_time - innerop_knownsub_times,
                        time_unit))
            have_innerop_name.add('others')
            for innerop_name in data['order']:
                if innerop_name in have_innerop_name:
                    continue
                else:
                    inner_op_data[innerop_name].append(0)
        if other_items:
            innerop_knownsub_times = 0
            total_event_times = 0
            data['phase_type'].append('others')
            others_time = defaultdict(float)
            for op_name, event in other_items:
                for innerop_name, item in event.operator_inners.items():
                    if 'infer_shape' in innerop_name:
                        innerop_name = 'infer_shape'
                    elif 'compute' in innerop_name:
                        innerop_name = 'compute'
                    elif 'node_creation' in innerop_name:
                        innerop_name = 'node_creation'
                    else:
                        continue
                    if device_type == 'cpu':
                        others_time[innerop_name] += item.cpu_time
                        innerop_knownsub_times += item.cpu_time
                    else:
                        others_time[innerop_name] += item.general_gpu_time
                        innerop_knownsub_times += item.general_gpu_time
                if device_type == 'cpu':
                    total_event_times += event.cpu_time
                else:
                    total_event_times += event.general_gpu_time
            others_time['others'] = total_event_times - innerop_knownsub_times
            for innerop_name in data['order']:
                if innerop_name not in others_time:
                    others_time[innerop_name] = 0.0
                inner_op_data[innerop_name].append(
                    format_time(others_time[innerop_name], time_unit))

        for innerop_name in data['order']:
            data['data'].append(inner_op_data[innerop_name])
        return data

    def get_operator_table(  # noqa: C901  Todo: Optimize code
            self,
            group_by='op_name',
            search_name=None,
            time_unit='ms'):
        if not self.operator_parser:
            return

        def get_children_data(event):
            datas = []
            for innerop_name, item in event.operator_inners.items():

                if item.cpu_time == 0:
                    cpu_ratio = 0
                else:
                    cpu_ratio = float(item.cpu_time) / event.cpu_time
                if item.general_gpu_time == 0:
                    gpu_ratio = 0
                else:
                    gpu_ratio = float(
                        item.general_gpu_time) / event.general_gpu_time
                data = {
                    "name":
                    innerop_name,
                    "calls":
                    item.call,
                    "cpu_total_time":
                    format_time(item.cpu_time, time_unit),
                    "cpu_avg_time":
                    format_time(item.avg_cpu_time, time_unit),
                    "cpu_max_time":
                    format_time(item.max_cpu_time, time_unit),
                    "cpu_min_time":
                    format_time(item.min_cpu_time, time_unit),
                    "cpu_ratio":
                    format_ratio(cpu_ratio),
                    "gpu_total_time":
                    format_time(item.general_gpu_time, time_unit),
                    "gpu_avg_time":
                    format_time(item.avg_general_gpu_time, time_unit),
                    "gpu_max_time":
                    format_time(item.max_general_gpu_time, time_unit),
                    "gpu_min_time":
                    format_time(item.min_general_gpu_time, time_unit),
                    "gpu_ratio":
                    format_ratio(gpu_ratio)
                }
                datas.append(data)
            return datas

        data = OrderedDict()
        data['events'] = []
        total_cpu_time = 0
        total_gpu_time = 0
        for name, event in self.operator_items.items():
            total_cpu_time += event.cpu_time
            total_gpu_time += event.general_gpu_time
        if not search_name:
            if group_by == 'op_name':
                if self.has_gpu:
                    data['column_name'] = [
                        'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                        'cpu_max_time', 'cpu_min_time', 'cpu_ratio',
                        'gpu_total_time', 'gpu_avg_time', 'gpu_max_time',
                        'gpu_min_time', 'gpu_ratio'
                    ]
                    data['has_gpu'] = True
                else:
                    data['column_name'] = [
                        'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                        'cpu_max_time', 'cpu_min_time', 'cpu_ratio'
                    ]
                    data['has_gpu'] = False
                if self.has_gpu:
                    sorted_items = sorted(
                        self.operator_items.items(),
                        key=lambda x: x[1].general_gpu_time,
                        reverse=True)
                else:
                    sorted_items = sorted(
                        self.operator_items.items(),
                        key=lambda x: x[1].cpu_time,
                        reverse=True)
                for name, event in sorted_items:
                    if self.has_gpu:
                        children_events = get_children_data(event)
                        if children_events:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "children":
                                children_events,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0),
                                "gpu_total_time":
                                format_time(event.general_gpu_time, time_unit),
                                "gpu_avg_time":
                                format_time(event.avg_general_gpu_time,
                                            time_unit),
                                "gpu_max_time":
                                format_time(event.max_general_gpu_time,
                                            time_unit),
                                "gpu_min_time":
                                format_time(event.min_general_gpu_time,
                                            time_unit),
                                "gpu_ratio":
                                format_ratio(event.general_gpu_time /
                                             total_gpu_time
                                             if total_gpu_time != 0 else 0.0)
                            })
                        else:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0),
                                "gpu_total_time":
                                format_time(event.general_gpu_time, time_unit),
                                "gpu_avg_time":
                                format_time(event.avg_general_gpu_time,
                                            time_unit),
                                "gpu_max_time":
                                format_time(event.max_general_gpu_time,
                                            time_unit),
                                "gpu_min_time":
                                format_time(event.min_general_gpu_time,
                                            time_unit),
                                "gpu_ratio":
                                format_ratio(event.general_gpu_time /
                                             total_gpu_time
                                             if total_gpu_time != 0 else 0.0)
                            })
                    else:
                        children_events = get_children_data(event)
                        if children_events:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "children":
                                children_events,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0)
                            })
                        else:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0)
                            })

            else:
                if self.has_gpu:
                    data['column_name'] = [
                        'name', 'calls', 'input_shape', 'cpu_total_time',
                        'cpu_avg_time', 'cpu_max_time', 'cpu_min_time',
                        'cpu_ratio', 'gpu_total_time', 'gpu_avg_time',
                        'gpu_max_time', 'gpu_min_time', 'gpu_ratio'
                    ]
                    data['has_gpu'] = True
                else:
                    data['column_name'] = [
                        'name', 'calls', 'input_shape', 'cpu_total_time',
                        'cpu_avg_time', 'cpu_max_time', 'cpu_min_time',
                        'cpu_ratio'
                    ]
                    data['has_gpu'] = False
                new_arrange_data = {}
                for op_name, items_with_input_shape in self.operator_items_with_input_shape.items(
                ):
                    for input_shape, item in items_with_input_shape.items():
                        new_arrange_data[(op_name, input_shape)] = item
                if self.has_gpu:
                    sorted_items = sorted(
                        new_arrange_data.items(),
                        key=lambda x: x[1].general_gpu_time,
                        reverse=True)
                else:
                    sorted_items = sorted(
                        new_arrange_data.items(),
                        key=lambda x: x[1].cpu_time,
                        reverse=True)
                for (name, input_shape), event in sorted_items:
                    if not input_shape:
                        shape_string = []
                    else:
                        shapes = input_shape.split('\t')[:-1]
                        shape_string = [
                            '{}:{}'.format(*shape.split('-'))
                            for shape in shapes
                        ]
                    if self.has_gpu:
                        children_events = get_children_data(event)
                        if children_events:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "children":
                                children_events,
                                "input_shape":
                                shape_string,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0),
                                "gpu_total_time":
                                format_time(event.general_gpu_time, time_unit),
                                "gpu_avg_time":
                                format_time(event.avg_general_gpu_time,
                                            time_unit),
                                "gpu_max_time":
                                format_time(event.max_general_gpu_time,
                                            time_unit),
                                "gpu_min_time":
                                format_time(event.min_general_gpu_time,
                                            time_unit),
                                "gpu_ratio":
                                format_ratio(event.general_gpu_time /
                                             total_gpu_time
                                             if total_gpu_time != 0 else 0.0)
                            })
                        else:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "input_shape":
                                shape_string,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0),
                                "gpu_total_time":
                                format_time(event.general_gpu_time, time_unit),
                                "gpu_avg_time":
                                format_time(event.avg_general_gpu_time,
                                            time_unit),
                                "gpu_max_time":
                                format_time(event.max_general_gpu_time,
                                            time_unit),
                                "gpu_min_time":
                                format_time(event.min_general_gpu_time,
                                            time_unit),
                                "gpu_ratio":
                                format_ratio(event.general_gpu_time /
                                             total_gpu_time
                                             if total_gpu_time != 0 else 0.0)
                            })
                    else:
                        children_events = get_children_data(event)
                        if children_events:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "children":
                                children_events,
                                "input_shape":
                                shape_string,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0)
                            })
                        else:
                            data['events'].append({
                                "name":
                                name,
                                "calls":
                                event.call,
                                "input_shape":
                                shape_string,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0)
                            })

        else:
            if self.has_gpu:
                sorted_items = sorted(
                    self.operator_items.items(),
                    key=lambda x: x[1].general_gpu_time,
                    reverse=True)
            else:
                sorted_items = sorted(
                    self.operator_items.items(),
                    key=lambda x: x[1].cpu_time,
                    reverse=True)

            results = []
            for op_name, item in sorted_items:
                if search_name in op_name:
                    results.append(op_name)

            if group_by == 'op_name':
                if self.has_gpu:
                    data['column_name'] = [
                        'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                        'cpu_max_time', 'cpu_min_time', 'cpu_ratio',
                        'gpu_total_time', 'gpu_avg_time', 'gpu_max_time',
                        'gpu_min_time', 'gpu_ratio'
                    ]
                    data['has_gpu'] = True
                else:
                    data['column_name'] = [
                        'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                        'cpu_max_time', 'cpu_min_time', 'cpu_ratio'
                    ]
                    data['has_gpu'] = False
                for op_name in results:
                    event = self.operator_items[op_name]
                    if self.has_gpu:
                        children_events = get_children_data(event)
                        if children_events:
                            data['events'].append({
                                "name":
                                op_name,
                                "calls":
                                event.call,
                                "children":
                                children_events,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0),
                                "gpu_total_time":
                                format_time(event.general_gpu_time, time_unit),
                                "gpu_avg_time":
                                format_time(event.avg_general_gpu_time,
                                            time_unit),
                                "gpu_max_time":
                                format_time(event.max_general_gpu_time,
                                            time_unit),
                                "gpu_min_time":
                                format_time(event.min_general_gpu_time,
                                            time_unit),
                                "gpu_ratio":
                                format_ratio(event.general_gpu_time /
                                             total_gpu_time
                                             if total_gpu_time != 0 else 0.0)
                            })
                        else:
                            data['events'].append({
                                "name":
                                op_name,
                                "calls":
                                event.call,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0),
                                "gpu_total_time":
                                format_time(event.general_gpu_time, time_unit),
                                "gpu_avg_time":
                                format_time(event.avg_general_gpu_time,
                                            time_unit),
                                "gpu_max_time":
                                format_time(event.max_general_gpu_time,
                                            time_unit),
                                "gpu_min_time":
                                format_time(event.min_general_gpu_time,
                                            time_unit),
                                "gpu_ratio":
                                format_ratio(event.general_gpu_time /
                                             total_gpu_time
                                             if total_gpu_time != 0 else 0.0)
                            })

                    else:
                        children_events = get_children_data(event)
                        if children_events:
                            data['events'].append({
                                "name":
                                op_name,
                                "calls":
                                event.call,
                                "children":
                                children_events,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0)
                            })
                        else:
                            data['events'].append({
                                "name":
                                op_name,
                                "calls":
                                event.call,
                                "cpu_total_time":
                                format_time(event.cpu_time, time_unit),
                                "cpu_avg_time":
                                format_time(event.avg_cpu_time, time_unit),
                                "cpu_max_time":
                                format_time(event.max_cpu_time, time_unit),
                                "cpu_min_time":
                                format_time(event.min_cpu_time, time_unit),
                                "cpu_ratio":
                                format_ratio(event.cpu_time / total_cpu_time
                                             if total_cpu_time != 0 else 0.0)
                            })

            else:
                if self.has_gpu:
                    data['column_name'] = [
                        'name', 'calls', 'input_shape', 'cpu_total_time',
                        'cpu_avg_time', 'cpu_max_time', 'cpu_min_time',
                        'cpu_ratio', 'gpu_total_time', 'gpu_avg_time',
                        'gpu_max_time', 'gpu_min_time', 'gpu_ratio'
                    ]
                    data['has_gpu'] = True
                else:
                    data['column_name'] = [
                        'name', 'calls', 'input_shape', 'cpu_total_time',
                        'cpu_avg_time', 'cpu_max_time', 'cpu_min_time',
                        'cpu_ratio'
                    ]
                    data['has_gpu'] = False
                for op_name in results:
                    for input_shape, event in self.operator_items_with_input_shape[
                            op_name].items():
                        if not input_shape:
                            shape_string = []
                        else:
                            shapes = input_shape.split('\t')[:-1]
                            shape_string = [
                                '{}:{}'.format(*shape.split('-'))
                                for shape in shapes
                            ]
                        if self.has_gpu:
                            children_events = get_children_data(event)
                            if children_events:
                                data['events'].append({
                                    "name":
                                    op_name,
                                    "calls":
                                    event.call,
                                    "children":
                                    children_events,
                                    "input_shape":
                                    shape_string,
                                    "cpu_total_time":
                                    format_time(event.cpu_time, time_unit),
                                    "cpu_avg_time":
                                    format_time(event.avg_cpu_time, time_unit),
                                    "cpu_max_time":
                                    format_time(event.max_cpu_time, time_unit),
                                    "cpu_min_time":
                                    format_time(event.min_cpu_time, time_unit),
                                    "cpu_ratio":
                                    format_ratio(event.cpu_time /
                                                 total_cpu_time if
                                                 total_cpu_time != 0 else 0.0),
                                    "gpu_total_time":
                                    format_time(event.general_gpu_time,
                                                time_unit),
                                    "gpu_avg_time":
                                    format_time(event.avg_general_gpu_time,
                                                time_unit),
                                    "gpu_max_time":
                                    format_time(event.max_general_gpu_time,
                                                time_unit),
                                    "gpu_min_time":
                                    format_time(event.min_general_gpu_time,
                                                time_unit),
                                    "gpu_ratio":
                                    format_ratio(event.general_gpu_time /
                                                 total_gpu_time if
                                                 total_gpu_time != 0 else 0.0)
                                })
                            else:
                                data['events'].append({
                                    "name":
                                    op_name,
                                    "calls":
                                    event.call,
                                    "input_shape":
                                    shape_string,
                                    "cpu_total_time":
                                    format_time(event.cpu_time, time_unit),
                                    "cpu_avg_time":
                                    format_time(event.avg_cpu_time, time_unit),
                                    "cpu_max_time":
                                    format_time(event.max_cpu_time, time_unit),
                                    "cpu_min_time":
                                    format_time(event.min_cpu_time, time_unit),
                                    "cpu_ratio":
                                    format_ratio(event.cpu_time /
                                                 total_cpu_time if
                                                 total_cpu_time != 0 else 0.0),
                                    "gpu_total_time":
                                    format_time(event.general_gpu_time,
                                                time_unit),
                                    "gpu_avg_time":
                                    format_time(event.avg_general_gpu_time,
                                                time_unit),
                                    "gpu_max_time":
                                    format_time(event.max_general_gpu_time,
                                                time_unit),
                                    "gpu_min_time":
                                    format_time(event.min_general_gpu_time,
                                                time_unit),
                                    "gpu_ratio":
                                    format_ratio(event.general_gpu_time /
                                                 total_gpu_time if
                                                 total_gpu_time != 0 else 0.0)
                                })
                        else:
                            children_events = get_children_data(event)
                            if children_events:
                                data['events'].append({
                                    "name":
                                    op_name,
                                    "calls":
                                    event.call,
                                    "children":
                                    get_children_data(event),
                                    "input_shape":
                                    shape_string,
                                    "cpu_total_time":
                                    format_time(event.cpu_time, time_unit),
                                    "cpu_avg_time":
                                    format_time(event.avg_cpu_time, time_unit),
                                    "cpu_max_time":
                                    format_time(event.max_cpu_time, time_unit),
                                    "cpu_min_time":
                                    format_time(event.min_cpu_time, time_unit),
                                    "cpu_ratio":
                                    format_ratio(event.cpu_time /
                                                 total_cpu_time if
                                                 total_cpu_time != 0 else 0.0)
                                })
                            else:
                                data['events'].append({
                                    "name":
                                    op_name,
                                    "calls":
                                    event.call,
                                    "input_shape":
                                    shape_string,
                                    "cpu_total_time":
                                    format_time(event.cpu_time, time_unit),
                                    "cpu_avg_time":
                                    format_time(event.avg_cpu_time, time_unit),
                                    "cpu_max_time":
                                    format_time(event.max_cpu_time, time_unit),
                                    "cpu_min_time":
                                    format_time(event.min_cpu_time, time_unit),
                                    "cpu_ratio":
                                    format_ratio(event.cpu_time /
                                                 total_cpu_time if
                                                 total_cpu_time != 0 else 0.0)
                                })
        return data

    def get_kernel_pie(self, topk, time_unit='ms'):
        if not self.kernel_parser:
            return
        data = OrderedDict()
        data['column_name'] = [
            "name", "calls", "total_time", "avg_time", "max_time", "min_time",
            "mean blocks per sm", "mean est achieved occupancy",
            "tensor core used", "ratio"
        ]

        data['events'] = []

        sorted_items = sorted(
            self.kernel_items.items(),
            key=lambda x: x[1].gpu_time,
            reverse=True)

        if topk <= 0:
            items = sorted_items
        else:
            items = sorted_items[:topk]

        total_gpu_time = 0.0
        for kernel_name, item in items:
            total_gpu_time += item.gpu_time

        for kernel_name, item in items:
            gpu_stage_data = OrderedDict()
            gpu_stage_data['name'] = kernel_name
            gpu_stage_data['calls'] = item.call
            gpu_stage_data['total_time'] = format_time(item.gpu_time,
                                                       time_unit)
            gpu_stage_data['avg_time'] = format_time(item.avg_gpu_time,
                                                     time_unit)
            gpu_stage_data['max_time'] = format_time(item.max_gpu_time,
                                                     time_unit)
            gpu_stage_data['min_time'] = format_time(item.min_gpu_time,
                                                     time_unit)
            gpu_stage_data['mean blocks per sm'] = format_float(
                item.sum_blocks_per_sm / item.call)
            gpu_stage_data['mean est achieved occupancy'] = format_float(
                item.sum_occupancy / item.call)
            gpu_stage_data['tensor core used'] = item.tensorcore_used
            gpu_stage_data['ratio'] = format_ratio(
                item.gpu_time / total_gpu_time)
            data['events'].append(gpu_stage_data)
        return data

    def get_kernel_table(self, group_by='', search_name=None, time_unit='ms'):
        if not self.kernel_parser:
            return
        data = OrderedDict()
        data['events'] = []
        total_gpu_time = 0
        for name, event in self.kernel_items.items():
            total_gpu_time += event.gpu_time
        if not search_name:
            if group_by == 'kernel_name':
                data['column_name'] = [
                    "name", "calls", "total_time", "avg_time", "max_time",
                    "min_time", "mean blocks per sm",
                    "mean est achieved occupancy", "tensor core used", "ratio"
                ]
                sorted_items = sorted(
                    self.kernel_items.items(),
                    key=lambda x: x[1].gpu_time,
                    reverse=True)
                for name, item in sorted_items:
                    gpu_stage_data = OrderedDict()
                    gpu_stage_data['name'] = name
                    gpu_stage_data['calls'] = item.call
                    gpu_stage_data['total_time'] = format_time(
                        item.gpu_time, time_unit)
                    gpu_stage_data['avg_time'] = format_time(
                        item.avg_gpu_time, time_unit)
                    gpu_stage_data['max_time'] = format_time(
                        item.max_gpu_time, time_unit)
                    gpu_stage_data['min_time'] = format_time(
                        item.min_gpu_time, time_unit)
                    gpu_stage_data['mean blocks per sm'] = format_float(
                        item.sum_blocks_per_sm / item.call)
                    gpu_stage_data[
                        'mean est achieved occupancy'] = format_float(
                            item.sum_occupancy / item.call)
                    gpu_stage_data['tensor core used'] = item.tensorcore_used
                    gpu_stage_data['ratio'] = format_ratio(
                        item.gpu_time / total_gpu_time)
                    data['events'].append(gpu_stage_data)
            else:
                data['column_name'] = [
                    "name", "calls", "operator", "grid", "block",
                    "register per thread", "shared memory", "total_time",
                    "avg_time", "max_time", "min_time", "mean blocks per sm",
                    "mean est achieved occupancy", "tensor core used", "ratio"
                ]
                new_arrange_data = {}
                for name, items_with_attributes in self.kernel_items_with_op_name_attributes.items(
                ):
                    for attributes, item in items_with_attributes.items():
                        new_arrange_data[(name, attributes)] = item
                sorted_items = sorted(
                    new_arrange_data.items(),
                    key=lambda x: x[1].gpu_time,
                    reverse=True)
                for (name, attributes), item in sorted_items:
                    operator, grid, block, register_per_thread, shared_memory = attributes.split(
                        '-')
                    gpu_stage_data = OrderedDict()
                    gpu_stage_data['name'] = name
                    gpu_stage_data['calls'] = item.call
                    gpu_stage_data['operator'] = operator
                    gpu_stage_data['grid'] = grid
                    gpu_stage_data['block'] = block
                    gpu_stage_data['register per thread'] = register_per_thread
                    gpu_stage_data['shared memory'] = shared_memory
                    gpu_stage_data['total_time'] = format_time(
                        item.gpu_time, time_unit)
                    gpu_stage_data['avg_time'] = format_time(
                        item.avg_gpu_time, time_unit)
                    gpu_stage_data['max_time'] = format_time(
                        item.max_gpu_time, time_unit)
                    gpu_stage_data['min_time'] = format_time(
                        item.min_gpu_time, time_unit)
                    gpu_stage_data['mean blocks per sm'] = format_float(
                        item.sum_blocks_per_sm / item.call)
                    gpu_stage_data[
                        'mean est achieved occupancy'] = format_float(
                            item.sum_occupancy / item.call)
                    gpu_stage_data['tensor core used'] = item.tensorcore_used
                    gpu_stage_data['ratio'] = format_ratio(
                        item.gpu_time / total_gpu_time)
                    data['events'].append(gpu_stage_data)

        else:
            sorted_items = sorted(
                self.kernel_items.items(),
                key=lambda x: x[1].gpu_time,
                reverse=True)
            results = []
            for kernel_name, item in sorted_items:
                if search_name in kernel_name:
                    results.append(kernel_name)

            if group_by == 'kernel_name':
                data['column_name'] = [
                    "name", "calls", "total_time", "avg_time", "max_time",
                    "min_time", "mean blocks per sm",
                    "mean est achieved occupancy", "tensor core used", "ratio"
                ]
                for kernel_name in results:
                    item = self.kernel_items[kernel_name]
                    gpu_stage_data = OrderedDict()
                    gpu_stage_data['name'] = kernel_name
                    gpu_stage_data['calls'] = item.call
                    gpu_stage_data['total_time'] = format_time(
                        item.gpu_time, time_unit)
                    gpu_stage_data['avg_time'] = format_time(
                        item.avg_gpu_time, time_unit)
                    gpu_stage_data['max_time'] = format_time(
                        item.max_gpu_time, time_unit)
                    gpu_stage_data['min_time'] = format_time(
                        item.min_gpu_time, time_unit)
                    gpu_stage_data['mean blocks per sm'] = format_float(
                        item.sum_blocks_per_sm / item.call)
                    gpu_stage_data[
                        'mean est achieved occupancy'] = format_float(
                            item.sum_occupancy / item.call)
                    gpu_stage_data['tensor core used'] = item.tensorcore_used
                    gpu_stage_data['ratio'] = format_ratio(
                        item.gpu_time / total_gpu_time)
                    data['events'].append(gpu_stage_data)
            else:
                for kernel_name in results:
                    for items_with_attributes, item in self.kernel_items_with_op_name_attributes[
                            kernel_name].items():
                        operator, grid, block, register_per_thread, shared_memory = attributes.split(
                            '-')
                        gpu_stage_data = OrderedDict()
                        gpu_stage_data['name'] = kernel_name
                        gpu_stage_data['calls'] = item.call
                        gpu_stage_data['operator'] = operator
                        gpu_stage_data['grid'] = grid
                        gpu_stage_data['block'] = block
                        gpu_stage_data[
                            'register per thread'] = register_per_thread
                        gpu_stage_data['shared memory'] = shared_memory
                        gpu_stage_data['total_time'] = format_time(
                            item.gpu_time, time_unit)
                        gpu_stage_data['avg_time'] = format_time(
                            item.avg_gpu_time, time_unit)
                        gpu_stage_data['max_time'] = format_time(
                            item.max_gpu_time, time_unit)
                        gpu_stage_data['min_time'] = format_time(
                            item.min_gpu_time, time_unit)
                        gpu_stage_data['mean blocks per sm'] = format_float(
                            item.sum_blocks_per_sm / item.call)
                        gpu_stage_data[
                            'mean est achieved occupancy'] = format_float(
                                item.sum_occupancy / item.call)
                        gpu_stage_data[
                            'tensor core used'] = item.tensorcore_used
                        gpu_stage_data['ratio'] = format_ratio(
                            item.gpu_time / total_gpu_time)
                        data['events'].append(gpu_stage_data)
        return data

    def get_kernel_tc_pie(self, topk, time_unit='ms'):
        if not self.kernel_parser:
            return
        data = OrderedDict()
        data['column_name'] = ["name", "calls", "ratio"]

        data['events'] = []

        sorted_items = sorted(
            self.kernel_items.items(),
            key=lambda x: x[1].gpu_time,
            reverse=True)

        if topk <= 0:
            items = sorted_items
        else:
            items = sorted_items[:topk]

        total_calls = 0.0
        tensorcore_calls = 0.0
        for kernel_name, item in items:
            if item.tensorcore_used:
                tensorcore_calls += item.call
            total_calls += item.call

        data['events'].append({
            "name":
            "Tensor core used",
            "calls":
            tensorcore_calls,
            "ratio":
            format_ratio(tensorcore_calls / total_calls)
        })
        data['events'].append({
            "name":
            "Tensor core unused",
            "calls":
            total_calls - tensorcore_calls,
            "ratio":
            format_ratio((total_calls - tensorcore_calls) / total_calls)
        })
        return data

    def get_trace_data(self):
        if not self.trace_parser:
            return
        return self.trace_parser.content

    def get_memory_devices(self):
        if not self.memory_parser:
            return
        data = []
        for device in self.memory_curve.keys():
            data.append({
                "device":
                device,
                "min_size":
                format_memory(self.size_ranges[device][0], 'KB'),
                "max_size":
                format_memory(self.size_ranges[device][1], 'KB'),
                "max_allocation_size":
                format_memory(self.peak_allocation_values[device], 'KB'),
            })
        return data

    def get_memory_curve(self, device_type, time_unit='ms'):
        if not self.memory_parser:
            return
        curves = self.memory_curve[device_type]
        data = {}
        data['name'] = {
            'Allocated': '已分配',
            'Reserved': '已预留',
            'PeakAllocated': '最大已分配',
            'PeakReserved': '最大已预留'
        }
        for key, events in curves.items():
            data[key] = []
            sorted_events = sorted(events, key=lambda x: x[0])
            for item in sorted_events:
                timestamp = item[0]
                size = item[1]
                event_name = item[2]
                data[key].append([
                    format_time(timestamp, time_unit),
                    format_memory(size, 'KB'), event_name
                ])
        return data

    def get_memory_events(self,
                          device_type,
                          min_size=0,
                          max_size=float('inf'),
                          search_name=None,
                          time_unit='ms'):
        if not self.memory_parser:
            return
        data = {}
        data['column_name'] = [
            'MemoryAddr', 'MemoryType', 'AllocatedEvent', 'AllocatedTimestamp',
            'FreeEvent', 'FreeTimestamp', 'Duration', 'Size'
        ]
        data['data'] = []
        paired_event_list = self.paired_events[device_type]

        def filter_func(item):
            nonlocal min_size
            nonlocal max_size
            nonlocal search_name
            size = format_memory(item[-1], 'KB')
            if not search_name:
                if size >= min_size and size <= max_size:
                    return True
            else:
                if size >= min_size and size <= max_size:
                    if item[2]:
                        if search_name in item[2]:
                            return True
                    if item[4]:
                        if search_name in item[4]:
                            return True
            return False

        paired_event_list = filter(filter_func, paired_event_list)
        paired_event_list = sorted(paired_event_list, key=lambda x: x[-1])
        if not paired_event_list:
            return data
        duration = None
        for item in paired_event_list:
            if item[3] and item[5]:
                duration = item[5] - item[3]
            else:
                duration = None
            data['data'].append({
                "MemoryAddr":
                item[0],
                "MemoryType":
                item[1],
                "AllocatedEvent":
                item[2],
                "AllocatedTimestamp":
                format_time(item[3], time_unit) if item[3] else None,
                "FreeEvent":
                item[4],
                "FreeTimestamp":
                format_time(item[5], time_unit) if item[5] else None,
                "Duration":
                format_time(duration, time_unit)
                if duration is not None else None,
                "Size":
                format_memory(item[6], 'KB')
            })
        return data

    def get_op_memory_events(self, device_type, search_name=None):
        if not self.memory_parser:
            return
        data = {}
        data['column_name'] = [
            'EventName', 'MemoryType', 'AllocationCount', 'FreeCount',
            'AllocationSize', 'FreeSize', 'IncreasedSize'
        ]
        data['data'] = []
        allocated_events = self.allocated_items[device_type]

        def filter_func(item):
            nonlocal search_name
            if not search_name:
                return True
            else:
                if search_name in item[0]:
                    return True
            return False

        reserved_events = self.reserved_items[device_type]
        all_events = [(key, item) for key, item in allocated_events.items()]
        all_events.extend(
            [(key, item) for key, item in reserved_events.items()])
        if search_name:
            all_events = filter(filter_func, all_events)
        sorted_items = sorted(
            all_events, key=lambda x: x[1].increase_size, reverse=True)
        if not sorted_items:
            return data
        for event_name, item in sorted_items:
            data['data'].append({
                'EventName':
                event_name,
                'MemoryType':
                item.memory_type,
                'AllocationCount':
                item.allocation_count,
                'FreeCount':
                item.free_count,
                'AllocationSize':
                format_memory(item.allocation_size, 'KB'),
                'FreeSize':
                format_memory(item.free_size, 'KB'),
                'IncreasedSize':
                format_memory(item.increase_size, 'KB')
            })
        return data


class DistributedProfilerData:
    '''
    Hold data for distributed view.
    Aggregate all data for distributed in ProfileData object.
    '''

    def __init__(self, run, span, profile_datas):
        self.run = run
        self.span = span
        self.profile_datas = profile_datas

    def get_distributed_info(self):
        data = []
        for profile_data in self.profile_datas:
            device_infos = profile_data.device_infos
            if not device_infos:
                return data
            if not profile_data.has_gpu:
                continue
            gpu_id = int(next(iter(profile_data.gpu_ids)))
            data.append({
                'worker_name':
                profile_data.worker_name,
                'process_id':
                'pid: {}'.format(profile_data.process_id),
                'device_id':
                'GPU{}'.format(gpu_id),
                'name':
                device_infos[gpu_id]['name'],
                'memory':
                "{} GB".format(
                    format_memory(device_infos[gpu_id]['totalGlobalMem'],
                                  'GB')),
                'computeCapability':
                '{}.{}'.format(device_infos[gpu_id]['computeMajor'],
                               device_infos[gpu_id]['computeMinor']),
                'utilization':
                '{}%'.format(format_ratio(profile_data.gpu_ulitization))
            })
        return data

    def get_distributed_histogram(self, step, time_unit='ms'):
        data = {}
        data['order'] = [
            "ProfileStep", "Communication", "Computation", "Overlap", "Others"
        ]
        data['worker_name'] = []
        data['data'] = []
        new_data = defaultdict(list)
        for profile_data in self.profile_datas:
            if not profile_data.distributed_parser:
                continue
            data['worker_name'].append(profile_data.worker_name)
            if step != 'All':
                new_data['ProfileStep'].append(
                    format_time(
                        profile_data.model_perspective_items['ProfileStep'].
                        cpu_times[step], time_unit))
            else:
                new_data['ProfileStep'].append(
                    format_time(
                        profile_data.model_perspective_items['ProfileStep'].
                        cpu_time, time_unit))
            new_data['Communication'].append(
                format_time(
                    profile_data.distributed_time[step]['communication_time'],
                    time_unit))
            new_data['Computation'].append(
                format_time(
                    profile_data.distributed_time[step]['computation_time'],
                    time_unit))
            new_data['Overlap'].append(
                format_time(
                    profile_data.distributed_time[step]['overlap_time'],
                    time_unit))
            new_data['Others'].append(
                format_time(profile_data.distributed_time[step]['others_time'],
                            time_unit))
        for order in data['order']:
            data['data'].append(new_data[order])
        return data

    def get_distributed_steps(self):
        for profile_data in self.profile_datas:
            if not profile_data.distributed_parser:
                continue
            steps = list(profile_data.distributed_time.keys())
            final_steps = ['All'] + sorted(
                [int(step) for step in steps if step != 'All'])
            return final_steps
