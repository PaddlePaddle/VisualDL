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


def merge_ranges(range_list1, range_list2, is_sorted=False):
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
        # print('name: {} , children length: {}'.format(self.name, len(self.children_node)))
        for child in self.children_node:
            # print(child.name)
            child.cal_statistic()
            if child.is_terminal_operator_node == False:
                self.is_terminal_operator_node = False
        for rt in self.runtime_node:
            rt.cal_statistic()
        self.cpu_time = self.hostnode.end_ns - self.hostnode.start_ns
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


def format_time(time, unit='ms'):
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
        return '{:.2f}'.format(result)


def format_ratio(ratio):
    r"""
    Transform ratio within [0, 1] to percentage presentation.
    """
    return '{:.2f}'.format(ratio * 100)
