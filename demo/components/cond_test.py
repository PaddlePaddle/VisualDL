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
"""
    pseudocode:
    for i in range(1, 10):
        a = 2 * i
        if i < 5:
            return a + a
        else:
            return a - a
"""


class ConditionalLayer(paddle.nn.Layer):
    def __init__(self):
        super(ConditionalLayer, self).__init__()

    def forward(self, i):
        a = 2.0 * i
        out = paddle.static.nn.cond(
            i < 5.0,
            lambda: paddle.add(a, a),
            lambda: paddle.subtract(a, a),
        )
        return out


main_program = paddle.static.Program()
startup_program = paddle.static.Program()
with paddle.static.program_guard(main_program, startup_program):
    i = paddle.static.data(name="i", shape=[1], dtype='float32')
    i.stop_gradient = False
    a = 2.0 * i
    out = paddle.static.nn.cond(
        i < 5.0,
        lambda: paddle.add(a, a),
        lambda: paddle.subtract(a, a),
    )
    mean = paddle.mean(out)

with LogWriter(logdir="./log/cond_test/") as writer:
    writer.add_graph(
        model=main_program,
        input_spec=[paddle.static.InputSpec([1], 'float32')],
        verbose=True,
        is_pir=True)
