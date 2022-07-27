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
# from .parser.distributed_parser import DistributedParser
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

# from .parser.memory_parser import MemoryParser
# from .parser.parse_data import DataParser


def filter_type(node_trees):
    nodelists = traverse_tree(node_trees)
    for thread_id, nodelist in nodelists.items():
        for node in nodelist:
            if not isinstance(node.type, str):
                node.type = str(node.type).split('.')[1]


class ProfileData:
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
        # kernel parser
        self.kernel_parser = KernelParser()
        self.kernel_parser.parse(traverse_tree(self.node_trees))
        self.kernel_items = self.kernel_parser.kernel_items
        self.kernel_items_with_op_name_attributes = self.kernel_parser.kernel_items_with_op_name_attributes
        self.occupancy = self.kernel_parser.occupancy
        self.sm_efficiency = self.kernel_parser.sm_efficiency
        self.tensorcore_ratio = self.kernel_parser.tensor_core_ratio
        self.gpu_ids = self.kernel_parser.gpu_ids
        # distributed parser
        self.distributed_parser = DistributedParser()
        self.distributed_parser.parse(self.node_trees)
        self.distributed_time = self.distributed_parser.steps_time

        # memory parser
        self.memory_parser = MemoryParser()
        self.memory_parser.parse(self.node_trees)
        self.memory_curve = self.memory_parser.memory_curve
        self.allocated_items = self.memory_parser.allocated_items
        self.reserved_items = self.memory_parser.reserved_items
        self.paired_events = self.memory_parser.paired_events
        self.size_ranges = self.memory_parser.size_ranges
        # print(self.memory_curve)
        # cache data
        self.cache = defaultdict(lambda: defaultdict(list))

    def get_views(self):
        '''
        Return available views this profile data can provide.
        '''
        views = ['Overview']
        if self.operator_items:
            views.append('Operator')
        if self.kernel_items:
            views.append('GPU Kernel')
        views.append('Trace')
        return views

    # profiler/overview/environment
    #   {
    #  "number_workers": 5,
    #  "device_type": "GPU",
    #  "CPU": {
    #  "process_utilization": 78,
    #  "system_utilization": 30
    #  }
    #  "GPU": {
    #   "name": "Tesla P40",
    #   "memory": "22.3 GB"
    #   "compute_capability": "6.1",
    #   "utilization": 50,
    #   "sm_efficiency": 57,
    #   "achieved_occupancy": 33,
    #   "tensor_core_percentage": 55,
    #  }
    # }

    def get_device_infos(self):
        if not self.gpu_ids:
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
            return {
                "device_type": device_type,
                "CPU": {
                    "process_utilization":
                    format_ratio(
                        float(self.extra_infos["Process Cpu Utilization"])),
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
                    '{}.{}'.format(self.device_infos[gpu_id]['computeMajor'],
                                   self.device_infos[gpu_id]['computeMinor']),
                    "utilization":
                    format_ratio(self.gpu_ulitization),
                    "sm_efficiency":
                    format_ratio(self.sm_efficiency),
                    "achieved_occupancy":
                    format_ratio(self.occupancy),
                    "tensor_core_percentage":
                    format_ratio(self.tensorcore_ratio)
                }
            }

    # profiler/overview/model_perspective
    #   {
    #   "column_name": ["total_time",  "max_time", "min_time", "avg_time", "ratio"]
    #   "cpu":
    #   [
    #     { "name": "Dataloader", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Forward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Backward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Optimization", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Others", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 }
    # ]
    #   "gpu":
    #   [
    #     { "name": "Dataloader", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Forward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Backward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Optimization", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Others", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 }
    # ]
    # }
    def get_model_perspective(self, time_unit):
        '''
    Get total cpu and gpu statistics for model perspective of each profiler step.
    '''
        if 'get_model_perspective' in self.cache[time_unit]:
            return self.cache[time_unit]['get_model_perspective']
        data = OrderedDict()
        data['column_name'] = [
            "name", "calls", "total_time", "avg_time", "max_time", "min_time",
            "ratio"
        ]
        data['cpu'] = []
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
                    time_unit)
                cpu_stage_data['ratio'] = format_ratio(
                    self.model_perspective_items[stage_name].cpu_time /
                    total_cpu_time)
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
                    time_unit)
                gpu_stage_data['ratio'] = format_ratio(
                    self.model_perspective_items[stage_name].gpu_time /
                    total_gpu_time)
                data['cpu'].append(cpu_stage_data)
                data['gpu'].append(gpu_stage_data)
        self.cache['get_model_perspective'] = data
        return data

    # profiler/overview/model_perspective_perstep
    #   {
    #  "order": ["forward", "backward", "optimization"],
    #  "steps": [1 , 2,  3],
    #  "forward": [233, 544, 333],
    #  "backward": [344, 543, 333],
    #  "optimization": [344, 433, 323]
    # }

    def get_model_perspective_perstep(self, device_type, time_unit):
        if 'get_model_perspective_perstep' in self.cache[time_unit]:
            return self.cache[time_unit]['get_model_perspective_perstep']
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
                # print(self.model_perspective_items[stage_name].cpu_times.keys())
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
                        # print(stage_name, self.model_perspective_items[stage_name].gpu_times.keys())
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
        self.cache['get_model_perspective_perstep'] = new_data
        return new_data

    # profiler/overview/event_type_perspective
    #   {
    #  "order": ["Operator", "OperatorInner"]
    #  "Operator": {
    #    "calling_times": {
    #      "key" : ["DataLoader", "Forward", "Backward", "Optimization", "Others"],
    #      "value": [3, 23, 3, 4, 6]
    #    }
    #    "durations": {
    #      "key" : ["DataLoader", "Forward", "Backward", "Optimization", "Others"],
    #      "value": [3, 23, 3, 4, 6]
    #    }
    #    "ratios": {
    #      "key" : ["DataLoader", "Forward", "Backward", "Optimization", "Others"],
    #      "value": [3, 23, 3, 4, 6]
    #    }
    #  }
    #  "OperatorInner":
    #  {
    #    "calling_times": {
    #      "key" : ["DataLoader", "Forward", "Backward", "Optimization", "Others"],
    #      "value": [3, 23, 3, 4, 6]
    #    }
    #    "durations": {
    #      "key" : ["DataLoader", "Forward", "Backward", "Optimization", "Others"],
    #      "value": [3, 23, 3, 4, 6]
    #    }
    #    "ratios": {
    #      "key" : ["DataLoader", "Forward", "Backward", "Optimization", "Others"],
    #      "value": [3, 23, 3, 4, 6]
    #    }
    #  }
    # }

    # phase name:
    #   device name:
    #     stage idx:
    #      event type:
    #           { "calls" :[], "times": [], "total_time": 0 }
    def get_event_type_perspective(self, device_type, time_unit):
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

    # profiler/overview/event_type_model_perspective
    #   {
    #  "order": ["CudaRuntime", "OperatorInner", "Operator", "PythonUserDefined"],
    #  "phase_type": ["Total", "DataLoader", "Forward", "Backward", "Optimization", "Others"],
    #  "CudaRuntime": [233, 544, 333, 44],
    #  "OperatorInner": [344, 543, 333, 33],
    #  "Operator": [344, 543, 333, 33],
    #  "PythonUserDefined": [344, 433, 323, 22]
    # }
    # phase name:
    #   device name:
    #     stage idx:
    #      event type:
    #           { "calls" :[], "times": [], "total_time": 0 }
    def get_event_type_model_perspective(self, time_unit):
        if 'get_event_type_model_perspective' in self.cache[time_unit]:
            return self.cache[time_unit]['get_event_type_model_perspective']
        data = OrderedDict()
        data['order'] = []
        data['phase_type'] = []
        try:
            for event_type in CPUType:
                if event_type in self.merged_events_per_stage['ProfileStep'][
                        'CPU']['ALL']:
                    data['order'].append(event_type)
                    data[event_type] = []
            for event_type in GPUType:
                if event_type in self.merged_events_per_stage['ProfileStep'][
                        'GPU']['ALL']:
                    data['order'].append(event_type)
                    data[event_type] = []
            # print('self.merged_events_per_stage.keys()', self.merged_events_per_stage.keys())
            for stage_name in [
                    'ProfileStep', 'Dataloader', 'Forward', 'Backward',
                    'Optimization', 'Other'
            ]:
                if stage_name in self.merged_events_per_stage:
                    data['phase_type'].append(stage_name)
                    for event_type in data['order']:
                        # print('event_type', event_type)
                        # print(self.merged_events_per_stage[stage_name]['CPU']['ALL'].keys())
                        if event_type in CPUType:
                            # print('I am in CPUType', event_type)
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
        self.cache['get_event_type_model_perspective'] = newdata
        return newdata

    # profiler/overview/userdefined_perspective
    #   {
    #   "column_name": ["name",  "calls", "min_time", "avg_time", "ratio"]
    #   "events": [
    #     { "name": "user_record1",  "cpu_total_time": 5322,  "cpu_max_time": 40, "cpu_min_time": 20, "cpu_avg_time": 30, "cpu_ratio": 30,
    #        "gpu_total_time": 5322,  "gpu_max_time": 40, "gpu_min_time": 20, "gpu_avg_time": 30, "gpu_ratio": 30
    #  }]
    # }
    def get_userdefined_perspective(self, time_unit):
        if 'get_userdefined_perspective' in self.cache[time_unit]:
            return self.cache[time_unit]['get_userdefined_perspective']
        data = OrderedDict()
        data['column_name'] = [
            'name', 'calls', 'cpu_total_time', 'cpu_avg_time', 'cpu_max_time',
            'cpu_min_time', 'cpu_ratio', 'gpu_total_time', 'gpu_avg_time',
            'gpu_max_time', 'gpu_min_time', 'gpu_ratio'
        ]
        data['events'] = []
        total_cpu_time = 0
        total_gpu_time = 0
        for name, event in self.userdefined_items.items():
            total_cpu_time += event.cpu_time
            total_gpu_time += event.general_gpu_time
        for name, event in self.userdefined_items.items():
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
                format_ratio(event.cpu_time /
                             total_cpu_time if total_cpu_time != 0 else 0.0),
                "gpu_total_time":
                format_time(event.general_gpu_time, time_unit),
                "gpu_avg_time":
                format_time(event.avg_general_gpu_time, time_unit),
                "gpu_max_time":
                format_time(event.max_general_gpu_time, time_unit),
                "gpu_min_time":
                format_time(event.min_general_gpu_time, time_unit),
                "gpu_ratio":
                format_ratio(event.general_gpu_time /
                             total_gpu_time if total_gpu_time != 0 else 0.0)
            })
        self.cache['get_userdefined_perspective'] = data
        return data

    # get_operator_pie
    #   {
    #   "column_name": ["total_time",  "max_time", "min_time", "avg_time", "ratio"]
    #   "cpu":
    #   [
    #     { "name": "Dataloader", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Forward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Backward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Optimization", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Others", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 }
    # ]
    #   "gpu":
    #   [
    #     { "name": "Dataloader", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Forward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Backward", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Optimization", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 },
    #     { "name": "Others", "total_time": 5322,  "max_time": 40, "min_time": 20, "avg_time": 30, "ratio": 30 }
    # ]
    # }
    # sorted_by

    def get_operator_pie(self, topk, sorted_by='GPUTotal', time_unit='ms'):
        data = OrderedDict()
        data['column_name'] = [
            "name", "calls", "total_time", "avg_time", "max_time", "min_time",
            "ratio"
        ]
        data['cpu'] = []
        data['gpu'] = []
        if sorted_by == 'CPUTotal':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].cpu_time,
                reverse=True)
        elif sorted_by == 'CPUAvg':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].avg_cpu_time,
                reverse=True)
        elif sorted_by == 'CPUMax':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].max_cpu_time,
                reverse=True)
        elif sorted_by == 'CPUMin':
            sorted_items = sorted(
                self.operator_items.items(), key=lambda x: x[1].min_cpu_time)
        elif sorted_by == 'GPUTotal':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].general_gpu_time,
                reverse=True)
        elif sorted_by == 'GPUAvg':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].avg_general_gpu_time,
                reverse=True)
        elif sorted_by == 'GPUMax':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].max_general_gpu_time,
                reverse=True)
        elif sorted_by == 'GPUMin':
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].min_general_gpu_time)
        else:
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].general_gpu_time,
                reverse=True)
        # print('topk:', topk)
        if topk <= 0:
            items = sorted_items
        else:
            items = sorted_items[:topk]
        # print(sorted_items)
        total_cpu_time = 0.0
        total_gpu_time = 0.0
        for op_name, item in items:
            total_cpu_time += item.cpu_time
            total_gpu_time += item.gpu_time

        for op_name, item in items:
            # print(op_name)
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
            gpu_stage_data = OrderedDict()
            gpu_stage_data['name'] = op_name
            gpu_stage_data['calls'] = item.call
            gpu_stage_data['total_time'] = format_time(item.gpu_time,
                                                       time_unit)
            gpu_stage_data['avg_time'] = format_time(item.avg_gpu_time,
                                                     time_unit)
            gpu_stage_data['max_time'] = format_time(item.max_gpu_time,
                                                     time_unit)
            gpu_stage_data['min_time'] = format_time(item.min_gpu_time,
                                                     time_unit)
            gpu_stage_data['ratio'] = format_ratio(
                item.gpu_time / total_gpu_time)
            data['cpu'].append(cpu_stage_data)
            data['gpu'].append(gpu_stage_data)
        return data

    #{'order': ['Operator', 'CudaRuntime', 'UserDefined', 'OperatorInner', 'Kernel', 'Memcpy', 'Memset'], 'phase_type': ['ProfileStep', 'Dataloader', 'Forward', 'Backward', 'Optimization', 'Other'], 'data': [[80.16, 3.8, 11.45, 10.52, 8.15, 6.16], [29.46, 1.33, 3.65, 4.61, 2.28, 2.85], [1.74, 0.02, 0, 0.2, 0, 0.65], [54.45, 2.41, 8.68, 8.37, 3.51, 4.25], [16.78, 0.11, 2.5, 5.09, 0.45, 0.23], [0.07, 0.0, 0, 0.01, 0, 0.02], [0.03, 0, 0, 0.01, 0, 0]]}
    #
    #
    def get_operator_pie_expand(self, topk, device_type, time_unit):
        data = OrderedDict()
        data['order'] = []
        data['phase_type'] = []
        data['data'] = []
        sorted_items = sorted(
            self.operator_items.items(),
            key=lambda x: x[1].general_gpu_time,
            reverse=True)
        # print('topk:', topk)
        if topk <= 0 or topk >= 20:
            items = sorted_items[:20]
            other_items = sorted_items[20:]
        else:
            items = sorted_items[:topk]
            other_items = []

        # for op_name, event in sorted_items:
        #     for innerop_name, item in event.operator_inners.items():
        #         name_sets.add(innerop_name)
        # data['order'].extend(name_sets)
        data['order'].extend(['infer_shape', 'compute', 'node_creation'])
        inner_op_data = defaultdict(list)
        for op_name, event in items:
            data['phase_type'].append(op_name)
            for innerop_name, item in event.operator_inners.items():
                # print(op_name, innerop_name, item.general_gpu_time)
                if 'infer_shape' in innerop_name:
                    innerop_name = 'infer_shape'
                elif 'compute' in innerop_name:
                    innerop_name = 'compute'
                elif 'node_creation' in innerop_name:
                    innerop_name = 'node_creation'
                else:
                    continue
                if device_type == 'cpu':
                    inner_op_data[innerop_name].append(
                        format_time(item.cpu_time, time_unit))
                else:
                    inner_op_data[innerop_name].append(
                        format_time(item.general_gpu_time, time_unit))
            for innerop_name in data['order']:
                hasfound = False
                for key in event.operator_inners:
                    if innerop_name in key:
                        hasfound = True
                        break
                if hasfound == False:
                    inner_op_data[innerop_name].append(0)
        if other_items:
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
                    else:
                        others_time[innerop_name] += item.general_gpu_time
            for innerop_name in data['order']:
                if innerop_name not in others_time:
                    inner_op_data[innerop_name].append(0.0)
                else:
                    inner_op_data[innerop_name].append(
                        format_time(others_time[innerop_name], time_unit))
        for innerop_name in data['order']:
            data['data'].append(inner_op_data[innerop_name])
        return data

    def get_operator_table(self,
                           group_by='op_name',
                           search_name=None,
                           time_unit='ms'):
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
                data['column_name'] = [
                    'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                    'cpu_max_time', 'cpu_min_time', 'cpu_ratio',
                    'gpu_total_time', 'gpu_avg_time', 'gpu_max_time',
                    'gpu_min_time', 'gpu_ratio'
                ]
                sorted_items = sorted(
                    self.operator_items.items(),
                    key=lambda x: x[1].max_general_gpu_time,
                    reverse=True)
                for name, event in sorted_items:
                    data['events'].append({
                        "name":
                        name,
                        "calls":
                        event.call,
                        "children":
                        get_children_data(event),
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
                data['column_name'] = [
                    'name', 'calls', 'input_shape', 'cpu_total_time',
                    'cpu_avg_time', 'cpu_max_time', 'cpu_min_time',
                    'cpu_ratio', 'gpu_total_time', 'gpu_avg_time',
                    'gpu_max_time', 'gpu_min_time', 'gpu_ratio'
                ]
                new_arrange_data = {}
                for op_name, items_with_input_shape in self.operator_items_with_input_shape.items(
                ):
                    for input_shape, item in items_with_input_shape.items():
                        new_arrange_data[(op_name, input_shape)] = item
                sorted_items = sorted(
                    new_arrange_data.items(),
                    key=lambda x: x[1].max_general_gpu_time,
                    reverse=True)
                for (name, input_shape), event in sorted_items:
                    data['events'].append({
                        "name":
                        name,
                        "calls":
                        event.call,
                        "children":
                        get_children_data(event),
                        "input_shapes":
                        input_shape,
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
            sorted_items = sorted(
                self.operator_items.items(),
                key=lambda x: x[1].max_general_gpu_time,
                reverse=True)
            results = []
            for op_name, item in sorted_items:
                if search_name in op_name:
                    results.append(op_name)

            if group_by == 'op_name':
                data['column_name'] = [
                    'name', 'calls', 'cpu_total_time', 'cpu_avg_time',
                    'cpu_max_time', 'cpu_min_time', 'cpu_ratio',
                    'gpu_total_time', 'gpu_avg_time', 'gpu_max_time',
                    'gpu_min_time', 'gpu_ratio'
                ]
                for op_name in results:
                    event = self.operator_items[op_name]
                    data['events'].append({
                        "name":
                        op_name,
                        "calls":
                        event.call,
                        "children":
                        get_children_data(event),
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
                data['column_name'] = [
                    'name', 'calls', 'input_shape', 'cpu_total_time',
                    'cpu_avg_time', 'cpu_max_time', 'cpu_min_time',
                    'cpu_ratio', 'gpu_total_time', 'gpu_avg_time',
                    'gpu_max_time', 'gpu_min_time', 'gpu_ratio'
                ]
                for op_name in results:
                    for input_shape, event in self.operator_items_with_input_shape[
                            op_name].items():
                        data['events'].append({
                            "name":
                            op_name,
                            "calls":
                            event.call,
                            "children":
                            get_children_data(event),
                            "input_shapes":
                            input_shape,
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
                            format_ratio(
                                event.general_gpu_time /
                                total_gpu_time if total_gpu_time != 0 else 0.0)
                        })

        return data

    def get_kernel_pie(self, topk, time_unit='ms'):
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

    def get_memory_devices(self):
        data = []
        for device in self.memory_curve.keys():
            data.append({
                "device":
                device,
                "min_size":
                format_memory(self.size_ranges[device][0], 'KB'),
                "max_size":
                format_memory(self.size_ranges[device][1], 'KB')
            })
        return data

    def get_memory_curve(self, device_type, time_unit='ms'):
        curves = self.memory_curve[device_type]
        data = {}
        data['axis'] = []
        data['linedata'] = {}
        axis_append_count = 0
        for key, events in curves.items():
            data['linedata'][key] = []
            sorted_events = sorted(events, key=lambda x: x[0])
            for item in sorted_events:
                timestamp = item[0]
                size = item[1]
                event_name = item[2]
                if axis_append_count == 0:
                    data['axis'].append(format_time(timestamp, time_unit))
                data['linedata'][key].append({
                    "value":
                    format_memory(size, 'KB'),
                    "event name":
                    event_name,
                    "timestamp":
                    format_time(timestamp, time_unit)
                })
            axis_append_count += 1
        return data

    def get_memory_events(self,
                          device_type,
                          min_size=0,
                          max_size=float('inf'),
                          search_name=None,
                          time_unit='ms'):
        data = {}
        data['column_name'] = [
            'Memory Type', 'Allocated Event', 'Allocated Timestamp',
            'Free Event', 'Free Timestamp', 'Duration', 'Size'
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
                if size >= min_size and size <= max_size and (
                        search_name in item[1] or search_name in item[3]):
                    return True
            return False

        paired_event_list = filter(filter_func, paired_event_list)
        paired_event_list = sorted(paired_event_list, key=lambda x: x[-1])
        for item in paired_event_list:
            if item[2] and item[4]:
                duration = item[4] - item[2]
            data['data'].append({
                "Memory Type":
                item[0],
                "Allocated Event":
                item[1],
                "Allocated Timestamp":
                format_time(item[2], time_unit) if item[2] else None,
                "Free Event":
                item[3],
                "Free Timestamp":
                format_time(item[4], time_unit) if item[4] else None,
                "Duration":
                format_time(duration, time_unit),
                "Size":
                format_memory(item[5], 'KB')
            })
        return data

    def get_op_memory_events(self, device_type, search_name=None):
        data = {}
        data['column_name'] = [
            'Event Name', 'Memory Type', 'Allocation Count', 'Free Count',
            'Allocation Size', 'Free Size', 'Increased Size'
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
        if not search_name:
            all_events = filter(filter_func, all_events)

        sorted_items = sorted(
            all_events, key=lambda x: x[1].increase_size, reverse=True)

        for event_name, item in sorted_items:
            data['data'].append({
                'Event Name':
                event_name,
                'Memory Type':
                item.memory_type,
                'Allocation Count':
                item.allocation_count,
                'Free Count':
                item.free_count,
                'Allocation Size':
                format_memory(item.allocation_size, 'KB'),
                'Free Size':
                format_memory(item.free_size, 'KB'),
                'Increased Size':
                format_memory(item.increase_size, 'KB')
            })
        return data


class DistributedProfileData:
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

    ## profiler/overview/get_distributed_table
    #   {
    #  "order": ["Communication", "Computation", "Overlap", "Others"],
    #  "worker_name": ["worker1", "worker2", "worker3",],
    #  "Communication": [233, 544, 333],
    #  "Computation": [344, 543, 333],
    #  "Overlap": [344, 543, 333],
    #  "Others": [344, 433, 323]
    # }

    def get_distributed_histogram(self, step, time_unit='ms'):
        data = {}
        data['order'] = ["Communication", "Computation", "Overlap", "Others"]
        data['worker_name'] = []
        data['data'] = []
        new_data = defaultdict(list)
        for profile_data in self.profile_datas:
            data['worker_name'].append(profile_data.worker_name)
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
            return list(profile_data.distributed_time.keys())
