from collections import deque

import paddle.nn as nn
from paddle.fluid.framework import name_scope
from paddle.fluid.core import AttrType

_name_scope_stack = deque()

def _opname_creation_prehook(layer, inputs):
    global _name_scope_stack
    _name_scope_stack.append(name_scope(layer.full_name()))
    _name_scope_stack[-1].__enter__()

def _opname_creation_posthook(layer, inputs, outputs):
    global _name_scope_stack
    name_scope_manager = _name_scope_stack.pop()
    name_scope_manager.__exit__(None, None, None)


def create_opname_scope(layer: nn.Layer):
    layer.register_forward_pre_hook(_opname_creation_prehook)
    for name, sublayer in layer.named_children():
        sublayer._full_name = '{}[{}]'.format(sublayer.__class__.__name__, name)
        create_opname_scope(sublayer)
    layer.register_forward_post_hook(_opname_creation_posthook)
