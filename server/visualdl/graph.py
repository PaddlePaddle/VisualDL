import onnx
import json
from google.protobuf.json_format import MessageToJson


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


def load_model(model_pb_path):
    model = onnx.load(model_pb_path)
    graph = model.graph
    del graph.initializer[:]

    # to json string
    json_str = MessageToJson(model.graph)
    json_obj = json.loads(json_str)
    reorganize_inout(json_obj, 'input')
    reorganize_inout(json_obj, 'output')
    return json.dumps(json_obj, sort_keys=True, indent=4, separators=(',', ': '))


if __name__ == '__main__':
    import os
    import sys
    current_path = os.path.abspath(os.path.dirname(sys.argv[0]))
    json_str = load_model(current_path + "/mock/inception_v1.pb")
    print(json_str)
