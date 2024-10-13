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
"""
        pseudocode:
        for i in range(1, 10):
            a = 2 * i
            if i < 5:
                if i >= 3:
                    return a + a
                else:
                    return a - a
            else:
                if i < 8:
                    return a * a
                else:
                    return a / a
"""
paddle.enable_static()


def less_than_branch(i, a):
    return paddle.static.nn.cond(
        i >= 3.0,
        lambda: paddle.add(a, a),
        lambda: paddle.subtract(a, a),
    )


def greater_equal_branch(i, a):
    return paddle.static.nn.cond(
        i < 8.0,
        lambda: paddle.multiply(a, a),
        lambda: paddle.divide(a, a),
    )


main_program = paddle.static.Program()
startup_program = paddle.static.Program()
with paddle.static.program_guard(main_program, startup_program):
    i = paddle.static.data(name="i", shape=[1], dtype='float32')
    i.stop_gradient = False
    a = 2.0 * i
    out = paddle.static.nn.cond(
        i < 5.0,
        lambda: less_than_branch(i, a),
        lambda: greater_equal_branch(i, a),
    )
    mean = paddle.mean(out)

with LogWriter(logdir="./log/cond_inside_cond_test/") as writer:
    writer.add_graph(
        model=main_program,
        input_spec=[paddle.static.InputSpec([1], dtype='float32')],
        verbose=True,
        is_pir=True)
