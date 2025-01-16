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
import os.path
import pathlib
import re

from . import utils

_graph_version = '1.0.0'


def post_order_traverse(root, all_ops, post_order_results):
    '''
    Traversal a tree in post order.
    Args:
        root: current node of the tree.
        all_ops: used to index all nodes.
        post_order_results(list): used to store traversal results in place.
    '''
    for child in all_ops[root]['children_node']:
        post_order_traverse(child, all_ops, post_order_results)
    post_order_results.append(root)
    return


def create_non_leaf_nodes(parent_node_name, child_node_name, all_ops,
                          general_children_dict):
    '''
    Create a path from leaf to root, e.g. /a/b/c -> /a/b -> /a -> /. If node in path not exists, \
        create one and fill information.
    Args:
        parent_node_name: name of parent node
        child_node_name: name of current node
        all_ops: used to store and index all nodes.
        general_children_dict: used to store all descendants for each non-leaf node.
    '''
    if parent_node_name == '/' or parent_node_name == '':  # root node
        parent_node_name = '/'
    if parent_node_name not in all_ops:
        all_ops[parent_node_name] = {}
        all_ops[parent_node_name]['children_node'] = set()
        all_ops[parent_node_name]['name'] = parent_node_name
        all_ops[parent_node_name]['show_name'] = os.path.dirname(
            all_ops[child_node_name]['show_name'])
        all_ops[parent_node_name]['attrs'] = {}
        all_ops[parent_node_name]['input_nodes'] = set()
        all_ops[parent_node_name]['output_nodes'] = set()
        all_ops[parent_node_name]['type'] = os.path.basename(
            all_ops[parent_node_name]['show_name'])
        all_ops[parent_node_name]['input_vars'] = set()
        all_ops[parent_node_name]['output_vars'] = set()
        all_ops[parent_node_name]['parent_node'] = ''
        all_ops[parent_node_name]['edge_input_nodes'] = []
        all_ops[parent_node_name]['edge_output_nodes'] = []
        all_ops[parent_node_name]['is_leaf_node'] = False

    all_ops[child_node_name]['parent_node'] = parent_node_name
    all_ops[parent_node_name]['children_node'].add(child_node_name)
    general_children_dict[parent_node_name].add(child_node_name)
    general_children_dict[parent_node_name].update(
        general_children_dict[child_node_name])
    if parent_node_name == '/':  # root node
        return
    else:
        create_non_leaf_nodes(os.path.dirname(parent_node_name),
                              parent_node_name, all_ops, general_children_dict)


def construct_edges(var_name, all_ops, all_vars, all_edges):
    '''
    Construct path edges from var's from_node to to_nodes.
    Algorithm:
        1. Judge if src_node and dst_node have the same parent node, if yes, link them directly
        and fill information in all_edges, return.
        2. Find the closest common ancestor, repeat link node and its parent until reach the common ancestor.
        Every time construct a new edge, fill information in all_edges.
    Args:
        var_name: name of variable to process
        all_ops: used to index all nodes.
        all_vars:  used to index all variables.
        all_edges: used to store and index all edges
    '''
    from_node = all_vars[var_name]['from_node']
    to_nodes = all_vars[var_name]['to_nodes']

    def _construct_edge(src_node, dst_node):
        if all_ops[src_node]['parent_node'] == all_ops[dst_node][
                'parent_node']:
            if (src_node, dst_node) not in all_edges:
                all_edges[(src_node, dst_node)] = {
                    'from_node': src_node,
                    'to_node': dst_node,
                    'vars': {var_name},
                    'label': ''
                }
            else:
                all_edges[(src_node, dst_node)]['vars'].add(var_name)
        else:
            common_ancestor = os.path.commonpath([src_node, dst_node])
            common_ancestor = pathlib.Path(common_ancestor).as_posix(
            )  # in windows, os.path.commonpath will return windows path, we should convert it to posix
            src_base_node = src_node
            while True:
                parent_node = all_ops[src_base_node]['parent_node']
                if parent_node == common_ancestor:
                    break
                if (src_base_node, parent_node) not in all_edges:
                    all_edges[(src_base_node, parent_node)] = {
                        'from_node': src_base_node,
                        'to_node': parent_node,
                        'vars': {var_name},
                        'label': ''
                    }
                else:
                    all_edges[(src_base_node,
                               parent_node)]['vars'].add(var_name)
                src_base_node = parent_node
            dst_base_node = dst_node
            while True:
                parent_node = all_ops[dst_base_node]['parent_node']
                if parent_node == common_ancestor:
                    break
                if (parent_node, dst_base_node) not in all_edges:
                    all_edges[(parent_node, dst_base_node)] = {
                        'from_node': parent_node,
                        'to_node': dst_base_node,
                        'vars': {var_name},
                        'label': ''
                    }
                else:
                    all_edges[(parent_node,
                               dst_base_node)]['vars'].add(var_name)
                dst_base_node = parent_node
            if (src_base_node, dst_base_node) not in all_edges:
                all_edges[(src_base_node, dst_base_node)] = {
                    'from_node': src_base_node,
                    'to_node': dst_base_node,
                    'vars': {var_name},
                    'label': ''
                }
            else:
                all_edges[(src_base_node, dst_base_node)]['vars'].add(var_name)
        return

    if from_node and to_nodes:
        for to_node in to_nodes:
            if from_node == to_node:
                continue
            _construct_edge(from_node, to_node)


def analyse_model(model_pb):  # noqa: C901
    try:
        from paddle.framework import core
    except Exception:
        print("Paddlepaddle is required to use add_graph interface.\n\
              Please refer to \
              https://www.paddlepaddle.org.cn/install/quick?docurl=/documentation/docs/zh/install/pip/linux-pip.html\
              to install paddlepaddle.")

    AttrType = core.AttrType
    attr_type_name = {
        AttrType.INT: "INT",
        AttrType.INTS: "INTS",
        AttrType.LONG: "LONG",
        AttrType.LONGS: "LONGS",
        AttrType.FLOAT: "FLOAT",
        AttrType.FLOATS: "FLOATS",
        AttrType.STRING: "STRING",
        AttrType.STRINGS: "STRINGS",
        AttrType.BOOL: "BOOL",
        AttrType.BOOLS: "BOOLS",
        AttrType.BLOCK: "BLOCK",
        AttrType.BLOCKS: "BLOCKS"
    }
    ProgramDesc = core.ProgramDesc
    from paddle.utils.unique_name import generate
    program_desc = ProgramDesc(model_pb)
    all_ops = {}
    all_vars = {}
    all_edges = {}
    op_inputvars_dict = collections.defaultdict(list)
    op_outputvars_dict = collections.defaultdict(list)
    for i in range(program_desc.num_blocks()):
        if i != 0:  # We do not show sub block for clarity now
            continue
        block_desc = program_desc.block(i)
        # vars info
        for var_desc in block_desc.all_vars():
            try:
                var_name = var_desc.name()
                all_vars[var_name] = {}
                all_vars[var_name]['name'] = var_name
                all_vars[var_name]['shape'] = var_desc.shape()
                all_vars[var_name]['type'] = str(var_desc.type())
                all_vars[var_name]['dtype'] = str(var_desc.dtype())
                all_vars[var_name]['value'] = []
                all_vars[var_name]['persistable'] = var_desc.persistable()
                attr_dict = {}
                for attr_name in var_desc.attr_names():
                    attr_dict[attr_name] = var_desc.attr(attr_name)
                all_vars[var_name]['attrs'] = attr_dict
                all_vars[var_name]['from_node'] = ''
                all_vars[var_name]['to_nodes'] = []

            except Exception:
                # feed, fetch var
                var_name = var_desc.name()
                all_vars[var_name] = {}
                all_vars[var_name]['name'] = var_name
                all_vars[var_name]['shape'] = ''
                all_vars[var_name]['type'] = str(var_desc.type())
                all_vars[var_name]['dtype'] = ''
                all_vars[var_name]['value'] = []
                all_vars[var_name]['persistable'] = var_desc.persistable()
                attr_dict = {}
                for attr_name in var_desc.attr_names():
                    attr_dict[attr_name] = var_desc.attr(attr_name)
                all_vars[var_name]['attrs'] = attr_dict
                all_vars[var_name]['from_node'] = ''
                all_vars[var_name]['to_nodes'] = []

    for i in range(program_desc.num_blocks()):
        if i != 0:  # We do not show sub block for clarity now
            continue
        block_desc = program_desc.block(i)
        # ops info
        for j in range(block_desc.op_size()):
            op_desc = block_desc.op(j)
            op_name = op_desc.attr('op_namescope') + generate(
                str(op_desc.type()))
            all_ops[op_name] = {}
            all_ops[op_name]['name'] = op_name
            all_ops[op_name]['show_name'] = re.sub(r'\[(\w|\.)*\]', '',
                                                   op_name)
            all_ops[op_name]['type'] = str(op_desc.type())
            all_ops[op_name]['input_vars'] = {}
            all_ops[op_name]['is_leaf_node'] = True
            for input_name, variable_list in op_desc.inputs().items():
                all_ops[op_name]['input_vars'][input_name] = variable_list
                op_inputvars_dict[op_name].extend(variable_list)
                # fill var 'to_nodes'
                for variable_name in variable_list:
                    all_vars[variable_name]['to_nodes'].append(op_name)
            all_ops[op_name]['output_vars'] = {}
            for output_name, variable_list in op_desc.outputs().items():
                all_ops[op_name]['output_vars'][output_name] = variable_list
                op_outputvars_dict[op_name].extend(variable_list)
                # fill var 'from_node'
                for variable_name in variable_list:
                    all_vars[variable_name]['from_node'] = op_name

            attr_dict = {}
            attr_type_dict = {}
            for attr_name in op_desc.attr_names():
                try:
                    if attr_name == 'sub_block':
                        continue
                    attr_dict[attr_name] = op_desc.attr(attr_name)
                    attr_type = op_desc.attr_type(attr_name)
                    attr_type_dict[attr_name] = attr_type_name[
                        attr_type] if attr_type in attr_type_name else str(
                            attr_type).split('.')[1]
                except Exception:
                    continue
            all_ops[op_name]['attrs'] = attr_dict
            all_ops[op_name]['attr_types'] = attr_type_dict
            all_ops[op_name]['children_node'] = []
            all_ops[op_name]['input_nodes'] = []
            all_ops[op_name]['output_nodes'] = []
            all_ops[op_name]['edge_input_nodes'] = []
            all_ops[op_name]['edge_output_nodes'] = []

    # second pass, create non-leaf nodes, fill 'parent_node', 'children_nodes' of nodes.
    for variable_name in all_vars:
        if all_vars[variable_name]['from_node'] == '':
            continue
        # some variable's input and output node are the same, we should prevent to show this situation as a cycle
        from_node_name = all_vars[variable_name]['from_node']
        for to_node_name in all_vars[variable_name]['to_nodes']:
            if to_node_name != from_node_name:
                all_ops[from_node_name]['output_nodes'].append(to_node_name)
                all_ops[to_node_name]['input_nodes'].append(from_node_name)

    general_children_dict = collections.defaultdict(set)

    all_op_names = list(all_ops.keys())
    for op_name in all_op_names:
        create_non_leaf_nodes(os.path.dirname(op_name), op_name, all_ops,
                              general_children_dict)

    # fill all non-leaf node's  'output_nodes' 'input_nodes' 'output_vars' 'input_vars'
    # post-order traverse tree
    post_order_results = []

    post_order_traverse('/', all_ops, post_order_results)

    for op_name in post_order_results:
        op = all_ops[op_name]
        op['children_node'] = list(op['children_node'])

        if op['children_node']:
            for child_op in op['children_node']:
                for input_node in all_ops[child_op]['input_nodes']:
                    if input_node in general_children_dict[op_name]:
                        continue
                    else:
                        op['input_nodes'].add(input_node)
                for output_node in all_ops[child_op]['output_nodes']:
                    if output_node in general_children_dict[op_name]:
                        continue
                    else:
                        op['output_nodes'].add(output_node)
                for input_var in op_inputvars_dict[child_op]:
                    if all_vars[input_var][
                            'from_node'] not in general_children_dict[op_name]:
                        op['input_vars'].add(input_var)
                for output_var in op_outputvars_dict[child_op]:
                    for to_node_name in all_vars[output_var]['to_nodes']:
                        if to_node_name not in general_children_dict[op_name]:
                            op['output_vars'].add(output_var)
            op['input_nodes'] = list(op['input_nodes'])
            op['output_nodes'] = list(op['output_nodes'])
            op_inputvars_dict[op_name] = list(op['input_vars'])
            op_outputvars_dict[op_name] = list(op['output_vars'])
            op['input_vars'] = {'X': list(op['input_vars'])}
            op['output_vars'] = {'Y': list(op['output_vars'])}

    # Supplement edges and 'edge_input_nodes', 'edge_output_nodes' in op to help draw in frontend
    for var_name in all_vars.keys():
        construct_edges(var_name, all_ops, all_vars, all_edges)

    for src_node, to_node in all_edges.keys():
        all_ops[src_node]['edge_output_nodes'].append(to_node)
        all_ops[to_node]['edge_input_nodes'].append(src_node)
        all_edges[(src_node,
                   to_node)]['vars'] = list(all_edges[(src_node,
                                                       to_node)]['vars'])
        if len(all_edges[(src_node, to_node)]['vars']) > 1:
            all_edges[(src_node, to_node)]['label'] = str(
                len(all_edges[(src_node, to_node)]['vars'])) + ' tensors'
        elif len(all_edges[(src_node, to_node)]['vars']) == 1:
            all_edges[(src_node, to_node)]['label'] = str(
                all_vars[all_edges[(src_node, to_node)]['vars'][0]]['shape'])

    final_data = {
        'version': _graph_version,
        'nodes': list(all_ops.values()),
        'vars': list(all_vars.values()),
        'edges': list(all_edges.values())
    }
    return final_data


def is_control_flow(op):
    return op.name() == "pd_op.if" or op.name() == "pd_op.while"


def is_same_block_op(from_node, to_node, all_ops):
    if all_ops[to_node]["parent_node"] == '/':
        return False
    from_ancestors = set()
    while all_ops[from_node]["parent_node"] != '/':
        from_ancestors.add(all_ops[from_node]["parent_node"])
        from_node = all_ops[from_node]["parent_node"]
    if all_ops[to_node]["parent_node"] in from_ancestors:
        return False
    else:
        return True


def create_control_output_node(all_ops, all_vars, control_node_name):
    op_name = control_node_name + '/' + "output"
    all_ops[op_name] = {}
    all_ops[op_name]['name'] = op_name
    all_ops[op_name]['show_name'] = op_name

    all_ops[op_name]['type'] = "control_op.output"
    all_ops[op_name]['dtype'] = all_ops[control_node_name]['dtype']
    all_ops[op_name]['input_vars'] = {}
    all_ops[op_name]['output_vars'] = all_ops[control_node_name]['output_vars']

    all_ops[op_name]['is_leaf_node'] = True
    for var in all_vars:
        if all_vars[var]['from_node'] == control_node_name:
            all_ops[op_name]['output_vars'][var] = [var]
            all_vars[var]['from_node'] = op_name

    all_ops[op_name]['attrs'] = all_ops[control_node_name]['attrs']
    all_ops[op_name]['attr_types'] = all_ops[control_node_name]['attr_types']
    all_ops[op_name]['children_node'] = []
    all_ops[op_name]['input_nodes'] = []
    all_ops[op_name]['output_nodes'] = []
    all_ops[op_name]['edge_input_nodes'] = []
    all_ops[op_name]['edge_output_nodes'] = []
    all_ops[op_name]['parent_node'] = control_node_name
    all_ops[control_node_name]['children_node'].append(op_name)
    return all_ops, all_vars


def safe_get_shape(op):
    try:
        return op.result(0).shape
    except Exception:
        return []


def safe_get_type(op):
    try:
        return op.result(0).dtype.name
    except Exception:
        return ''


def safe_get_dtype(op):
    try:
        return op.result(0).dtype.name
    except Exception:
        return ''


def safe_get_persistable(op):
    try:
        if op.name() == "builtin.parameter":
            return False
        else:
            return op.result(0).persistable
    except Exception:
        return False


def get_sub_ops(op, op_name, all_ops, all_vars):
    try:
        from paddle.utils.unique_name import generate
    except Exception:
        print("Paddlepaddle is required to use add_graph interface.\n\
              Please refer to \
              https://www.paddlepaddle.org.cn/install/quick?docurl=/documentation/docs/zh/install/pip/linux-pip.html\
              to install paddlepaddle.")
    for sub_block in op.blocks():
        for sub_op in sub_block.ops:
            sub_op_name0 = generate(sub_op.name())
            sub_op_name = op_name + '/' + sub_op_name0
            all_ops[sub_op_name] = {}
            all_ops[sub_op_name]['name'] = sub_op_name
            all_ops[sub_op_name]['show_name'] = sub_op_name
            all_ops[sub_op_name]['type'] = sub_op.name().replace("pd_op.", "")
            all_ops[sub_op_name]['dtype'] = safe_get_dtype(sub_op)
            all_ops[sub_op_name]['input_vars'] = {}
            all_ops[sub_op_name]['output_vars'] = {}
            all_ops[sub_op_name]['is_leaf_node'] = True
            now_var = utils.gen_var_name(sub_op.results())
            for source in sub_op.operands_source():
                if not source.type():
                # if source.type() == Value().type():
                    continue
                input_name = utils.gen_var_name(source)
                if input_name not in all_vars.keys():
                    all_vars[input_name] = {}
                    all_vars[input_name]['name'] = input_name
                    try:
                        attrs = source.results()[0].get_defining_op().attrs()
                        if 'place' in attrs:
                            attrs['place'] = str(attrs['place'])
                        attrs['dtype'] = safe_get_dtype(source)
                    except Exception:
                        attrs = {}

                    all_vars[input_name]['shape'] = safe_get_shape(source)
                    all_vars[input_name]['type'] = safe_get_type(source)
                    all_vars[input_name]['dtype'] = safe_get_dtype(source)
                    all_vars[input_name]['value'] = []
                    all_vars[input_name]['persistable'] = safe_get_persistable(source)
                    all_vars[input_name]['attrs'] = attrs
                    all_vars[input_name]['from_node'] = ''
                    all_vars[input_name]['to_nodes'] = []
                    
                if sub_op.name() == "pd_op.increment_":
                    all_vars[now_var]['to_nodes'].append(all_vars[input_name]['from_node'])
                    all_ops[all_vars[input_name]['from_node']]['input_vars'][now_var] = [now_var]
                all_ops[sub_op_name]['input_vars'][input_name] = [input_name]
                all_vars[input_name]['to_nodes'].append(sub_op_name)
            all_vars[now_var]['from_node'] = sub_op_name
            all_ops[sub_op_name]['output_vars'][now_var] = [now_var]

            try:
                attrs = sub_op.results()[0].get_defining_op().attrs()
                if 'place' in attrs:
                    attrs['place'] = str(attrs['place'])
                attrs['dtype'] = safe_get_dtype(sub_op)
            except Exception:
                attrs = {}
                #pass

            all_ops[sub_op_name]['attrs'] = attrs
            all_ops[sub_op_name]['attr_types'] = attrs
            all_ops[sub_op_name]['children_node'] = []
            all_ops[sub_op_name]['input_nodes'] = []
            all_ops[sub_op_name]['output_nodes'] = []
            all_ops[sub_op_name]['edge_input_nodes'] = []
            all_ops[sub_op_name]['edge_output_nodes'] = []
            all_ops[sub_op_name]["parent_node"] = op_name
            all_ops[op_name]['children_node'].append(sub_op_name)

            # yield
            if sub_op.name() == 'cf.yield':
                var_name = "tmp_var_" + sub_op_name0
                all_vars[var_name] = {}
                all_vars[var_name]['name'] = var_name
                all_vars[var_name]['dtype'] = ''
                all_vars[var_name]['shape'] = []
                all_vars[var_name]['value'] = []
                all_vars[var_name]['persistable'] = False
                all_vars[var_name]['attrs'] = {}
                all_vars[var_name]['from_node'] = sub_op_name
                all_ops[sub_op_name]['output_vars'][var_name] = [var_name]
                control_output = all_ops[sub_op_name]["parent_node"] + '/' + "output"
                all_vars[var_name]['to_nodes'] = [control_output]
                all_ops[control_output]['input_vars'][var_name] = [var_name]
            if is_control_flow(sub_op):
                all_ops[sub_op_name]['is_leaf_node'] = False
                all_ops, all_vars = create_control_output_node(all_ops, all_vars, sub_op_name)
                all_ops, all_vars = get_sub_ops(sub_op, sub_op_name, all_ops, all_vars)

    return all_ops, all_vars


def get_sub_var(op, all_vars):
    for sub_block in op.blocks():
        for sub_op in sub_block.ops:
            var_name = utils.gen_var_name(sub_op.results())
            all_vars[var_name] = {}
            all_vars[var_name]['name'] = var_name
            try:
                attrs = op.results()[0].get_defining_op().attrs()
                if 'place' in attrs:
                    attrs['place'] = str(attrs['place'])
                attrs['dtype'] = safe_get_dtype(op)
            except Exception:
                attrs = {}

            all_vars[var_name]['shape'] = safe_get_shape(sub_op)
            all_vars[var_name]['type'] = safe_get_type(sub_op)
            all_vars[var_name]['dtype'] = safe_get_dtype(sub_op)
            all_vars[var_name]['value'] = []
            all_vars[var_name]['persistable'] = safe_get_persistable(sub_op)
            all_vars[var_name]['attrs'] = attrs
            all_vars[var_name]['from_node'] = ''
            all_vars[var_name]['to_nodes'] = []
            if is_control_flow(sub_op):
                all_vars = get_sub_var(sub_op, all_vars)
    return all_vars


def update_node_connections(all_vars, all_ops):
    for variable_name in all_vars:
        if all_vars[variable_name]['from_node'] == '':
            continue
        from_node = all_vars[variable_name]['from_node']
        for to_node in all_vars[variable_name]['to_nodes']:
            if is_same_block_op(from_node, to_node, all_ops):
                all_vars[variable_name]['to_nodes'].append(all_ops[to_node]["parent_node"])
                all_ops[all_ops[to_node]["parent_node"]]['input_vars'][variable_name] = [variable_name]
        from_node_name = all_vars[variable_name]['from_node']
        for to_node_name in all_vars[variable_name]['to_nodes']:
            if to_node_name != from_node_name:
                all_ops[from_node_name]['output_nodes'].append(to_node_name)
                all_ops[to_node_name]['input_nodes'].append(from_node_name)
        all_vars[variable_name]['to_nodes'] = list(set(all_vars[variable_name]['to_nodes']))

    for node in all_ops:
        if node != '/':
            all_ops[node]['input_nodes'] = list(set(all_ops[node]['input_nodes']))
            all_ops[node]['output_nodes'] = list(set(all_ops[node]['output_nodes']))

    return all_vars, all_ops


def analyse_pir(program):
    try:
        from paddle.utils.unique_name import generate
    except Exception:
        print("Paddlepaddle is required to use add_graph interface.\n\
              Please refer to \
              https://www.paddlepaddle.org.cn/install/quick?docurl=/documentation/docs/zh/install/pip/linux-pip.html\
              to install paddlepaddle.")

    all_ops = {}
    all_vars = {}
    all_edges = {}

    # create '/' op
    all_ops['/'] = {}
    all_ops['/']['name'] = '/'
    all_ops['/']['show_name'] = '/'
    all_ops['/']['type'] = ''
    all_ops['/']['attrs'] = {}
    all_ops['/']['input_vars'] = {}
    all_ops['/']['output_vars'] = {}
    all_ops['/']['is_leaf_node'] = False
    all_ops['/']['children_node'] = []

    # vars info
    for op in program.global_block().ops:
        var_name = utils.gen_var_name(op.results())
        all_vars[var_name] = {}
        all_vars[var_name]['name'] = var_name
        try:
            attrs = op.results()[0].get_defining_op().attrs()
            if 'place' in attrs:
                attrs['place'] = str(attrs['place'])
            attrs['dtype'] = safe_get_dtype(op)
        except Exception:
            #pass
            attrs = {}

        all_vars[var_name]['shape'] = safe_get_shape(op)
        all_vars[var_name]['type'] = safe_get_type(op)
        all_vars[var_name]['dtype'] = safe_get_dtype(op)
        all_vars[var_name]['value'] = []
        all_vars[var_name]['persistable'] = safe_get_persistable(op)
        all_vars[var_name]['attrs'] = attrs
        all_vars[var_name]['from_node'] = ''
        all_vars[var_name]['to_nodes'] = []
        if is_control_flow(op):
            all_vars = get_sub_var(op, all_vars)

    # ops info
    for op in program.global_block().ops:
        op_name = generate(op.name())
        op_name = '/' + op_name

        if op.num_operands() >= 0:
            all_ops[op_name] = {}
            all_ops[op_name]['name'] = op_name
            all_ops[op_name]['show_name'] = op_name

            all_ops[op_name]['type'] = op.name().replace("pd_op.", "")
            all_ops[op_name]['dtype'] = safe_get_dtype(op)
            all_ops[op_name]['input_vars'] = {}
            all_ops[op_name]['output_vars'] = {}

            all_ops[op_name]['is_leaf_node'] = True
            now_var = utils.gen_var_name(op.results())
            for source in op.operands_source():
                if not source.type():
                # if source.type() == Value().type():
                    continue
                input_name = utils.gen_var_name(source)
                if input_name not in all_vars.keys():
                    all_vars[input_name] = {}
                    all_vars[input_name]['name'] = input_name
                    try:
                        attrs = source.results()[0].get_defining_op().attrs()
                        if 'place' in attrs:
                            attrs['place'] = str(attrs['place'])
                        attrs['dtype'] = safe_get_dtype(source)
                    except Exception:
                        attrs = {}

                    all_vars[input_name]['shape'] = safe_get_shape(source)
                    all_vars[input_name]['type'] = safe_get_type(source)
                    all_vars[input_name]['dtype'] = safe_get_dtype(source)
                    all_vars[input_name]['value'] = []
                    all_vars[input_name]['persistable'] = safe_get_persistable(source)
                    all_vars[input_name]['attrs'] = attrs
                    all_vars[input_name]['from_node'] = ''
                    all_vars[input_name]['to_nodes'] = []

                if op.name() == "pd_op.increment_":
                    all_vars[now_var]['to_nodes'].append(all_vars[input_name]['from_node'])
                    all_ops[all_vars[input_name]['from_node']]['input_vars'][now_var] = [now_var]
                all_ops[op_name]['input_vars'][input_name] = [input_name]
                all_vars[input_name]['to_nodes'].append(op_name)
            all_vars[now_var]['from_node'] = op_name
            all_ops[op_name]['output_vars'][now_var] = [now_var]

            try:
                attrs = op.results()[0].get_defining_op().attrs()
                if 'place' in attrs:
                    attrs['place'] = str(attrs['place'])
                attrs['dtype'] = safe_get_dtype(op)
            except Exception:
                #pass
                attrs = {}

            all_ops[op_name]['attrs'] = attrs
            all_ops[op_name]['attr_types'] = attrs
            all_ops[op_name]['children_node'] = []
            all_ops[op_name]['input_nodes'] = []
            all_ops[op_name]['output_nodes'] = []
            all_ops[op_name]['edge_input_nodes'] = []
            all_ops[op_name]['edge_output_nodes'] = []
            all_ops[op_name]['parent_node'] = '/'
            all_ops['/']['children_node'].append(op_name)

            if is_control_flow(op):
                all_ops[op_name]['is_leaf_node'] = False
                all_ops, all_vars = create_control_output_node(all_ops, all_vars, op_name)
                all_ops, all_vars = get_sub_ops(op, op_name, all_ops, all_vars)

    # update node connections
    all_vars, all_ops = update_node_connections(all_vars, all_ops)

    # edge info
    for var_name in all_vars.keys():
        construct_edges(var_name, all_ops, all_vars, all_edges)

    for src_node, to_node in all_edges.keys():
        all_ops[src_node]['edge_output_nodes'].append(to_node)
        all_ops[to_node]['edge_input_nodes'].append(src_node)
        all_edges[(src_node,
                   to_node)]['vars'] = list(all_edges[(src_node,
                                                       to_node)]['vars'])
        if len(all_edges[(src_node, to_node)]['vars']) > 1:
            all_edges[(src_node, to_node)]['label'] = str(
                len(all_edges[(src_node, to_node)]['vars'])) + ' tensors'
        elif len(all_edges[(src_node, to_node)]['vars']) == 1:
            all_edges[(src_node, to_node)]['label'] = str(
                all_vars[all_edges[(src_node, to_node)]['vars'][0]]['shape'])

    final_data = {
        'version': _graph_version,
        'nodes': list(all_ops.values()),
        'vars': list(all_vars.values()),
        'edges': list(all_edges.values())
    }
    return final_data
