import json

from google.protobuf.json_format import MessageToJson

import onnx


def debug_print(json_obj):
    print(json.dumps(json_obj, sort_keys=True, indent=4, separators=(',', ': ')))


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


def get_links(model_json):
    links = []

    for input in model_json['input']:
        name = input['name']
        for node in model_json['node']:
            if name in node['input']:
                links.append({'source': name,
                              "target": node['name']})
                # links.append({'source': name,
                #               "target": node['name'],
                #               "label": name})

    for source_node in model_json['node']:
        for output in source_node['output']:
            for target_node in model_json['node']:
                if output in target_node['input']:
                    links.append({'source': source_node['name'],
                                  'target': target_node['name']})
                    # links.append({'source': source_node['name'],
                    #               'target': target_node['name'],
                    #               'label': output})

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
        node_links[idx] = {'input': set(), 'output': set()}

    for src_idx in range(len(nodes)):
        for out_name in nodes[src_idx]['output']:
            for dst_idx in range(len(nodes)):
                if out_name in nodes[dst_idx]['input']:
                    node_links[src_idx]['output'].add(dst_idx)
                    node_links[dst_idx]['input'].add(src_idx)

    # change set to list for json can not serialize set
    new_node_links = dict()
    for key in node_links:
        new_node_links[key] = {'input': list(node_links[key]['input']),
                               'output': list(node_links[key]['output'])}
    return new_node_links


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
    # debug_print(node_links)


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
                    raise Exception("output " + out_name + "have multiple source")
    level_to_outputs = dict()
    for out_idx in output_to_level:
        level = output_to_level[out_idx]
        if level not in level_to_outputs:
            level_to_outputs[level] = list()
        level_to_outputs[level].append(out_idx)
    # debug_print(level_to_outputs)

    level_to_all = dict()

    def init_level(level):
        if level not in level_to_all:
            level_to_all[level] = {'nodes': list(), 'inputs': list(), 'outputs': list()}
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

    # debug_print(node_to_coordinate)
    # debug_print(input_to_coordinate)
    # debug_print(output_to_coordinate)
    return node_to_coordinate, input_to_coordinate, output_to_coordinate



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

    paraSymbolSize = [12, 6]
    paraSymbol = 'rect'
    opSymbolSize = [5, 5]

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
                "symbolSize": 8,
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

    node_links = get_node_links(model_json)
    add_level_to_node_links(node_links)
    level_to_all = get_level_to_all(node_links, model_json)
    node_to_coordinate, input_to_coordinate, output_to_coordinate = level_to_coordinate(level_to_all)

    inputs = model_json['input']
    nodes = model_json['node']
    outputs = model_json['output']

    echars_data = list()

    for in_idx in range(len(inputs)):
        input = inputs[in_idx]
        data = dict()
        data['name'] = input['name']
        data['x'] = input_to_coordinate[in_idx]['x']
        data['y'] = input_to_coordinate[in_idx]['y']
        data['symbol'] = paraSymbol
        data['itemStyle'] = paraterItemStyle
        data['symbolSize'] = paraSymbolSize
        echars_data.append(data)
    for node_idx in range(len(nodes)):
        node = nodes[node_idx]
        data = dict()
        data['name'] = node['name']
        data['x'] = node_to_coordinate[node_idx]['x']
        data['y'] = node_to_coordinate[node_idx]['y']
        data['itemStyle'] = opItemStyle
        data['symbolSize'] = opSymbolSize
        echars_data.append(data)
    for out_idx in range(len(outputs)):
        output = outputs[out_idx]
        data = dict()
        data['name'] = output['name']
        data['x'] = output_to_coordinate[out_idx]['x']
        data['y'] = output_to_coordinate[out_idx]['y']
        data['symbol'] = paraSymbol
        data['itemStyle'] = paraterItemStyle
        data['symbolSize'] = paraSymbolSize
        echars_data.append(data)

    option['series'][0]['data'] = echars_data
    option['series'][0]['links'] = get_links(model_json)

    return option


def load_model(model_pb_path):
    model = onnx.load(model_pb_path)
    graph = model.graph
    del graph.initializer[:]

    # to json string
    json_str = MessageToJson(model.graph)
    model_json = json.loads(json_str)
    reorganize_inout(model_json, 'input')
    reorganize_inout(model_json, 'output')
    rename_model(model_json)
    # debug_print(model_json)
    options = transform_for_echars(model_json)
    # debug_print(options)
    return json.dumps(options, sort_keys=True, indent=4, separators=(',', ': '))


if __name__ == '__main__':
    import os
    import sys
    current_path = os.path.abspath(os.path.dirname(sys.argv[0]))
    # json_str = load_model(current_path + "/mock/inception_v1_model.pb")
    json_str = load_model(current_path + "/mock/squeezenet_model.pb")
    print(json_str)
