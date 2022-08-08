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

from .kernel_parser import DeviceItem
from .utils import wrap_tree


class OperatorItem:
    def __init__(self, name):
        self.name = name
        self.call = 0
        self.cpu_time = 0
        self.gpu_time = 0
        self.max_cpu_time = 0
        self.min_cpu_time = float('inf')
        self.max_gpu_time = 0
        self.min_gpu_time = float('inf')
        self.devices = {}
        self.operator_inners = {}
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
        for child in node.children_node:
            if child.type != 'Operator':
                if child.name not in self.operator_inners:
                    self.operator_inners[child.name] = OperatorItem(child.name)
                self.operator_inners[child.name].add_item(child)

        for runtimenode in node.runtime_node:
            for devicenode in runtimenode.device_node:
                name = devicenode.name
                if name not in self.devices:
                    self.devices[name] = DeviceItem(name)
                self.devices[name].add_item(devicenode)


class OperatorParser:
    r"""
    Analyse operator event in profiling data, correlate with its device event.
    """

    def __init__(self):
        self.items = {}  # for operator summary
        self.items_with_input_shape = collections.defaultdict(dict)

    def parse(self, nodetrees):
        r"""
        Analysis operator event in the nodetress.
        """
        node_statistic_trees, thread2host_statistic_nodes = wrap_tree(
            nodetrees)
        for threadid, host_statistic_nodes in thread2host_statistic_nodes.items(
        ):
            for host_statistic_node in host_statistic_nodes[
                    1:]:  # skip root node
                if host_statistic_node.type == 'Operator':
                    self.add_operator_item(host_statistic_node)

    def add_operator_item(self, operator_node):
        if operator_node.name not in self.items:
            self.items[operator_node.name] = OperatorItem(operator_node.name)
        input_shape_str = self._translate_op_input_shape_to_string(
            operator_node.input_shapes)
        if input_shape_str not in self.items_with_input_shape[
                operator_node.name]:
            self.items_with_input_shape[
                operator_node.name][input_shape_str] = OperatorItem(
                    operator_node.name)

        self.items[operator_node.name].add_item(operator_node)
        self.items_with_input_shape[
            operator_node.name][input_shape_str].add_item(operator_node)

    def _translate_op_input_shape_to_string(self, input_shape):
        result = ''
        for arg, shape in input_shape.items():
            result += '{}-{}\t'.format(arg, shape)
        return result
