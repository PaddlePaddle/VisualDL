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
import json

from .profiler_reader import ProfilerReader
from visualdl.server.api import gen_result
from visualdl.server.api import result


class ProfilerApi(object):
    def __init__(self, logdir):
        self._reader = ProfilerReader(logdir)

    @result()
    def runs(self):
        return self._reader.runs()

    @result()
    def views(self, run):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        return list(run_manager.get_views())

    @result()
    def workers(self, run, view):
        if view == 'Distributed':
            return ['All']
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        return run_manager.get_workers(view)

    @result()
    def spans(self, run, worker):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        if worker == 'All':
            return run_manager.get_distributed_spans()
        return run_manager.get_spans(worker)

    @result()
    def timeunits(self):
        return ['ns', 'us', 'ms', 's']

    @result()
    def descriptions(self, lang):
        if lang == 'undefined' or lang is None:
            lang = 'zh'
        lang = lang.lower()
        return self._reader.get_descriptions(lang)

    def component_tabs(self):
        '''
        Get all component tabs supported by readers in Api.
        '''
        tabs = set()
        tabs.update(self._reader.component_tabs(update=True))
        return tabs

    @result()
    def overview_environment(self, run, worker, span):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        span = str(span)
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            result = profiler_data.get_device_infos()
            num_workers = len(run_manager.get_workers('Overview'))
            result['num_workers'] = num_workers
            return result

    @result()
    def model_perspective(self, run, worker, span, time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_model_perspective(time_unit)

    @result()
    def model_perspective_perstep(self,
                                  run,
                                  worker,
                                  span,
                                  device_type,
                                  time_unit='ms'):
        device_type = device_type.lower()
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_model_perspective_perstep(
                device_type, time_unit)

    @result()
    def event_type_perspective(self,
                               run,
                               worker,
                               span,
                               device_type,
                               time_unit='ms'):
        device_type = device_type.lower()
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_event_type_perspective(
                device_type, time_unit)

    @result()
    def event_type_model_perspective(self, run, worker, span, time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_event_type_model_perspective(time_unit)

    @result()
    def userdefined_perspective(self, run, worker, span, time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_userdefined_perspective(time_unit)

    @result()
    def operator_pie(self, run, worker, span, topk, time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        topk = int(topk)
        if profiler_data:
            return profiler_data.get_operator_pie(topk, time_unit)

    @result()
    def operator_pie_expand(self, run, worker, span, topk, device_type,
                            time_unit):
        device_type = device_type.lower()
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)

        topk = int(topk)
        if profiler_data:
            return profiler_data.get_operator_pie_expand(
                topk, device_type, time_unit)

    @result()
    def operator_table(self,
                       run,
                       worker,
                       span,
                       group_by,
                       search_name,
                       time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_operator_table(group_by, search_name,
                                                    time_unit)

    @result()
    def operator_stack_table(self,
                             run,
                             worker,
                             span,
                             op_name,
                             group_by,
                             input_shape,
                             time_unit='ms'):
        pass

    @result()
    def kernel_pie(self, run, worker, span, topk, time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        topk = int(topk)
        if profiler_data:
            return profiler_data.get_kernel_pie(topk, time_unit)

    @result()
    def kernel_table(self,
                     run,
                     worker,
                     span,
                     group_by,
                     search_name,
                     time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_kernel_table(group_by, search_name,
                                                  time_unit)

    @result()
    def kernel_tc_pie(self, run, worker, span, topk, time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            topk = int(topk)
            return profiler_data.get_kernel_tc_pie(topk, time_unit)

    @result()
    def distributed_info(self, run, worker, span):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        distributed_profiler_data = run_manager.get_distributed_profiler_data(
            span)
        if distributed_profiler_data is None:
            return
        return distributed_profiler_data.get_distributed_info()

    @result()
    def distributed_steps(self, run, worker, span):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        distributed_profiler_data = run_manager.get_distributed_profiler_data(
            span)
        if distributed_profiler_data is None:
            return
        return distributed_profiler_data.get_distributed_steps()

    @result()
    def distributed_histogram(self, run, worker, span, step, time_unit='ms'):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        distributed_profiler_data = run_manager.get_distributed_profiler_data(
            span)
        if distributed_profiler_data is None:
            return
        return distributed_profiler_data.get_distributed_histogram(
            step, time_unit)

    @result(headers={'content-encoding': 'gzip'})
    def trace(self, run, worker, span):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_trace_data()

    @result()
    def memory_devices(self, run, worker, span):
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_memory_devices()

    @result(headers={'content-encoding': 'gzip'})
    def memory_curve(self, run, worker, span, device_type, time_unit='ms'):
        if device_type == 'undefined':
            return
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_memory_curve(device_type, time_unit)

    @result(headers={'content-encoding': 'gzip'})
    def memory_events(self,
                      run,
                      worker,
                      span,
                      device_type,
                      min_size=0,
                      max_size=float('inf'),
                      search_name=None,
                      time_unit='ms'):
        if device_type == 'undefined':
            return
        try:
            min_size = float(min_size)
        except Exception:
            min_size = 0
        try:
            max_size = float(max_size)
        except Exception:
            max_size = float('inf')
        if search_name == 'undefined' or not search_name:
            search_name = None
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_memory_events(
                device_type, min_size, max_size, search_name, time_unit)

    @result(headers={'content-encoding': 'gzip'})
    def op_memory_events(self,
                         run,
                         worker,
                         span,
                         device_type,
                         search_name=None):
        if search_name == 'undefined' or not search_name:
            search_name = None
        if device_type == 'undefined':
            return
        run_manager = self._reader.get_run_manager(run)
        if run_manager is None:
            return []
        profiler_data = run_manager.get_profiler_data(worker, span)
        if profiler_data:
            return profiler_data.get_op_memory_events(device_type, search_name)

    @result()
    def comparison_phase(self, base_run, base_worker, base_span, exp_run,
                         exp_worker, exp_span):
        pass

    @result()
    def comparison_phase_diff(self, base_run, base_worker, base_span, exp_run,
                              exp_worker, exp_span):
        pass

    @result()
    def comparison_phase_table(self, base_run, base_worker, base_span, exp_run,
                               exp_worker, exp_span):
        pass

    @result()
    def comparison_phase_inner(self, base_run, base_worker, base_span, exp_run,
                               exp_worker, exp_span, phase_name):
        pass

    @result()
    def comparison_phase_diff_inner(self, base_run, base_worker, base_span,
                                    exp_run, exp_worker, exp_span, phase_name):
        pass

    @result()
    def comparison_phase_table_inner(self, base_run, base_worker, base_span,
                                     exp_run, exp_worker, exp_span,
                                     phase_name):
        pass


def create_profiler_api_call(logdir):
    api = ProfilerApi(logdir)
    routes = {
        'runs': (api.runs, []),
        'views': (api.views, ["run"]),
        'workers': (api.workers, ["run", "view"]),
        'spans': (api.spans, ["run", "worker"]),
        'timeunits': (api.timeunits, []),
        'descriptions': (api.descriptions, ["lang"]),
        'overview/environment': (api.overview_environment,
                                 ["run", "worker", "span"]),
        'overview/model_perspective': (api.model_perspective,
                                       ["run", "worker", "span", "time_unit"]),
        'overview/model_perspective_perstep': (api.model_perspective_perstep, [
            "run", "worker", "span", "device_type", "time_unit"
        ]),
        'overview/event_type_perspective': (api.event_type_perspective, [
            "run", "worker", "span", "device_type", "time_unit"
        ]),
        'overview/event_type_model_perspective':
        (api.event_type_model_perspective,
         ["run", "worker", "span", "time_unit"]),
        'overview/userdefined_perspective':
        (api.userdefined_perspective, ["run", "worker", "span", "time_unit"]),
        'operator/pie': (api.operator_pie,
                         ["run", "worker", "span", "topk", "time_unit"]),
        'operator/pie_expand': (api.operator_pie_expand, [
            "run", "worker", "span", "topk", "device_type", "time_unit"
        ]),
        'operator/table': (api.operator_table, [
            "run", "worker", "span", "group_by", "search_name", "time_unit"
        ]),
        'operator/stack_table': (api.operator_stack_table, [
            "run", "worker", "span", "op_name", "group_by", "time_unit"
            "input_shape"
        ]),
        'kernel/pie': (api.kernel_pie,
                       ["run", "worker", "span", "topk", "time_unit"]),
        'kernel/tensorcore_pie':
        (api.kernel_tc_pie, ["run", "worker", "span", "topk", "time_unit"]),
        'kernel/table': (api.kernel_table, [
            "run", "worker", "span", "group_by", "search_name", "time_unit"
        ]),
        'distributed/info': (api.distributed_info, ["run", "worker", "span"]),
        'distributed/steps': (api.distributed_steps, ["run", "worker",
                                                      "span"]),
        'distributed/histogram': (api.distributed_histogram, [
            "run", "worker", "span", "step", "time_unit"
        ]),
        'trace': (api.trace, ["run", "worker", "span"]),
        'memory/devices': (api.memory_devices, ["run", "worker", "span"]),
        'memory/curve': (api.memory_curve,
                         ["run", "worker", "span", "device_type",
                          "time_unit"]),
        'memory/memory_events': (api.memory_events, [
            "run", "worker", "span", "device_type", "min_size", "max_size",
            "search_name", "time_unit"
        ]),
        'memory/op_memory_events': (api.op_memory_events, [
            "run", "worker", "span", "device_type", "search_name"
        ]),
        'comparison/phase': (api.comparison_phase, [
            "base_run", "base_worker", "base_span", "exp_run", "exp_worker",
            "exp_span"
        ]),
        'comparison/phase_diff': (api.comparison_phase_diff, [
            "base_run", "base_worker", "base_span", "exp_run", "exp_worker",
            "exp_span"
        ]),
        'comparison/phase_table': (api.comparison_phase_table, [
            "base_run", "base_worker", "base_span", "exp_run", "exp_worker",
            "exp_span"
        ]),
        'comparison/phase_inner': (api.comparison_phase_inner, [
            "base_run", "base_worker", "base_span", "exp_run", "exp_worker",
            "exp_span", "phase_name"
        ]),
        'comparison/phase_diff_inner': (api.comparison_phase_diff_inner, [
            "base_run", "base_worker", "base_span", "exp_run", "exp_worker",
            "exp_span", "phase_name"
        ]),
        'comparison/phase_table_inner': (api.comparison_phase_table_inner, [
            "base_run", "base_worker", "base_span", "exp_run", "exp_worker",
            "exp_span", "phase_name"
        ]),
        'component_tabs': (api.component_tabs, [])
    }

    def call(path: str, args):
        route = routes.get(path)
        if not route:
            return json.dumps(gen_result(
                status=1, msg='api not found')), 'application/json', None
        method, call_arg_names = route
        call_args = [args.get(name) for name in call_arg_names]
        return method(*call_args)

    return call
