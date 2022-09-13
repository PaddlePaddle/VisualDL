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
import os
import sys

StageType = ['Dataloader', 'Forward', 'Backward', 'Optimization']


def sum_ranges(ranges):
    result = 0
    for time_range in ranges:
        result += (time_range[1] - time_range[0])
    return result


def merge_self_ranges(src_ranges, is_sorted=False):
    merged_ranges = []
    if len(src_ranges) > 0:
        if not is_sorted:
            src_ranges.sort(key=lambda x: x[0])
        cur_indx = 0
        merged_ranges.append((src_ranges[cur_indx][0],
                              src_ranges[cur_indx][1]))
        for cur_indx in range(1, len(src_ranges)):
            if src_ranges[cur_indx][1] > merged_ranges[-1][1]:
                if src_ranges[cur_indx][0] <= merged_ranges[-1][1]:
                    merged_ranges[-1] = (merged_ranges[-1][0],
                                         src_ranges[cur_indx][1])
                else:
                    merged_ranges.append((src_ranges[cur_indx][0],
                                          src_ranges[cur_indx][1]))
    return merged_ranges


def merge_ranges(range_list1, range_list2, is_sorted=False):  # noqa:C901
    merged_ranges = []
    if not is_sorted:
        range_list1 = merge_self_ranges(range_list1)
        range_list2 = merge_self_ranges(range_list2)
    len1 = len(range_list1)
    len2 = len(range_list2)
    if len1 == 0 and len2 == 0:
        return merged_ranges
    elif len1 == 0:
        return range_list2
    elif len2 == 0:
        return range_list1
    else:
        indx1 = 0
        indx2 = 0
        range1 = range_list1[indx1]
        range2 = range_list2[indx2]
        if range1[0] < range2[0]:
            merged_ranges.append(range1)
            indx1 += 1
        else:
            merged_ranges.append(range2)
            indx2 += 1
        while indx1 < len1 and indx2 < len2:
            range1 = range_list1[indx1]
            range2 = range_list2[indx2]
            if range1[0] < range2[0]:
                if range1[1] > merged_ranges[-1][1]:
                    if range1[0] <= merged_ranges[-1][1]:
                        merged_ranges[-1] = (merged_ranges[-1][0], range1[1])
                    else:
                        merged_ranges.append((range1[0], range1[1]))
                    indx1 += 1
                else:
                    indx1 += 1
            else:
                if range2[1] > merged_ranges[-1][1]:
                    if range2[0] <= merged_ranges[-1][1]:
                        merged_ranges[-1] = (merged_ranges[-1][0], range2[1])
                    else:
                        merged_ranges.append((range2[0], range2[1]))
                    indx2 += 1
                else:
                    indx2 += 1

        while indx1 < len1:
            range1 = range_list1[indx1]
            if range1[1] > merged_ranges[-1][1]:
                if range1[0] <= merged_ranges[-1][1]:
                    merged_ranges[-1] = (merged_ranges[-1][0], range1[1])
                else:
                    merged_ranges.append((range1[0], range1[1]))
                indx1 += 1
            else:
                indx1 += 1
        while indx2 < len2:
            range2 = range_list2[indx2]
            if range2[1] > merged_ranges[-1][1]:
                if range2[0] <= merged_ranges[-1][1]:
                    merged_ranges[-1] = (merged_ranges[-1][0], range2[1])
                else:
                    merged_ranges.append((range2[0], range2[1]))
                indx2 += 1
            else:
                indx2 += 1
    return merged_ranges


def intersection_ranges(range_list1, range_list2, is_sorted=False):
    result_range = []
    if len(range_list1) == 0 or len(range_list2) == 0:
        return result_range
    if not is_sorted:
        range_list1 = merge_self_ranges(range_list1)
        range_list2 = merge_self_ranges(range_list2)

    len1 = len(range_list1)
    len2 = len(range_list2)
    indx1 = 0
    indx2 = 0
    range1 = range_list1[indx1]
    range2 = range_list2[indx2]
    while indx1 < len1 and indx2 < len2:
        if range2[1] <= range1[0]:
            indx2 += 1
            if indx2 == len2:
                break
            range2 = range_list2[indx2]

        elif range2[0] <= range1[0] and range2[1] < range1[1]:
            assert (range2[1] > range1[0])
            result_range.append((range1[0], range2[1]))
            range1 = (range2[1], range1[1])
            indx2 += 1
            if indx2 == len2:
                break
            range2 = range_list2[indx2]

        elif range2[0] <= range1[0]:
            assert (range2[1] >= range1[1])
            result_range.append(range1)
            range2 = (range1[1], range2[1])
            indx1 += 1
            if indx1 == len1:
                break
            range1 = range_list1[indx1]

        elif range2[1] < range1[1]:
            assert (range2[0] > range1[0])
            result_range.append(range2)
            range1 = (range2[1], range1[1])
            indx2 += 1
            if indx2 == len2:
                break
            range2 = range_list2[indx2]

        elif range2[0] < range1[1]:
            assert (range2[1] >= range1[1])
            result_range.append((range2[0], range1[1]))
            range2 = (range1[1], range2[1])
            indx1 += 1
            if indx1 == len1:
                break
            range1 = range_list1[indx1]

        else:
            assert (range2[0] >= range1[1])
            indx1 += 1
            if indx1 == len1:
                break
            range1 = range_list1[indx1]
    return result_range


def subtract_ranges(range_list1, range_list2, is_sorted=False):
    result_range = []
    if not is_sorted:
        range_list1 = merge_self_ranges(range_list1)
        range_list2 = merge_self_ranges(range_list2)
    if len(range_list1) == 0:
        return result_range
    if len(range_list2) == 0:
        return range_list1

    len1 = len(range_list1)
    len2 = len(range_list2)
    indx1 = 0
    indx2 = 0
    range1 = range_list1[indx1]
    range2 = range_list2[indx2]

    while indx1 < len(range_list1):
        if indx2 == len(range_list2):
            result_range.append(range1)
            indx1 += 1
            if indx1 == len1:
                break
            range1 = range_list1[indx1]
        elif range2[1] <= range1[0]:
            indx2 += 1
            if indx2 != len2:
                range2 = range_list2[indx2]
        elif range2[0] <= range1[0] and range2[1] < range1[1]:
            range1 = (range2[1], range1[1])
            indx2 += 1
            if indx2 != len2:
                range2 = range_list2[indx2]
        elif range2[0] <= range1[0]:
            assert (range2[1] >= range1[1])
            range2 = (range1[1], range2[1])
            indx1 += 1
            if indx1 != len1:
                range1 = range_list1[indx1]
        elif range2[0] < range1[1]:
            assert (range2[0] > range1[0])
            result_range.append((range1[0], range2[0]))
            range1 = (range2[0], range1[1])
        else:
            assert (range2[0] >= range1[1])
            result_range.append(range1)
            indx1 += 1
            if indx1 != len1:
                range1 = range_list1[indx1]
    return result_range


class HostStatisticNode:
    r'''
    Wrap original node for calculating statistic metrics.
    '''

    def __init__(self, hostnode):
        self.hostnode = hostnode
        self.children_node = []
        self.runtime_node = []
        self.cpu_time = 0
        self.self_cpu_time = 0
        self.gpu_time = 0  # kernel time
        self.self_gpu_time = 0
        self.general_gpu_time = 0  # besides kernel, include time of gpu events like memcpy and memset
        self.self_general_gpu_time = 0
        self.is_terminal_operator_node = True

    def cal_statistic(self):
        for child in self.children_node:
            child.cal_statistic()
            if child.is_terminal_operator_node is False:
                self.is_terminal_operator_node = False
        for rt in self.runtime_node:
            rt.cal_statistic()
        self.cpu_time = self.hostnode.end_ns - self.hostnode.start_ns
        self.self_cpu_time = self.cpu_time
        for child in self.children_node:
            if child.type == 'Operator':
                self.is_terminal_operator_node = False
            self.gpu_time += child.gpu_time
            self.general_gpu_time += child.general_gpu_time
            self.self_cpu_time -= (child.end_ns - child.start_ns)
        for rt in self.runtime_node:
            self.self_cpu_time -= (rt.end_ns - rt.start_ns)
            self.gpu_time += rt.gpu_time
            self.self_gpu_time += rt.gpu_time
            self.general_gpu_time += rt.general_gpu_time
            self.self_general_gpu_time += rt.general_gpu_time
        for device in self.hostnode.device_node:
            if device.type == 'Kernel':
                self.gpu_time += (device.end_ns - device.start_ns)
                self.self_gpu_time += (device.end_ns - device.start_ns)
            self.general_gpu_time += (device.end_ns - device.start_ns)
            self.self_general_gpu_time += (device.end_ns - device.start_ns)

    @property
    def end_ns(self):
        return self.hostnode.end_ns

    @property
    def start_ns(self):
        return self.hostnode.start_ns

    def __getattr__(self, name):
        return getattr(self.hostnode, name)


def traverse_tree(nodetrees):
    results = collections.defaultdict(list)
    for thread_id, rootnode in nodetrees.items():
        stack = []
        stack.append(rootnode)
        threadlist = results[thread_id]
        while stack:
            current_node = stack.pop()
            threadlist.append(current_node)
            for childnode in current_node.children_node:
                stack.append(childnode)
    return results


def get_device_nodes(hostnode):
    '''
    Get all device nodes called in the time range of hostnode.
    '''
    stack = []
    device_nodes = []
    stack.append(hostnode)
    while stack:
        current_node = stack.pop()
        for childnode in current_node.children_node:
            stack.append(childnode)
        for runtimenode in current_node.runtime_node:
            for devicenode in runtimenode.device_node:
                device_nodes.append(devicenode)
    return device_nodes


def wrap_tree(nodetrees):
    '''
    Using HostStatisticNode to wrap original profiler result tree, and calculate node statistic metrics.
    '''
    node_statistic_tree = {}
    results = collections.defaultdict(list)
    newresults = collections.defaultdict(list)
    for thread_id, rootnode in nodetrees.items():
        stack = []
        stack.append(rootnode)
        root_statistic_node = HostStatisticNode(rootnode)
        newstack = []
        newstack.append(root_statistic_node)
        node_statistic_tree[thread_id] = root_statistic_node
        threadlist = results[thread_id]
        newthreadlist = newresults[thread_id]
        while stack:
            current_node = stack.pop()
            threadlist.append(current_node)
            current_statistic_node = newstack.pop()
            newthreadlist.append(current_statistic_node)
            for childnode in current_node.children_node:
                stack.append(childnode)
                child_statistic_node = HostStatisticNode(childnode)
                current_statistic_node.children_node.append(
                    child_statistic_node)
                newstack.append(child_statistic_node)
            for runtimenode in current_node.runtime_node:
                runtime_statistic_node = HostStatisticNode(runtimenode)
                current_statistic_node.runtime_node.append(
                    runtime_statistic_node)
    # recursive calculate node statistic values
    for thread_id, root_statistic_node in node_statistic_tree.items():
        root_statistic_node.cal_statistic()

    return node_statistic_tree, newresults


def rebuild_node_trees(nodetrees):  # noqa:C901
    template_root = None
    # First, we find the tree which includes Forward event.
    for threadid, root in nodetrees.items():
        has_find_template_root = False
        template_root = HostStatisticNode(root)
        for children in root.children_node:
            if children.type == 'ProfileStep':
                profiler_step_node = HostStatisticNode(children)
                template_root.children_node.append(profiler_step_node)
                has_find_template_root = True
                for stage_node in children.children_node:
                    if stage_node.type in StageType:
                        profiler_step_node.children_node.append(
                            HostStatisticNode(stage_node))
            else:
                break
        if has_find_template_root is True:
            break

    if template_root is None:
        print('No profiler steps found, overview page will have no data.')

    wrapped_tree = {}
    for thread_id, rootnode in nodetrees.items():
        has_find_template_root = False
        for children in rootnode.children_node:
            if children.type == 'ProfileStep':
                has_find_template_root = True
                break

        unwrapped_stack = []
        warpped_stack = []

        root_statistic_node = HostStatisticNode(rootnode)
        wrapped_tree[thread_id] = root_statistic_node
        if has_find_template_root is False:
            for profiler_step_node in template_root.children_node:
                profiler_step_wrap_node = HostStatisticNode(
                    profiler_step_node.hostnode)
                root_statistic_node.children_node.append(
                    profiler_step_wrap_node)
                for stage_node in profiler_step_node.children_node:
                    stage_wrap_node = HostStatisticNode(stage_node.hostnode)
                    profiler_step_wrap_node.children_node.append(
                        stage_wrap_node)
            # insert nodes in original root into new stage nodes
            # algorithm: post order traversal the tree
            stack = []
            flag_stack = []
            post_order_nodes = []
            stack.append(root_statistic_node)
            flag_stack.append(0)
            while stack:
                current_node = stack.pop()
                flag = flag_stack.pop()
                if flag == 0:
                    stack.append(current_node)
                    flag_stack.append(1)
                    for children_node in reversed(current_node.children_node):
                        stack.append(children_node)
                        flag_stack.append(0)
                else:
                    post_order_nodes.append(current_node)
            # traverse post_order_nodes and insert right position
            for runtimenode in rootnode.runtime_node:
                runtime_wrapped_node = HostStatisticNode(runtimenode)
                root_statistic_node.runtime_node.append(runtime_wrapped_node)
            for node in rootnode.children_node:
                unwrapped_stack.append(node)
                for wrapped_node in post_order_nodes:
                    if node.start_ns >= wrapped_node.start_ns and node.end_ns <= wrapped_node.end_ns:
                        child_wrapped_node = HostStatisticNode(node)
                        warpped_stack.append(child_wrapped_node)
                        wrapped_node.children_node.append(child_wrapped_node)
                        break
        else:
            unwrapped_stack.append(rootnode)
            warpped_stack.append(root_statistic_node)
        while unwrapped_stack:
            current_node = unwrapped_stack.pop()
            current_wrapped_node = warpped_stack.pop()
            for childnode in current_node.children_node:
                unwrapped_stack.append(childnode)
                child_wrapped_node = HostStatisticNode(childnode)
                current_wrapped_node.children_node.append(child_wrapped_node)
                warpped_stack.append(child_wrapped_node)
            for runtimenode in current_node.runtime_node:
                runtime_wrapped_node = HostStatisticNode(runtimenode)
                current_wrapped_node.runtime_node.append(runtime_wrapped_node)

    # recursive calculate node statistic values
    for thread_id, root_wrapped_node in wrapped_tree.items():
        root_wrapped_node.cal_statistic()
    return wrapped_tree


def format_time(time, unit='ms', inf_subs='-'):
    r"""
    Transform time in ns to time in unit.
    """
    if time == float('inf'):
        return inf_subs
    else:
        result = float(time)
        if unit == 's':
            result /= 1e9
        elif unit == 'ms':
            result /= 1e6
        elif unit == 'us':
            result /= 1e3
        return round(result, 2)


def format_ratio(ratio):
    r"""
    Transform ratio within [0, 1] to percentage presentation.
    """
    return round(ratio * 100, 2)


def format_float(float_data):
    return round(float_data, 2)


def format_memory(memory, memory_unit='KB'):
    result = float(memory)
    if memory_unit == 'GB':
        result /= (1024 * 1024 * 1024)
    elif memory_unit == 'MB':
        result /= (1024 * 1024)
    elif memory_unit == 'KB':
        result /= 1024
    return round(result, 2)


class RedirectStdStreams(object):
    def __init__(self, stdout=None, stderr=None):
        self._stdout = stdout or sys.stdout
        self._stderr = stderr or sys.stderr

    def __enter__(self):
        '''
        Replace stdout and stderr to specified stream.
        '''
        sys.stdout.flush()
        sys.stderr.flush()
        self.old_stdout_fileno, self.old_stderr_fileno = os.dup(
            sys.stdout.fileno()), os.dup(sys.stderr.fileno())
        os.dup2(self._stdout.fileno(), sys.stdout.fileno())
        os.dup2(self._stderr.fileno(), sys.stderr.fileno())

    def __exit__(self, exc_type, exc_value, traceback):
        os.dup2(self.old_stdout_fileno, sys.stdout.fileno())
        os.dup2(self.old_stderr_fileno, sys.stderr.fileno())
        os.close(self.old_stdout_fileno)
        os.close(self.old_stderr_fileno)
