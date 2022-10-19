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
# coding=utf-8
import math

from visualdl import LogWriter

if __name__ == '__main__':
    value = [i / 1000.0 for i in range(1000)]
    with LogWriter(logdir="./log/scalars_test/") as writer:
        for step in range(1000):
            writer.add_scalars(
                main_tag='math/formula1',
                tag_scalar_dict={
                    'sinx': math.sin(value[step]),
                    'cosx': math.cos(value[step])
                },
                step=step)
            writer.add_scalars(
                main_tag='math/formula12',
                tag_scalar_dict={
                    'sqrtx': math.sqrt(value[step]),
                    'squarex': value[step]**2
                },
                step=step)
            writer.add_scalar(
                tag='math/formula12', step=step, value=value[step])
