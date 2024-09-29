# Copyright (c) 2024 VisualDL Authors. All Rights Reserve.
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
import paddle
from visualdl import LogWriter

paddle.enable_static()

main_program, start_program = (
    paddle.static.Program(),
    paddle.static.Program(),
)
with paddle.static.program_guard(main_program, start_program):
    x = paddle.static.data("x", [1, 64, 64, 8], dtype="float32")
    y = paddle.static.data("y", [1, 64, 64, 8], dtype="float32")
    divide_out = paddle.divide(x, y)
    tanh_out = paddle.tanh(divide_out)
    conv2d = paddle.nn.Conv2D(8, 32, 1, bias_attr=False, data_format='NHWC')
    batch_norm = paddle.nn.BatchNorm(32, act='relu', data_layout='NHWC')
    out = batch_norm(conv2d(tanh_out))

with LogWriter(logdir="./log/program_test/") as writer:
    writer.add_graph(
        model=main_program,
        input_spec=[paddle.static.InputSpec([-1, 1, 28, 28], 'float32')],
        verbose=True,
        is_pir=True)
