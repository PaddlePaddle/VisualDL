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
from collections import Counter
from collections import deque

_name_scope_stack = deque()


def _opname_creation_prehook(layer, inputs):
    from paddle.static import name_scope
    global _name_scope_stack
    _name_scope_stack.append(name_scope(layer.full_name()))
    _name_scope_stack[-1].__enter__()


def _opname_creation_posthook(layer, inputs, outputs):
    global _name_scope_stack
    name_scope_manager = _name_scope_stack.pop()
    name_scope_manager.__exit__(None, None, None)


def create_opname_scope(layer):
    layer.register_forward_pre_hook(_opname_creation_prehook)
    for name, sublayer in layer.named_children():
        sublayer._full_name = '{}[{}]'.format(sublayer.__class__.__name__,
                                              name)
        create_opname_scope(sublayer)
    layer.register_forward_post_hook(_opname_creation_posthook)


def print_model(analyse_result):
    '''
    Print some information about model for users, we count numbers of ops and layers.
    '''
    result = []
    # statistics
    op_counter = Counter()
    layer_counter = Counter()
    nodes = analyse_result['nodes']
    total_ops = 0
    total_layers = 0
    for node in nodes:
        if node['name'] == '/':
            continue
        if not node['children_node']:
            op_counter[node['type']] += 1
            total_ops += 1
        else:
            layer_counter[node['type']] += 1
            total_layers += 1

    SPACING_SIZE = 2
    row_format_list = [""]
    header_sep_list = [""]
    line_length_list = [-SPACING_SIZE]

    def add_title(padding, text):
        left_length = padding - len(text)
        half = left_length // 2
        return '-' * half + text + '-' * (left_length - half)

    def add_column(padding, text_dir='<'):
        row_format_list[0] += '{: ' + text_dir + str(padding) + '}' + (
            ' ' * SPACING_SIZE)
        header_sep_list[0] += '-' * padding + (' ' * SPACING_SIZE)
        line_length_list[0] += padding + SPACING_SIZE

    def append(s):
        result.append(s)
        result.append('\n')

    headers = ['Name', 'Type', 'Count']
    column_width = 20
    for _ in headers:
        add_column(column_width)

    row_format = row_format_list[0]
    header_sep = header_sep_list[0]
    line_length = line_length_list[0]

    # construct table string
    append(add_title(line_length, "Graph Summary"))
    append('total operators: {}\ttotal layers:{}'.format(
        total_ops, total_layers))
    append(header_sep)
    append(row_format.format(*headers))
    append(header_sep)
    for op_type, count in op_counter.items():
        row_values = [op_type, 'operator', count]
        append(row_format.format(*row_values))
    for layer_type, count in layer_counter.items():
        row_values = [layer_type, 'layer', count]
        append(row_format.format(*row_values))
    append('-' * line_length)
    print(''.join(result))
