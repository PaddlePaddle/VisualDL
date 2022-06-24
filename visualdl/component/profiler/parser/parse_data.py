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
# Copyright (c) 2022 PaddlePaddle Authors. All Rights Reserved.
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
import collections
from enum import Enum
import re

from paddle.fluid.core import TracerEventType

from .statistic_helper import *

_AllTracerEventType = [
    TracerEventType.Operator, TracerEventType.Dataloader,
    TracerEventType.ProfileStep, TracerEventType.CudaRuntime,
    TracerEventType.Kernel, TracerEventType.Memcpy, TracerEventType.Memset,
    TracerEventType.UserDefined, TracerEventType.OperatorInner,
    TracerEventType.Forward, TracerEventType.Backward,
    TracerEventType.Optimization, TracerEventType.Communication,
    TracerEventType.PythonOp, TracerEventType.PythonUserDefined
]

_CommunicationOpName = ['allreduce', 'broadcast', 'rpc']


class StatisticData:
    r"""
    Hold all analysed results.
    """
    def __init__(self, node_trees, extra_info):
        self.node_trees = node_trees
        self.extra_info = extra_info
        self.time_range_summary = TimeRangeSummary()
        self.event_summary = EventSummary()
        self.distributed_summary = DistributedSummary()
        self.time_range_summary.parse(node_trees)
        self.event_summary.parse(node_trees)
        self.distributed_summary.parse(node_trees)


def _build_table(statistic_data,
                 sorted_by=SortedKeys.CPUTotal,
                 op_detail=True,
                 thread_sep=False,
                 time_unit='ms',
                 row_limit=100,
                 max_src_column_width=75):
    """Prints a summary of events."""
    # format table row
    SPACING_SIZE = 2
    row_format_list = [""]
    header_sep_list = [""]
    line_length_list = [-SPACING_SIZE]

    def add_column(padding, text_dir='<'):
        row_format_list[0] += '{: ' + text_dir + str(padding) + '}' + (
            ' ' * SPACING_SIZE)
        header_sep_list[0] += '-' * padding + (' ' * SPACING_SIZE)
        line_length_list[0] += padding + SPACING_SIZE

    def add_title(padding, text):
        left_length = padding - len(text)
        half = left_length // 2
        return '-' * half + text + '-' * (left_length - half)

    result = []

    def append(s):
        result.append(s)
        result.append('\n')

    def format_time(time, unit='ms', indent=0):
        r"""
        Transform time in ns to time in unit.
        """
        if time == float('inf'):
            return '-'
        else:
            result = float(time)
            if unit == 's':
                result /= 1e9
            elif unit == 'ms':
                result /= 1e6
            elif unit == 'us':
                result /= 1e3
            return '{}{:.2f}'.format(' ' * indent, result)

    def format_ratio(ratio, indent=0):
        r"""
        Transform ratio within [0, 1] to percentage presentation.
        """
        return '{}{:.2f}'.format(' ' * indent, ratio * 100)

    total_time = statistic_data.time_range_summary.get_cpu_range_sum(
        TracerEventType.ProfileStep)
    ###### Print Device Summary ######
    headers = ['Device', 'Utilization (%)']
    name_column_width = 30
    DEFAULT_COLUMN_WIDTH = 20
    add_column(name_column_width)
    for _ in headers[1:]:
        add_column(DEFAULT_COLUMN_WIDTH)

    row_format = row_format_list[0]
    header_sep = header_sep_list[0]
    line_length = line_length_list[0]

    # construct table string

    append(add_title(line_length, "Device Summary"))
    append(header_sep)
    append(row_format.format(*headers))
    append(header_sep)
    row_values = [
        'CPU(Process)',
        format_ratio(float(
            statistic_data.extra_info['Process Cpu Utilization']))
    ]
    append(row_format.format(*row_values))
    row_values = [
        'CPU(System)',
        format_ratio(float(statistic_data.extra_info['System Cpu Utilization']))
    ]
    append(row_format.format(*row_values))
    for gpu_name in statistic_data.time_range_summary.get_gpu_devices():
        gpu_time = float(
            statistic_data.time_range_summary.get_gpu_range_sum(
                gpu_name, TracerEventType.Kernel))
        utilization = gpu_time / total_time
        row_values = ['GPU{}'.format(gpu_name), format_ratio(utilization)]
        append(row_format.format(*row_values))

    append(header_sep)
    append(
        "Note:\nCPU(Process) Utilization = Current process CPU time over all cpu cores / elapsed time, so max utilization can be reached 100% * number of cpu cores.\n"
        "CPU(System) Utilization = All processes CPU time over all cpu cores(busy time) / (busy time + idle time).\n"
        "GPU Utilization = Current process GPU time / elapsed time.")
    append('-' * line_length)
    append('')
    append('')

    if total_time == 0:
        return ''.join(result)

    ###### Print Overview Summary ######
    headers = ['Event Type', 'Calls', 'CPU Time', 'Ratio (%)']
    row_format_list = [""]
    header_sep_list = [""]
    line_length_list = [-SPACING_SIZE]

    DEFAULT_COLUMN_WIDTH = 25
    for _ in headers:
        add_column(DEFAULT_COLUMN_WIDTH)

    row_format = row_format_list[0]
    header_sep = header_sep_list[0]
    line_length = line_length_list[0]

    # construct table string
    append(add_title(line_length, "Overview Summary"))
    append('Time unit: {}'.format(time_unit))
    append(header_sep)
    append(row_format.format(*headers))
    append(header_sep)
    cpu_type_time = collections.defaultdict(int)
    gpu_type_time = collections.defaultdict(int)
    cpu_call_times = collections.defaultdict(int)
    gpu_call_times = collections.defaultdict(int)
    cpu_call_times.update(statistic_data.time_range_summary.call_times)
    gpu_call_times.update(statistic_data.time_range_summary.call_times)

    for event_type, value in statistic_data.time_range_summary.CPUTimeRangeSum.items(
    ):
        if event_type != TracerEventType.Communication:
            cpu_type_time[event_type] = value
    if statistic_data.distributed_summary.cpu_communication_range:
        cpu_type_time[TracerEventType.Communication] = sum_ranges(
            statistic_data.distributed_summary.cpu_communication_range)
        cpu_call_times[
            TracerEventType.
            Communication] = statistic_data.distributed_summary.cpu_calls

    for event_type in [
            TracerEventType.Dataloader, TracerEventType.Forward,
            TracerEventType.Backward, TracerEventType.Optimization
    ]:
        event_type_name = str(event_type).split('.')[1]
        if event_type in cpu_call_times and event_type_name in statistic_data.event_summary.model_perspective_items:
            cpu_call_times[
                event_type] = statistic_data.event_summary.model_perspective_items[
                    event_type_name].call
            cpu_type_time[
                event_type] = statistic_data.event_summary.model_perspective_items[
                    event_type_name].cpu_time

    gpu_time_range = collections.defaultdict(list)
    for device_id, device_time_ranges in statistic_data.time_range_summary.GPUTimeRange.items(
    ):
        for event_type, time_range in device_time_ranges.items():
            gpu_time_range[event_type] = merge_ranges(
                gpu_time_range[event_type], time_range, is_sorted=True)
    for event_type, time_range in gpu_time_range.items():
        gpu_type_time[event_type] = sum_ranges(time_range)
    if statistic_data.distributed_summary.gpu_communication_range:
        gpu_type_time[TracerEventType.Communication] = sum_ranges(
            statistic_data.distributed_summary.gpu_communication_range)
        gpu_call_times[
            TracerEventType.
            Communication] = statistic_data.distributed_summary.gpu_calls

    sorted_items = sorted(cpu_type_time.items(),
                          key=lambda x: x[1],
                          reverse=True)
    event_type, time = sorted_items[0]
    row_values = [
        '{}'.format(str(event_type).split('.')[1]), cpu_call_times[event_type],
        format_time(time, unit=time_unit),
        format_ratio(float(time) / total_time)
    ]
    append(row_format.format(*row_values))
    for event_type, time in sorted_items[1:]:
        row_values = [
            '  {}'.format(str(event_type).split('.')[1]),
            cpu_call_times[event_type],
            format_time(time, unit=time_unit),
            format_ratio(float(time) / total_time)
        ]
        append(row_format.format(*row_values))
    append(header_sep)
    headers = ['', 'Calls', 'GPU Time', 'Ratio (%)']
    append(row_format.format(*headers))
    append(header_sep)
    for event_type, time in gpu_type_time.items():
        row_values = [
            '  {}'.format(str(event_type).split('.')[1]),
            gpu_call_times[event_type],
            format_time(time, unit=time_unit),
            format_ratio(float(time) / total_time)
        ]
        append(row_format.format(*row_values))

    append(header_sep)
    append(
        "Note:\nIn this table, We sum up all collected events in terms of event type.\n"
        "The time of events collected on host are presented as CPU Time, and as GPU Time if on device.\n"
        "Events with different types may overlap or inclusion, e.g. Operator includes OperatorInner, so the sum of ratios is not 100%.\n"
        "The time of events in the same type with overlap will not calculate twice, and all time is summed after merged.\n"
        "Example:\n"
        "Thread 1:\n"
        "  Operator: |___________|     |__________|\n"
        "Thread 2:\n"
        "  Operator:   |____________|     |___|\n"
        "After merged:\n"
        "  Result:   |______________|  |__________|\n")
    append('-' * line_length)
    append('')
    append('')

    ###### Print Model Summary Report ######
    model_perspective_items = statistic_data.event_summary.model_perspective_items
    if len(model_perspective_items) > 1:
        all_row_values = []
        accmulation_time = 0
        gpu_accmulation_time = 0
        gpu_total_time = statistic_data.event_summary.model_perspective_items[
            'ProfileStep'].general_gpu_time
        for name in [
                'ProfileStep', 'Dataloader', 'Forward', 'Backward',
                'Optimization'
        ]:
            if name in model_perspective_items:
                item = model_perspective_items[name]
                if gpu_total_time == 0:
                    gpu_ratio = 0
                else:
                    gpu_ratio = float(item.general_gpu_time) / gpu_total_time
                name = '{}'.format(
                    name) if 'ProfileStep' in name else '  {}'.format(name)
                row_values = [
                    '{}'.format(name), item.call,
                    '{} / {} / {} / {} / {}'.format(
                        format_time(item.cpu_time, unit=time_unit),
                        format_time(item.avg_cpu_time, unit=time_unit),
                        format_time(item.max_cpu_time, unit=time_unit),
                        format_time(item.min_cpu_time, unit=time_unit),
                        format_ratio(float(item.cpu_time) / total_time)),
                    '{} / {} / {} / {} / {}'.format(
                        format_time(item.gpu_time, unit=time_unit),
                        format_time(item.avg_gpu_time, unit=time_unit),
                        format_time(item.max_gpu_time, unit=time_unit),
                        format_time(item.min_gpu_time, unit=time_unit),
                        format_ratio(gpu_ratio))
                ]
                all_row_values.append(row_values)
                if 'ProfileStep' not in name:
                    accmulation_time += item.cpu_time
                    gpu_accmulation_time += item.general_gpu_time

        other_time = total_time - accmulation_time
        other_gpu_time = gpu_total_time - gpu_accmulation_time
        if gpu_total_time == 0:
            gpu_ratio = 0
        else:
            gpu_ratio = float(other_gpu_time) / gpu_total_time
        row_values = [
            '  Others', '-', '{} / - / - / - / {}'.format(
                format_time(other_time, unit=time_unit),
                format_ratio(float(other_time) / total_time)),
            '{} / - / - / - / {}'.format(
                format_time(other_gpu_time, unit=time_unit),
                format_ratio(gpu_ratio))
        ]
        all_row_values.append(row_values)
        # Calculate the column width
        calltime_width = 6
        cpu_data_description_width = 40
        gpu_data_description_width = 40
        for row_values in all_row_values:
            if isinstance(row_values[1],
                          int) and len(str(row_values[1])) > calltime_width:
                calltime_width = len(str(row_values[1]))
            if len(row_values[2]) > cpu_data_description_width:
                cpu_data_description_width = len(row_values[2])
            if len(row_values[3]) > gpu_data_description_width:
                gpu_data_description_width = len(row_values[3])
        headers = [
            'Name', 'Calls', 'CPU Total / Avg / Max / Min / Ratio(%)',
            'GPU Total / Avg / Max / Min / Ratio(%)'
        ]
        row_format_list = [""]
        header_sep_list = [""]
        line_length_list = [-SPACING_SIZE]
        name_column_width = 15
        add_column(name_column_width)
        add_column(calltime_width)
        add_column(cpu_data_description_width)
        add_column(gpu_data_description_width)

        row_format = row_format_list[0]
        header_sep = header_sep_list[0]
        line_length = line_length_list[0]

        # construct table string
        append(add_title(line_length, "Model Summary"))
        append('Time unit: {}'.format(time_unit))
        append(header_sep)
        append(row_format.format(*headers))
        append(header_sep)
        for row_values in all_row_values:
            append(row_format.format(*row_values))
        append(header_sep)
        append(
            "Note:\nIn this table, GPU time is the sum of all device(GPU) events called in the phase.\n"
            "Unlike overview summary, if two device(GPU) events execute on different streams with overlap time, we sum them directly here.\n"
        )
        append('-' * line_length)
        append('')
        append('')

    ###### Print Distribution Summary Report ######
    if statistic_data.distributed_summary.communication_range:
        headers = [
            'Name',
            'Total Time',
            'Ratio (%)',
        ]
        row_format_list = [""]
        header_sep_list = [""]
        line_length_list = [-SPACING_SIZE]

        DEFAULT_COLUMN_WIDTH = 25
        for _ in headers:
            add_column(DEFAULT_COLUMN_WIDTH)

        row_format = row_format_list[0]
        header_sep = header_sep_list[0]
        line_length = line_length_list[0]

        # construct table string
        append(add_title(line_length, "Distribution Summary"))
        append('Time unit: {}'.format(time_unit))
        append(header_sep)
        append(row_format.format(*headers))
        append(header_sep)
        communication_time = sum_ranges(
            statistic_data.distributed_summary.communication_range)
        computation_time = sum_ranges(
            statistic_data.distributed_summary.computation_range)
        overlap_time = sum_ranges(
            statistic_data.distributed_summary.overlap_range)
        row_values = [
            'ProfileStep',
            format_time(total_time, unit=time_unit),
            format_ratio(float(total_time) / total_time)
        ]
        append(row_format.format(*row_values))
        row_values = [
            '  Communication',
            format_time(communication_time, unit=time_unit),
            format_ratio(float(communication_time) / total_time)
        ]
        append(row_format.format(*row_values))

        row_values = [
            '  Computation',
            format_time(computation_time, unit=time_unit),
            format_ratio(float(computation_time) / total_time)
        ]
        append(row_format.format(*row_values))

        row_values = [
            '  Overlap',
            format_time(overlap_time, unit=time_unit),
            format_ratio(float(overlap_time) / total_time)
        ]
        append(row_format.format(*row_values))
        append(header_sep)
        append(
            "Note:\nCommunication time: Communication Event time, Communication Op time and its kernel time on gpu.\n"
            "Computation time: Kernel time, except kernels belong to communication(nccl kernels).\n"
            "Overlap time: Communication time intersects with computation time.\n"
            "Example:\n"
            "Communication:\n"
            "  CPU:              |_________________|\n"
            "  GPU:                                  |______________|\n"
            "  Total:            |_________________| |______________|\n"
            "Computation time(Kernel):\n"
            "  GPU:         |________________|\n"
            "Overlap time:       |___________|\n")
        append('-' * line_length)
        append('')
        append('')

    ###### Print Operator Summary Report ######
    if statistic_data.event_summary.items:
        all_row_values = []
        name_column_width = 52
        if thread_sep == True:
            thread_items = statistic_data.event_summary.thread_items
        else:
            thread_items = {
                'All threads merged': statistic_data.event_summary.items
            }
        for thread_id, items in thread_items.items():
            all_row_values.append("Thread: {}".format(thread_id))
            if sorted_by == SortedKeys.CPUTotal:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].cpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.CPUAvg:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].avg_cpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.CPUMax:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].max_cpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.CPUMin:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].min_cpu_time)
            elif sorted_by == SortedKeys.GPUTotal:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].general_gpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.GPUAvg:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].avg_general_gpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.GPUMax:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].max_general_gpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.GPUMin:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].min_general_gpu_time)
            total_op_cpu_time = 0
            total_op_gpu_time = 0

            for name, item in sorted_items:
                total_op_cpu_time += item.cpu_time
                total_op_gpu_time += item.general_gpu_time

            for name, item in sorted_items:
                if total_op_cpu_time == 0:
                    cpu_ratio = 0
                else:
                    cpu_ratio = float(item.cpu_time) / total_op_cpu_time
                if total_op_gpu_time == 0:
                    gpu_ratio = 0
                else:
                    gpu_ratio = float(item.general_gpu_time) / total_op_gpu_time
                row_values = [
                    name, item.call, '{} / {} / {} / {} / {}'.format(
                        format_time(item.cpu_time, unit=time_unit),
                        format_time(item.avg_cpu_time, unit=time_unit),
                        format_time(item.max_cpu_time, unit=time_unit),
                        format_time(item.min_cpu_time, unit=time_unit),
                        format_ratio(cpu_ratio)),
                    '{} / {} / {} / {} / {}'.format(
                        format_time(item.general_gpu_time, unit=time_unit),
                        format_time(item.avg_general_gpu_time, unit=time_unit),
                        format_time(item.max_general_gpu_time, unit=time_unit),
                        format_time(item.min_general_gpu_time, unit=time_unit),
                        format_ratio(gpu_ratio))
                ]
                all_row_values.append(row_values)
                if op_detail:
                    for innerop_name, innerop_node in item.operator_inners.items(
                    ):
                        if item.cpu_time == 0:
                            cpu_ratio = 0
                        else:
                            cpu_ratio = float(
                                innerop_node.cpu_time) / item.cpu_time
                        if item.general_gpu_time == 0:
                            gpu_ratio = 0
                        else:
                            gpu_ratio = float(innerop_node.general_gpu_time
                                              ) / item.general_gpu_time
                        if len(innerop_name) + 2 > name_column_width:
                            innerop_name = innerop_name[:name_column_width - 5]
                            innerop_name += "..."
                        row_values = [
                            '  {}'.format(innerop_name), innerop_node.call,
                            '{} / {} / {} / {} / {}'.format(
                                format_time(innerop_node.cpu_time,
                                            unit=time_unit),
                                format_time(innerop_node.avg_cpu_time,
                                            unit=time_unit),
                                format_time(innerop_node.max_cpu_time,
                                            unit=time_unit),
                                format_time(innerop_node.min_cpu_time,
                                            unit=time_unit),
                                format_ratio(cpu_ratio)),
                            '{} / {} / {} / {} / {}'.format(
                                format_time(innerop_node.general_gpu_time,
                                            unit=time_unit),
                                format_time(innerop_node.avg_general_gpu_time,
                                            unit=time_unit),
                                format_time(innerop_node.max_general_gpu_time,
                                            unit=time_unit),
                                format_time(innerop_node.min_general_gpu_time,
                                            unit=time_unit),
                                format_ratio(gpu_ratio))
                        ]
                        all_row_values.append(row_values)
                        for device_node_name, device_node in innerop_node.devices.items(
                        ):
                            if innerop_node.general_gpu_time == 0:
                                gpu_ratio = 0
                            else:
                                gpu_ratio = float(
                                    device_node.gpu_time
                                ) / innerop_node.general_gpu_time
                            if len(device_node_name) + 4 > name_column_width:
                                device_node_name = device_node_name[:
                                                                    name_column_width
                                                                    - 7]
                                device_node_name += "..."
                            row_values = [
                                '    {}'.format(device_node_name),
                                device_node.call, '- / - / - / - / -',
                                '{} / {} / {} / {} / {}'.format(
                                    format_time(device_node.gpu_time,
                                                unit=time_unit),
                                    format_time(device_node.avg_gpu_time,
                                                unit=time_unit),
                                    format_time(device_node.max_gpu_time,
                                                unit=time_unit),
                                    format_time(device_node.min_gpu_time,
                                                unit=time_unit),
                                    format_ratio(gpu_ratio))
                            ]
                            all_row_values.append(row_values)
                    for device_node_name, device_node in item.devices.items():
                        if item.general_gpu_time == 0:
                            gpu_ratio = 0
                        else:
                            gpu_ratio = float(
                                device_node.gpu_time) / item.general_gpu_time
                        if len(device_node_name) + 2 > name_column_width:
                            device_node_name = device_node_name[:
                                                                name_column_width
                                                                - 5]
                            device_node_name += "..."
                        row_values = [
                            '  {}'.format(device_node_name), device_node.call,
                            '- / - / - / - / -',
                            '{} / {} / {} / {} / {}'.format(
                                format_time(device_node.gpu_time,
                                            unit=time_unit),
                                format_time(device_node.avg_gpu_time,
                                            unit=time_unit),
                                format_time(device_node.max_gpu_time,
                                            unit=time_unit),
                                format_time(device_node.min_gpu_time,
                                            unit=time_unit),
                                format_ratio(gpu_ratio))
                        ]
                        all_row_values.append(row_values)
        # Calculate the column width
        calltime_width = 6
        cpu_data_description_width = 40
        gpu_data_description_width = 40
        for row_values in all_row_values:
            if isinstance(row_values, str):
                continue
            if isinstance(row_values[1],
                          int) and len(str(row_values[1])) > calltime_width:
                calltime_width = len(str(row_values[1]))
            if len(row_values[2]) > cpu_data_description_width:
                cpu_data_description_width = len(row_values[2])
            if len(row_values[3]) > gpu_data_description_width:
                gpu_data_description_width = len(row_values[3])
        headers = [
            'Name', 'Calls', 'CPU Total / Avg / Max / Min / Ratio(%)',
            'GPU Total / Avg / Max / Min / Ratio(%)'
        ]
        row_format_list = [""]
        header_sep_list = [""]
        line_length_list = [-SPACING_SIZE]
        add_column(name_column_width)
        add_column(calltime_width)
        add_column(cpu_data_description_width)
        add_column(gpu_data_description_width)

        row_format = row_format_list[0]
        header_sep = header_sep_list[0]
        line_length = line_length_list[0]

        # construct table string
        append(add_title(line_length, "Operator Summary"))
        append('Time unit: {}'.format(time_unit))
        append(header_sep)
        append(row_format.format(*headers))
        append(header_sep)
        for row_values in all_row_values:
            if isinstance(row_values, str):
                append(add_title(line_length, row_values))
            else:
                append(row_format.format(*row_values))
        append(header_sep)
        append('')
        append('')

    ###### Print Kernel Summary Report ######
    if statistic_data.event_summary.kernel_items:
        all_row_values = []
        kernel_items = statistic_data.event_summary.kernel_items
        if sorted_by == SortedKeys.GPUAvg:
            sorted_items = sorted(kernel_items.items(),
                                  key=lambda x: x[1].avg_gpu_time,
                                  reverse=True)
        elif sorted_by == SortedKeys.GPUMax:
            sorted_items = sorted(kernel_items.items(),
                                  key=lambda x: x[1].max_gpu_time,
                                  reverse=True)
        elif sorted_by == SortedKeys.GPUMin:
            sorted_items = sorted(kernel_items.items(),
                                  key=lambda x: x[1].min_gpu_time)
        else:
            sorted_items = sorted(kernel_items.items(),
                                  key=lambda x: x[1].gpu_time,
                                  reverse=True)

        total_kernel_gpu_time = 0
        for name, item in sorted_items:
            total_kernel_gpu_time += item.gpu_time
        for name, item in sorted_items:
            if total_kernel_gpu_time == 0:
                gpu_ratio = 0
            else:
                gpu_ratio = float(item.gpu_time) / total_kernel_gpu_time
            row_values = [
                name,
                item.call,
                '{} / {} / {} / {} / {}'.format(
                    format_time(item.gpu_time, unit=time_unit),
                    format_time(item.avg_gpu_time, unit=time_unit),
                    format_time(item.max_gpu_time, unit=time_unit),
                    format_time(item.min_gpu_time, unit=time_unit),
                    format_ratio(gpu_ratio)),
            ]
            all_row_values.append(row_values)

        headers = ['Name', 'Calls', 'GPU Total / Avg / Max / Min / Ratio(%)']
        # Calculate the column width
        name_column_width = 90
        calltime_width = 6
        gpu_data_description_width = 40
        for row_values in all_row_values:
            if isinstance(row_values[1],
                          int) and len(str(row_values[1])) > calltime_width:
                calltime_width = len(str(row_values[1]))
            if len(row_values[2]) > gpu_data_description_width:
                gpu_data_description_width = len(row_values[2])

        row_format_list = [""]
        header_sep_list = [""]
        line_length_list = [-SPACING_SIZE]
        add_column(name_column_width)
        add_column(calltime_width)
        add_column(gpu_data_description_width)

        row_format = row_format_list[0]
        header_sep = header_sep_list[0]
        line_length = line_length_list[0]

        # construct table string
        append(add_title(line_length, "Kernel Summary"))
        append('Time unit: {}'.format(time_unit))
        append(header_sep)
        append(row_format.format(*headers))
        append(header_sep)
        kernel_name_pattern = re.compile('(.+?)(<.*>)(\(.*\))')
        for row_values in all_row_values:
            match = kernel_name_pattern.match(row_values[0])
            if match:
                name = match.group(1) + match.group(2)
            else:
                name = row_values[0]
            if len(name) > name_column_width:
                row_values[0] = name[:name_column_width - 3] + '...'
            else:
                row_values[0] = name
            append(row_format.format(*row_values))
        append(header_sep)
        append('')
        append('')

    ###### Print Memory Manipulation Summary Report ######
    if statistic_data.event_summary.memory_manipulation_items:
        all_row_values = []
        memory_manipulation_items = statistic_data.event_summary.memory_manipulation_items
        gpu_total_time = statistic_data.event_summary.model_perspective_items[
            'ProfileStep'].general_gpu_time
        for name, item in memory_manipulation_items.items():
            if gpu_total_time == 0:
                gpu_ratio = 0
            else:
                gpu_ratio = float(item.general_gpu_time) / gpu_total_time
            row_values = [
                name,
                item.call,
                '{} / {} / {} / {} / {}'.format(
                    format_time(item.cpu_time, unit=time_unit),
                    format_time(item.avg_cpu_time, unit=time_unit),
                    format_time(item.max_cpu_time, unit=time_unit),
                    format_time(item.min_cpu_time, unit=time_unit),
                    format_ratio(float(item.cpu_time) / total_time)),
                '{} / {} / {} / {} / {}'.format(
                    format_time(item.general_gpu_time, unit=time_unit),
                    format_time(item.avg_general_gpu_time, unit=time_unit),
                    format_time(item.max_general_gpu_time, unit=time_unit),
                    format_time(item.min_general_gpu_time, unit=time_unit),
                    format_ratio(gpu_ratio)),
            ]
            all_row_values.append(row_values)

        headers = [
            'Name', 'Calls', 'CPU Total / Avg / Max / Min / Ratio(%)',
            'GPU Total / Avg / Max / Min / Ratio(%)'
        ]
        # Calculate the column width
        name_column_width = 0
        calltime_width = 6
        cpu_data_description_width = 40
        gpu_data_description_width = 40
        for row_values in all_row_values:
            if len(row_values[0]) > name_column_width:
                name_column_width = len(row_values[0])
            if isinstance(row_values[1],
                          int) and len(str(row_values[1])) > calltime_width:
                calltime_width = len(str(row_values[1]))
            if len(row_values[2]) > cpu_data_description_width:
                cpu_data_description_width = len(row_values[2])
            if len(row_values[3]) > gpu_data_description_width:
                gpu_data_description_width = len(row_values[3])

        row_format_list = [""]
        header_sep_list = [""]
        line_length_list = [-SPACING_SIZE]
        add_column(name_column_width)
        add_column(calltime_width)
        add_column(cpu_data_description_width)
        add_column(gpu_data_description_width)

        row_format = row_format_list[0]
        header_sep = header_sep_list[0]
        line_length = line_length_list[0]

        # construct table string
        append(add_title(line_length, "Memory Manipulation Summary"))
        append('Time unit: {}'.format(time_unit))
        append(header_sep)
        append(row_format.format(*headers))
        append(header_sep)
        for row_values in all_row_values:
            append(row_format.format(*row_values))
        append(header_sep)
        append('')
        append('')
    ###### Print UserDefined Summary Report ######
    if statistic_data.event_summary.userdefined_items:
        all_row_values = []
        gpu_total_time = statistic_data.event_summary.model_perspective_items[
            'ProfileStep'].general_gpu_time
        if thread_sep == True:
            userdefined_thread_items = statistic_data.event_summary.userdefined_thread_items
        else:
            userdefined_thread_items = {
                'All threads merged':
                statistic_data.event_summary.userdefined_items
            }
        for thread_id, items in userdefined_thread_items.items():
            all_row_values.append("Thread: {}".format(thread_id))
            if sorted_by == SortedKeys.CPUTotal:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].cpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.CPUAvg:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].avg_cpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.CPUMax:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].max_cpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.CPUMin:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].min_cpu_time)
            elif sorted_by == SortedKeys.GPUTotal:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].general_gpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.GPUAvg:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].avg_general_gpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.GPUMax:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].max_general_gpu_time,
                                      reverse=True)
            elif sorted_by == SortedKeys.GPUMin:
                sorted_items = sorted(items.items(),
                                      key=lambda x: x[1].min_general_gpu_time)

            for name, item in sorted_items:
                if gpu_total_time == 0:
                    gpu_ratio = 0
                else:
                    gpu_ratio = float(item.general_gpu_time) / gpu_total_time
                row_values = [
                    name,
                    item.call,
                    '{} / {} / {} / {} / {}'.format(
                        format_time(item.cpu_time, unit=time_unit),
                        format_time(item.avg_cpu_time, unit=time_unit),
                        format_time(item.max_cpu_time, unit=time_unit),
                        format_time(item.min_cpu_time, unit=time_unit),
                        format_ratio(float(item.cpu_time) / total_time)),
                    '{} / {} / {} / {} / {}'.format(
                        format_time(item.general_gpu_time, unit=time_unit),
                        format_time(item.avg_general_gpu_time, unit=time_unit),
                        format_time(item.max_general_gpu_time, unit=time_unit),
                        format_time(item.min_general_gpu_time, unit=time_unit),
                        format_ratio(gpu_ratio)),
                ]
                all_row_values.append(row_values)

        # Calculate the column width
        name_column_width = 0
        calltime_width = 6
        cpu_data_description_width = 40
        gpu_data_description_width = 40
        for row_values in all_row_values:
            if isinstance(row_values, str):
                continue
            if len(row_values[0]) > name_column_width:
                name_column_width = len(row_values[0])
            if isinstance(row_values[1],
                          int) and len(str(row_values[1])) > calltime_width:
                calltime_width = len(str(row_values[1]))
            if len(row_values[2]) > cpu_data_description_width:
                cpu_data_description_width = len(row_values[2])
            if len(row_values[3]) > gpu_data_description_width:
                gpu_data_description_width = len(row_values[3])

        headers = [
            'Name', 'Calls', 'CPU Total / Avg / Max / Min / Ratio(%)',
            'GPU Total / Avg / Max / Min / Ratio(%)'
        ]
        row_format_list = [""]
        header_sep_list = [""]
        line_length_list = [-SPACING_SIZE]

        add_column(name_column_width)
        add_column(calltime_width)
        add_column(cpu_data_description_width)
        add_column(gpu_data_description_width)

        row_format = row_format_list[0]
        header_sep = header_sep_list[0]
        line_length = line_length_list[0]

        # construct table string
        append(add_title(line_length, "UserDefined Summary"))
        append('Time unit: {}'.format(time_unit))
        append(header_sep)
        append(row_format.format(*headers))
        append(header_sep)
        for row_values in all_row_values:
            if isinstance(row_values, str):
                append(add_title(line_length, row_values))
            else:
                append(row_format.format(*row_values))
        append('')
        append('')

    return ''.join(result)


class DataParser:
  '''

  '''
  def __init__(self, filename):
    pass