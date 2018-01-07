import json

from google.protobuf.json_format import MessageToJson

import onnx


class Node(object):
    def __init__(self):
        pass

    def to_json(self):
        raise NotImplementedError


class Operator(Node):
    def __init__(self, json_obj):
        self.json_obj = json_obj
        self.renamed = False
        self.in_nodes = []
        self.out_nodes = []

    @property
    def name(self):
        return self.json_obj['name']

    @property
    def inputs(self):
        return self.json_obj['input']

    @property
    def outputs(self):
        return self.json_obj['output']

    def sync_inout_name(self):
        pass

    def rename(self, node_id):
        if not self.renamed:
            self.renamed = True
            self.json_obj['name'] = node_id + '\n' + self.name
        else:
            raise Exception("Operator " + self.name + " has already been renamed")

    def to_json(self):
        return self.json_obj


class Variable(Node):
    def __init__(self, json_obj):
        """
        :param json_obj:
        {
            "data_type": "FLOAT",
            "name": "conv1_w_0",
            "shape": [
                "64",
                "3",
                "3",
                "3"
            ]
        }
        """
        self.renamed = False
        self.json_obj = json_obj
        self.in_nodes = []
        self.out_nodes = []

    @property
    def name(self):
        return self.json_obj['name']

    @property
    def data_type(self):
        return self.json_obj['data_type']

    @property
    def shape(self):
        return [int(dim) for dim in self.json_obj['shape']]

    def sync_inout_name(self):
        pass

    def rename(self):
        if not self.renamed:
            self.renamed = True
            new_name = self.name + '\ndata_type=' + str(self.data_type) + '\nshape=' + str(self.shape)
            self.json_obj['name'] = new_name
        else:
            raise Exception("Variable " + self.name + " has already been renamed")

    def to_json(self):
        return self.json_obj


class Edge(object):
    def __init__(self, name):
        self.__name = name
        self.__from_node = None
        self.__to_node = None

    @property
    def name(self):
        return self.__name

    @property
    def from_node(self):
        return self.from_node

    @property
    def to_node(self):
        return self.to_node

    def set_from_node(self, node):
        assert self.__from_node is None
        self.__from_node = node

    def set_to_node(self, node):
        assert self.__to_node is None
        self.__to_node


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


def to_structure_data(model_json):
    operators = [Operator(node) for node in model_json['node']]
    inputs = [Variable(input) for input in model_json['input']]
    outputs = [Variable(output for output in model_json['output'])]

    edges = dict()

    # consturct all edges
    def get_edge(edges, name):
        assert isinstance(edges, dict)
        if name not in edges:
            edges[name] = Edge(name)
        return edges[name]

    for input in inputs:
        edge = get_edge(edges, input.name)
        assert edge.from_node is None
        edge.from_node = input

    for output in outputs:
        edge = get_edge(edges, output.name)
        assert edge.to_node is None
        edge.to_node = output

    for operator in operators:
        for input_name in operator.inputs:
            edge = get_edge(edges, input_name)
            assert edge.to_node is None
            edge.to_node = operator
        for output_name in operator.outputs:
            edge = get_edge(edges, output_name)
            assert edge.from_node is None
            edge.from_node = operator

    # rename node


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
                    outputs[idx] == new_name

    def rename_variables(model, variables):
        for variable in variables:
            old_name = variable['name']
            new_shape = [int(dim) for dim in variable['shape']]
            new_name = old_name + '\ndata_type=' + str(variable['data_type']) \
                       + '\nshape=' + str(new_shape)
            variable['name'] = new_name
            rename_edge(model, old_name, new_name)
    rename_variables(model_json, model_json['input'])
    rename_variables(model_json, model_json['output'])

    # rename
    all_nodes = model_json['node']
    for idx in range(len(all_nodes)):
        name = all_nodes[idx]['name']
        op_type = all_nodes[idx]['opType']
        new_name = str(idx) + '\n' + str(op_type)
        if name != "":
            new_name = new_name + "\n" + name
        all_nodes[idx]['name'] = new_name


def add_links(model_json):
    links = []

    for input in model_json['input']:
        name = input['name']
        for node in model_json['node']:
            if name in node['input']:
                links.append({'source': name,
                              "target": node['name'],
                              "label": name})

    for source_node in model_json['node']:
        for output in source_node['output']:
            for target_node in model_json['node']:
                if output in target_node['input']:
                    links.append({'source': source_node['name'],
                                  'target': target_node['name'],
                                  'label': output})

    model_json['links'] = links


def add_edges(json_obj):
    # TODO(daming-lu): should try to de-duplicate node's out-edge
    # Currently it is counted twice: 1 as out-edge, 1 as in-edge
    json_obj['edges'] = []
    label_incrementer = 0

    for node_index in range(0, len(json_obj['node'])):
        cur_node = json_obj['node'][node_index]

        # input edges
        for source in cur_node['input']:
            json_obj['edges'].append({
                'source': source,
                'target': 'node_' + str(node_index),
                'label': 'label_' + str(label_incrementer)
            })
            label_incrementer += 1

        # output edge
        json_obj['edges'].append({
            'source': 'node_' + str(node_index),
            'target': cur_node['output'][0],
            'label': 'label_' + str(label_incrementer)
        })
        label_incrementer += 1
        return json_obj


def add_coordinate(model_json):


def transform_for_echars(model_json):
    opItemStyle = {
        "normal": {
            "color": '#d95f02'
        }
    }

    paraterItemStyle = {
        "normal": {
            "color": '#1b9e77'
        }
    };

    paraSymbolSize = [95, 45];
    paraSymbol = 'rect';
    opSymbolSize = [50, 50];

    option = {
        "title": {
            "text": 'Default Graph Name'
        },
        "tooltip": {
            "show": False
        },
        "animationDurationUpdate": 1500,
        "animationEasingUpdate": 'quinticInOut',
        "series": [
            {
                "type": "graph",
                "layout": "none",
                "symbolSize": 50,
                "roam": True,
                "label": {
                    "normal": {
                        "show": True,
                        "color": 'black'
                    }
                },
                "edgeSymbol": ['none', 'arrow'],
                "edgeSymbolSize": [0, 10],
                "edgeLabel": {
                    "normal": {
                        "textStyle": {
                            "fontSize": 20
                        }
                    }
                },
                "lineStyle": {
                    "normal": {
                        "opacity": 0.9,
                        "width": 2,
                        "curveness": 0
                    }
                },
                "data": [],
                "links": []
            }
        ]
    }

    option['title']['text'] = model_json['name']
    nodes = model_json['node']


    return option


def load_model(model_pb_path):
    model = onnx.load(model_pb_path)
    graph = model.graph
    del graph.initializer[:]

    # to json string
    json_str = MessageToJson(model.graph)
    json_obj = json.loads(json_str)
    reorganize_inout(json_obj, 'input')
    reorganize_inout(json_obj, 'output')
    rename_model(json_obj)
    add_links(json_obj)
    return json.dumps(json_obj, sort_keys=True, indent=4, separators=(',', ': '))


if __name__ == '__main__':
    import os
    import sys
    current_path = os.path.abspath(os.path.dirname(sys.argv[0]))
    # json_str = load_model(current_path + "/mock/inception_v1_model.pb")
    json_str = load_model(current_path + "/mock/squeezenet_model.pb")
    print(json_str)
