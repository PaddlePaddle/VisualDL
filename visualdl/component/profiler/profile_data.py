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

from .parser.kernel_parser import KernelParser
from .parser.operator_parser import OperatorParser
from .parser.overview_parser import CPUType
from .parser.overview_parser import GPUType
from .parser.overview_parser import OverviewParser
from .parser.trace_parser import TraceParser
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

    def __init__(self, profiler_result):
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
        # operator parser
        self.operator_parser = OperatorParser()
        self.operator_parser.parse(self.node_trees)
        self.operator_items = self.operator_parser.items
        # kernel parser
        self.kernel_parser = KernelParser()
        self.kernel_parser.parse(traverse_tree(self.node_trees))
        self.kernel_items = self.kernel_parser.kernel_items
        self.occupancy = self.kernel_parser.occupancy
        self.sm_efficiency = self.kernel_parser.sm_efficiency
        self.tensorcore_ratio = self.kernel_parser.tensor_core_ratio
        self.gpu_ids = self.kernel_parser.gpu_ids

        # cache data
        self.cache = defaultdict(lambda: defaultdict(list))

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
        self.cache['get_model_perspective_perstep'] = data
        return data

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
        if 'get_event_type_perspective' in self.cache[time_unit]:
            return self.cache[time_unit]['get_event_type_perspective']
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
        self.cache[time_unit]['get_event_type_perspective'] = data
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

    def get_views(self):
        '''
    Return available views this profile data can provide.
    '''
        views = ['Overview']
        if self.operator_items:
            views.append('Operator')
        if self.kernel_items:
            views.append('GPU Kernel')
        return views


class DistributedProfileData:
    '''
  Hold data for distributed view.
  Aggregate all data for distributed in ProfileData object.
  '''

    def __init__(self):
        return
