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
import json
import os
import tempfile

from .graph_component import analyse_model
from .graph_component import analyse_pir
from .utils import create_opname_scope
from .utils import print_model


def translate_graph(model, input_spec, verbose=True, **kwargs):
    try:
        import paddle
    except Exception:
        print("Paddlepaddle is required to use add_graph interface.\n\
              Please refer to \
              https://www.paddlepaddle.org.cn/install/quick?docurl=/documentation/docs/zh/install/pip/linux-pip.html\
              to install paddlepaddle.")
    is_pir = kwargs.get('is_pir', False)
    with tempfile.TemporaryDirectory() as tmp:
        if (not is_pir):
            model._full_name = '{}[{}]'.format(model.__class__.__name__,
                                               "model")
            create_opname_scope(model)
            model = paddle.jit.to_static(model, input_spec)
            paddle.jit.save(model, os.path.join(tmp, 'temp'))
            model_data = open(os.path.join(tmp, 'temp.pdmodel'), 'rb').read()
            result = analyse_model(model_data)
        else:
            if isinstance(model, paddle.base.libpaddle.pir.Program):
                result = analyse_pir(model)
            else:
                model = paddle.jit.to_static(model, input_spec)
                paddle.jit.save(model, os.path.join(tmp, 'temp'))
                model_data = paddle.jit.load(os.path.join(tmp, 'temp'))
                result = analyse_pir(model_data.program())
    if verbose:
        print_model(result)
    result = json.dumps(result, indent=2)
    return result
