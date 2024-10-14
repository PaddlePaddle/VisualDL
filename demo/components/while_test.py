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
main_program = paddle.static.Program()
startup_program = paddle.static.Program()
with paddle.static.program_guard(main_program, startup_program):
    linear = paddle.nn.Linear(16, 10)

    def cond(i, loop_len, x, result):
        return i < loop_len

    def body(i, loop_len, x, result):
        result = linear(x)
        paddle.increment(i)
        return [i, loop_len, x, result]

    x = paddle.static.data(name='x', shape=[32, 16], dtype='float32')
    i = paddle.zeros(shape=[1], dtype='int64')
    loop_len = paddle.ones(shape=[1], dtype='int64')
    result = paddle.zeros(
        shape=x.shape[:-1] + linear.weight.shape[-1:], dtype="float32"
    )
    result.stop_gradient = False
    _, _, _, results = paddle.static.nn.while_loop(
        cond, body, [i, loop_len, x, result]
    )
    loss = paddle.mean(results)

with LogWriter(logdir="./log/while_test/") as writer:
    writer.add_graph(
        model=main_program,
        input_spec=[paddle.static.InputSpec([1], 'float32')],
        verbose=True,
        is_pir=True)
