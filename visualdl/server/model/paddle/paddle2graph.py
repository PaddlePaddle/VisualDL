from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

from .framework_pb2 import ProgramDesc

import os


def is_paddle_model(model_path):
    model_file_path = os.path.join(model_path, "__model__")

    if not os.path.exists(model_file_path):
        return False

    return PaddleModel.load_from_model_file(model_file_path) is not None


class PaddleOp:
    def __init__(self, op, op_count_dict, var_count_dict):
        self.type = op.type
        self.index = op_count_dict.setdefault(self.type, 0)
        op_count_dict[self.type] += 1
        self.name = "%s_%d" % (self.type, self.index)
        self.inputs = {}
        self.outputs = {}

        # rename var to avoid cycle
        for input in op.inputs:
            for argument in input.arguments:
                cnt = var_count_dict.setdefault(argument, 0)
                val = "%s@%d" % (argument, cnt)
                self.inputs[argument] = val

        for output in op.outputs:
            for argument in output.arguments:
                var_count_dict.setdefault(argument, 0)
                var_count_dict[argument] += 1
                cnt = var_count_dict[argument]
                val = "%s@%d" % (argument, cnt)
                self.outputs[argument] = val

    def set_input_name(self, key, name):
        self.inputs[key] = name

    def set_output_name(self, key, name):
        self.outputs[key] = name

    def get_input_name(self, key):
        return self.inputs[key]

    def get_output_name(self, key):
        return self.outputs[key]

    def get_input_set(self):
        return set([argument for argument in self.inputs])

    def get_output_set(self):
        return set([argument for argument in self.outputs])

    def get_name(self):
        return self.name

    def is_compute_op(self):
        return not self.is_fetch_op() and not self.is_feed_op()

    def is_fetch_op(self):
        return self.type in ["fetch"]

    def is_feed_op(self):
        return self.type in ["feed"]

    def get_info(self):
        return {
            "opType": self.name,
            "input": [value for key, value in self.inputs.items()],
            "output": [value for key, value in self.outputs.items()]
        }


class PaddleVar:
    def __init__(self, var):
        tensor = var.type.lod_tensor.tensor
        self.shape = [i for i in tensor.dims] if len(
            tensor.dims) != 0 else [-1]
        self.name = var.name
        self.data_type = tensor.data_type
        self.input_ops = set()
        self.output_ops = set()
        self.info = {
            "shape": self.shape,
            "data_type": self.data_type,
            "name": self.name
        }

    def add_input_op(self, input):
        self.input_ops.add(input)

    def add_output_op(self, output):
        self.output_ops.add(output)

    def get_op_intersection(self):
        return self.input_ops.intersection(self.output_ops)

    def get_op_difference(self):
        return self.input_ops.difference(self.output_ops)

    def get_info(self):
        return self.info


class PaddleModel:
    # load from a pb model
    @staticmethod
    def load_from_model_file(model_path):
        with open(model_path, "rb") as file:
            string = file.read()

        program = ProgramDesc()
        decoded = program.ParseFromString(string)

        if decoded is not None and decoded != len(string):
            return None

        return program

    def __init__(self, model_path, name=None):
        model_path = os.path.join(model_path, "__model__")
        self.name = name if name is not None else "PaddleGraph"
        self.program = PaddleModel.load_from_model_file(model_path)
        self.vars = {
            var.name: PaddleVar(var)
            for block in self.program.blocks for var in block.vars
        }
        self.ops = {}
        self.input_set = set()
        self.output_set = set()
        self.op_count_dict = {}
        self.var_count_dict = {}

        for block in self.program.blocks:

            for op in block.ops:
                op_obj = PaddleOp(op, self.op_count_dict, self.var_count_dict)
                self.ops[op_obj.get_name()] = op_obj

                # record all input
                for input in op.inputs:
                    for argument in input.arguments:
                        self.vars[argument].add_input_op(op_obj.get_name())
                        savename = op_obj.get_input_name(argument)
                        self.input_set.add(savename)
                        self.vars[savename] = self.vars[argument]

                for output in op.outputs:
                    for argument in output.arguments:
                        self.vars[argument].add_output_op(op_obj.get_name())
                        savename = op_obj.get_output_name(argument)
                        self.output_set.add(savename)
                        self.vars[savename] = self.vars[argument]

    # return data to front-end
    def to_graph_data(self):
        # record the input and output var in a graph
        inputs = []
        outputs = []

        # remove vars bind with feed operator
        for key, op in self.ops.items():
            if op.is_feed_op():
                self.input_set = self.input_set.union(op.get_output_set())
                self.output_set = self.output_set.difference(
                    op.get_output_set())
                self.input_set = self.input_set.difference(op.get_input_set())

        # remove vars bind with fetch operator
        for key, op in self.ops.items():
            if op.is_fetch_op():
                self.output_set = self.output_set.union(op.get_input_set())
                self.input_set = self.input_set.difference(op.get_input_set())
                self.output_set = self.output_set.difference(
                    op.get_output_set())

        for input in self.input_set:
            if input in self.output_set:
                continue
            inputs.append(self.vars[input].get_info())

        for output in self.output_set:
            if output in self.input_set:
                continue
            outputs.append(self.vars[output].get_info())

        return {
            "node": [
                op.get_info() for _, op in self.ops.items()
                if op.is_compute_op()
            ],
            "input":
            inputs,
            "output":
            outputs
        }


if __name__ == "__main__":
    import sys
    import json
    pm = PaddleModel(sys.argv[1])
    print(json.dumps(pm.to_graph_data()))
