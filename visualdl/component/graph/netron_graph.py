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
from collections import deque


class Model:
    def __init__(self, graph_data):
        self.name = 'Paddle Graph'
        self.version = graph_data['version']
        self.all_nodes = {node['name']: node for node in graph_data['nodes']}
        self.all_vars = {var['name']: var for var in graph_data['vars']}
        self.all_edges = {(edge['from_node'], edge['to_node']): edge
                          for edge in graph_data['edges']}
        self.visible_maps = {
            node['name']: (True if not node['children_node'] else False)
            for node in graph_data['nodes']
        }
        root_node = self.all_nodes['/']
        for child_name in root_node['children_node']:
            self.visible_maps[child_name] = True

    def make_graph(self, refresh=False, expand_all=False):
        if refresh is True:
            self.visible_maps = {
                node['name']: (True if not node['children_node'] else False)
                for node in self.all_nodes.values()
            }
            root_node = self.all_nodes['/']
            for child_name in root_node['children_node']:
                self.visible_maps[child_name] = True
        if expand_all is True:
            self.visible_maps = {
                node['name']: (True if not node['children_node'] else False)
                for node in self.all_nodes.values()
            }
        self.current_nodes = {
            node_name: self.all_nodes[node_name]
            for node_name in self.get_current_visible_nodes()
        }
        return Graph(self.current_nodes, self.all_vars)

    def get_all_leaf_nodes(self):
        return Graph(self.all_nodes, self.all_vars)

    def get_current_visible_nodes(self):
        # bfs traversal to get current visible nodes
        # if one node is visible now, all its children nodes are invisible
        current_visible_nodes = []
        travesal_queue = deque()
        visited_map = defaultdict(bool)
        travesal_queue.append('/')
        visited_map['/'] = True
        while travesal_queue:
            current_name = travesal_queue.popleft()
            current_node = self.all_nodes[current_name]
            if self.visible_maps[current_name] is True:
                current_visible_nodes.append(current_name)
            else:
                for child_name in current_node['children_node']:
                    if visited_map[child_name] is False:
                        travesal_queue.append(child_name)
                        visited_map[child_name] = True
        return current_visible_nodes

    def adjust_visible(self, node_name, expand=True, keep_state=False):
        if (expand):
            if self.all_nodes[node_name]['is_leaf_node'] is True:
                return
            if keep_state:
                self.visible_maps[node_name] = False
            else:
                self.visible_maps[node_name] = False
                current_node = self.all_nodes[node_name]
                for child_name in current_node['children_node']:
                    self.visible_maps[child_name] = True
        else:
            self.visible_maps[node_name] = True

    def adjust_search_node_visible(self,
                                   node_name,
                                   keep_state=False,
                                   is_node=True):
        if node_name is None:
            return
        node_names = []
        if is_node is False:
            var = self.all_vars[node_name]
            node_names.append(var['from_node'])
            node_names.extend(var['to_nodes'])
        else:
            node_names.append(node_name)
        for node_name in node_names:
            topmost_parent = None
            parent_node_name = self.all_nodes[node_name]['parent_node']
            while (parent_node_name != '/'):
                if self.visible_maps[parent_node_name] is True:
                    topmost_parent = parent_node_name
                parent_node_name = self.all_nodes[parent_node_name][
                    'parent_node']
            if topmost_parent is not None:
                self.visible_maps[topmost_parent] = False
                parent_node_name = self.all_nodes[node_name]['parent_node']
                if (keep_state):
                    self.visible_maps[node_name] = True
                    while (parent_node_name != topmost_parent):
                        self.visible_maps[parent_node_name] = False
                        parent_node_name = self.all_nodes[parent_node_name][
                            'parent_node']
                else:
                    for child_name in self.all_nodes[parent_node_name][
                            'children_node']:
                        self.visible_maps[child_name] = True
                    self.visible_maps[parent_node_name] = False
                    key_path_node_name = parent_node_name
                    while (parent_node_name != topmost_parent):
                        parent_node_name = self.all_nodes[parent_node_name][
                            'parent_node']
                        for child_name in self.all_nodes[parent_node_name][
                                'children_node']:
                            if child_name != key_path_node_name:
                                self.visible_maps[child_name] = True
                            else:
                                self.visible_maps[child_name] = False
                        key_path_node_name = parent_node_name


class Graph(dict):
    def __init__(self, nodes, all_vars):
        self.nodes = []
        self.inputs = []
        self.outputs = []
        self.name = 'Paddle Graph'
        output_idx = 0
        for op_node in nodes.values():
            if op_node['type'] == 'feed':
                for key, value in op_node["output_vars"].items():
                    self.inputs.append(
                        Parameter(
                            value[0],
                            [Argument(name, all_vars[name])
                             for name in value]))
                continue
            if op_node['type'] == 'fetch':
                for key, value in op_node["input_vars"].items():
                    self.outputs.append(
                        Parameter(
                            'Output{}'.format(output_idx),
                            [Argument(name, all_vars[name])
                             for name in value]))
                    output_idx += 1
                continue
            self.nodes.append(Node(op_node, all_vars))

        super(Graph, self).__init__(
            name=self.name,
            nodes=self.nodes,
            inputs=self.inputs,
            outputs=self.outputs)


class Node(dict):
    def __init__(self, node, all_vars):
        self.name = node['name']
        self.show_name = node['show_name']
        self.type = node['type']
        self.attributes = [
            Attribute(key, value, node['attr_types'][key])
            for key, value in node['attrs'].items()
        ]
        self.inputs = [
            Parameter(key, [Argument(name, all_vars[name]) for name in value])
            for key, value in node["input_vars"].items()
        ]
        self.outputs = [
            Parameter(key, [Argument(name, all_vars[name]) for name in value])
            for key, value in node["output_vars"].items()
        ]
        self.chain = []
        self.visible = True
        self.is_leaf = node['is_leaf_node']
        super(Node, self).__init__(
            name=self.name,
            type=self.type,
            attributes=self.attributes,
            inputs=self.inputs,
            outputs=self.outputs,
            chain=self.chain,
            visible=self.visible,
            is_leaf=self.is_leaf,
            show_name=self.show_name)


class Attribute(dict):
    def __init__(self, key, value, attr_type):
        self.name = key
        self.value = value
        self.type = attr_type
        self.visible = True if key not in [
            'use_mkldnn', 'use_cudnn', 'op_callstack', 'op_role',
            'op_role_var', 'op_namescope', 'is_test'
        ] else False
        super(Attribute, self).__init__(
            name=self.name,
            value=self.value,
            type=self.type,
            visible=self.visible)


class Parameter(dict):
    def __init__(self, name, args):
        self.name = name
        self.visible = True
        self.arguments = args
        super(Parameter, self).__init__(
            name=self.name, visible=self.visible, arguments=self.arguments)


class Argument(dict):
    def __init__(self, name, var):
        self.name = name
        self.type = TensorType(var['dtype'], var['shape'])
        self.initializer = None if var['persistable'] is False else self.type
        super(Argument, self).__init__(
            name=self.name, type=self.type, initializer=self.initializer)


class TensorType(dict):
    def __init__(self, datatype, shape):
        self.dataType = datatype
        self.shape = TensorShape(shape)
        self.denotation = None
        super(TensorType, self).__init__(
            dataType=self.dataType,
            shape=self.shape,
            denotation=self.denotation)


class TensorShape(dict):
    def __init__(self, dimensions):
        self.dimensions = dimensions
        super(TensorShape, self).__init__(dimensions=self.dimensions)
