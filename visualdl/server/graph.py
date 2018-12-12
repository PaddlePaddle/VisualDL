# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
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

from __future__ import absolute_import
import json
import os

from google.protobuf.json_format import MessageToJson

from . import graphviz_graph as gg
from .model import onnx
from .model import paddle


def debug_print(json_obj):
    print(
        json.dumps(json_obj, sort_keys=True, indent=4, separators=(',', ': ')))


def reorganize_inout(json_obj, key):
    """
    :param json_obj: the model's json obj
    :param key: "input or output"
    :return:
    """
    for index in range(len(json_obj[key])):
        var = json_obj[key][index]
        var_new = dict()

        # set name
        var_new['name'] = var['name']

        tensor_type = var['type']['tensorType']

        # set data_type
        var_new['data_type'] = tensor_type['elemType']

        # set shape
        shape = [dim['dimValue'] for dim in tensor_type['shape']['dim']]
        var_new['shape'] = shape

        json_obj[key][index] = var_new


def rename_model(model_json):
    def rename_edge(model_json, old_name, new_name):
        for node in model_json['node']:
            inputs = node['input']
            for idx in range(len(inputs)):
                if inputs[idx] == old_name:
                    inputs[idx] = new_name
            outputs = node['output']
            for idx in range(len(outputs)):
                if outputs[idx] == old_name:
                    outputs[idx] = new_name

    def rename_variables(model, variables):
        for variable in variables:
            old_name = variable['name']
            new_shape = [int(dim) for dim in variable['shape']]
            new_name = old_name + '\ndata_type=' + str(
                variable['data_type']) + '\nshape=' + str(new_shape)
            variable['name'] = new_name
            rename_edge(model, old_name, new_name)

    rename_variables(model_json, model_json['input'])
    rename_variables(model_json, model_json['output'])

    # rename
    all_nodes = model_json['node']
    for idx in range(len(all_nodes)):
        name = ""
        if "name" in all_nodes[idx]:
            name = all_nodes[idx]['name']
        op_type = all_nodes[idx]['opType']
        new_name = str(idx) + '\n' + str(op_type)
        if name != "":
            new_name = new_name + "\n" + name
        all_nodes[idx]['name'] = new_name


def get_links(model_json):
    links = []

    for input in model_json['input']:
        name = input['name']
        for node in model_json['node']:
            if name in node['input']:
                links.append({'source': name, "target": node['name']})

    for source_node in model_json['node']:
        for output in source_node['output']:
            for target_node in model_json['node']:
                if output in target_node['input']:
                    links.append({
                        'source': source_node['name'],
                        'target': target_node['name']
                    })

    return links


def get_node_links(model_json):
    """
    :return:
    {
        "0": {
            "input": [],
            "output": [
                1
            ]
        },
        "1": {
            "input": [
                0
            ],
            "output": [
                2
            ]
        }
    }
    """
    node_links = dict()
    nodes = model_json['node']

    # init all nodes
    for idx in range(len(nodes)):
        node_links[idx] = {'input': list(), 'output': list()}

    for src_idx in range(len(nodes)):
        for out_name in nodes[src_idx]['output']:
            for dst_idx in range(len(nodes)):
                if out_name in nodes[dst_idx]['input']:
                    node_links[src_idx]['output'].append(dst_idx)
                    node_links[dst_idx]['input'].append(src_idx)

    return node_links


def add_level_to_node_links(node_links):
    """
    :return:
    {
        "0": {
            "input": [],
            "output": [
                1
            ],
            "level": 1
        },
        "1": {
            "input": [
                0
            ],
            "output": [
                2
            ],
            "level": 2
        }
    }
    """
    # init level
    for key in node_links:
        node_links[key]['level'] = None
    for idx in range(len(node_links)):
        # the start up op's level is 1
        if len(node_links[idx]['input']) == 0:
            node_links[idx]['level'] = 1
        else:
            cur_level = node_links[idx]['level']
            for in_idx in node_links[idx]['input']:
                in_level = node_links[in_idx]['level']
                assert in_level is not None
                if cur_level is None or in_level >= cur_level:
                    node_links[idx]['level'] = in_level + 1


def get_level_to_all(node_links, model_json):
    """
    level_to_nodes {level -> [node_1, node_2]}
    output:
    {
        "35": {
        "inputs": [
            38,
            39
        ],
        "nodes": [
            46
        ],
        "outputs": []
    }, {}
    """
    level_to_nodes = dict()
    for idx in node_links:
        level = node_links[idx]['level']
        if level not in level_to_nodes:
            level_to_nodes[level] = list()
        level_to_nodes[level].append(idx)
    # debug_print(level_to_nodes)
    """
    input_to_level {idx -> level}
    level_to_inputs {level -> [input1, input2]}
    """
    nodes = model_json['node']

    input_to_level = dict()
    inputs = model_json['input']
    for in_idx in range(len(inputs)):
        in_name = inputs[in_idx]['name']
        for node_idx in range(len(nodes)):
            if in_name in nodes[node_idx]['input']:
                node_level = node_links[node_idx]['level']
                in_level = node_level - 1
                if in_idx not in input_to_level:
                    input_to_level[in_idx] = in_level
                elif input_to_level[in_idx] > in_level:
                    input_to_level[in_idx] = in_level

    level_to_inputs = dict()
    for in_idx in input_to_level:
        level = input_to_level[in_idx]
        if level not in level_to_inputs:
            level_to_inputs[level] = list()
        level_to_inputs[level].append(in_idx)

    # debug_print(level_to_inputs)

    # get output level
    output_to_level = dict()
    outputs = model_json['output']
    for out_idx in range(len(outputs)):
        out_name = outputs[out_idx]['name']
        for node_idx in range(len(nodes)):
            if out_name in nodes[node_idx]['output']:
                node_level = node_links[node_idx]['level']
                out_level = node_level + 1
                if out_level not in output_to_level:
                    output_to_level[out_idx] = out_level
                else:
                    raise Exception("output " + out_name +
                                    "have multiple source")
    level_to_outputs = dict()
    for out_idx in output_to_level:
        level = output_to_level[out_idx]
        if level not in level_to_outputs:
            level_to_outputs[level] = list()
        level_to_outputs[level].append(out_idx)

    level_to_all = dict()

    def init_level(level):
        if level not in level_to_all:
            level_to_all[level] = {
                'nodes': list(),
                'inputs': list(),
                'outputs': list()
            }

    # merge all levels
    for level in level_to_nodes:
        init_level(level)
        level_to_all[level]['nodes'] = level_to_nodes[level]
    for level in level_to_inputs:
        init_level(level)
        level_to_all[level]['inputs'] = level_to_inputs[level]
    for level in level_to_outputs:
        init_level(level)
        level_to_all[level]['outputs'] = level_to_outputs[level]

    # debug_print(level_to_all)

    return level_to_all


def level_to_coordinate(level_to_all):
    default_x = 100
    x_step = 100
    default_y = 10
    y_step = 100

    node_to_coordinate = dict()
    input_to_coordinate = dict()
    output_to_coordinate = dict()

    def get_coordinate(x_idx, y_idx):
        x = default_x + x_idx * x_step
        y = default_y + y_idx * y_step
        return {"x": int(x), "y": int(y)}

    for level in level_to_all:
        nodes = level_to_all[level]['nodes']
        inputs = level_to_all[level]['inputs']
        outputs = level_to_all[level]['outputs']
        x_idx = 0
        for node_idx in nodes:
            node_to_coordinate[node_idx] = get_coordinate(x_idx, level)
            x_idx += 1
        for in_idx in inputs:
            input_to_coordinate[in_idx] = get_coordinate(x_idx, level)
            x_idx += 1
        for out_idx in outputs:
            output_to_coordinate[out_idx] = get_coordinate(x_idx, level)
            x_idx += 1

    return node_to_coordinate, input_to_coordinate, output_to_coordinate


def add_edges(json_obj):
    # TODO(daming-lu): should try to de-duplicate node's out-edge
    # Currently it is counted twice: 1 as out-edge, 1 as in-edge
    json_obj['edges'] = []
    label_incrementer = 0

    for node_index in range(0, len(json_obj['node'])):
        cur_node = json_obj['node'][node_index]

        # input edges
        if 'input' in cur_node and len(cur_node['input']) > 0:
            for source in cur_node['input']:
                json_obj['edges'].append({
                    'source':
                    source,
                    'target':
                    'node_' + str(node_index),
                    'label':
                    'label_' + str(label_incrementer)
                })
                label_incrementer += 1

        # output edge
        if 'output' in cur_node and len(cur_node['output']) > 0:
            json_obj['edges'].append({
                'source': 'node_' + str(node_index),
                'target': cur_node['output'][0],
                'label': 'label_' + str(label_incrementer)
            })
            label_incrementer += 1

    return json_obj


def to_IR_json(model_pb_path):
    model = onnx.load(model_pb_path)
    graph = model.graph
    del graph.initializer[:]

    # to json string
    json_str = MessageToJson(model.graph)
    model_json = json.loads(json_str)
    reorganize_inout(model_json, 'input')
    reorganize_inout(model_json, 'output')
    return model_json


def load_model(model_pb_path):
    model_json = to_IR_json(model_pb_path)
    model_json = add_edges(model_json)
    return model_json


class GraphPreviewGenerator(object):
    '''
    Generate a graph image for ONNX proto.
    '''

    def __init__(self, model_json):
        self.model = model_json
        # init graphviz graph
        self.graph = gg.Graph(
            self.model['name'],
            layout="dot",
            concentrate="true",
            rankdir="TB", )

        self.op_rank = self.graph.rank_group('same', 2)
        self.param_rank = self.graph.rank_group('same', 1)
        self.arg_rank = self.graph.rank_group('same', 0)

    def __call__(self, path='temp.dot', show=False):
        self.nodes = {}
        self.params = set()
        self.ops = set()
        self.args = set()

        for item in self.model['input'] + self.model['output']:
            node = self.add_param(**item)
            self.nodes[item['name']] = node
            self.params.add(item['name'])

        for id, item in enumerate(self.model['node']):
            node = self.add_op(**item)
            name = "node_" + str(id)
            self.nodes[name] = node
            self.ops.add(name)

        for item in self.model['edges']:
            source = item['source']
            target = item['target']

            if source not in self.nodes:
                self.nodes[source] = self.add_arg(source)
                self.args.add(source)
            if target not in self.nodes:
                self.nodes[target] = self.add_arg(target)
                self.args.add(target)

            if source in self.args or target in self.args:
                self.add_edge(style="dashed,bold", color="#aaaaaa", **item)
            else:
                self.add_edge(style="bold", color="#aaaaaa", **item)

        if not show:
            self.graph.display(path)
        else:
            self.graph.show(path)

    def add_param(self, name, data_type, shape):
        label = '\n'.join([
            '<<table cellpadding="5">',
            '  <tr>',
            '    <td bgcolor="#2b787e">',
            '    <b>',
            name,
            '    </b>',
            '    </td>',
            '  </tr>',
            '  <tr>',
            '    <td>',
            data_type,
            '    </td>'
            '  </tr>',
            '  <tr>',
            '    <td>',
            '[%s]' % 'x'.join(shape),
            '    </td>'
            '  </tr>',
            '</table>>',
        ])
        return self.graph.node(
            label,
            prefix="param",
            shape="none",
            style="rounded,filled,bold",
            width="1.3",
            color="#148b97",
            fontcolor="#ffffff",
            fontname="Arial")

    def add_op(self, opType, **kwargs):
        return self.graph.node(
            "<<B>%s</B>>" % opType,
            prefix="op",
            shape="box",
            style="rounded, filled, bold",
            color="#303A3A",
            fontname="Arial",
            fontcolor="#ffffff",
            width="1.3",
            height="0.84", )

    def add_arg(self, name):
        return self.graph.node(
            gg.crepr(name),
            prefix="arg",
            shape="box",
            style="rounded,filled,bold",
            fontname="Arial",
            fontcolor="#999999",
            color="#dddddd")

    def add_edge(self, source, target, label, **kwargs):
        source = self.nodes[source]
        target = self.nodes[target]
        return self.graph.edge(source, target, **kwargs)


def draw_onnx_graph(model_pb_path):
    json_str = load_model(model_pb_path)
    return json_str


def draw_paddle_graph(model_pb_path):
    pm = paddle.PaddleModel(model_pb_path)
    json_str = pm.to_graph_data()
    return json_str


if __name__ == '__main__':
    import sys
    current_path = os.path.abspath(os.path.dirname(sys.argv[0]))
    json_str = load_model(current_path + "/mock/inception_v1_model.pb")
    # json_str = load_model(current_path + "/mock/squeezenet_model.pb")
    # json_str = load_model('./mock/shufflenet/model.pb')
    debug_print(json_str)
    assert json_str

    g = GraphPreviewGenerator(json_str)
    g('./temp.dot', show=False)
