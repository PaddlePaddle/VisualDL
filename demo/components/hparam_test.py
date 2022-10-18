# Copyright (c) 2021 VisualDL Authors. All Rights Reserve.
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

from visualdl import LogWriter

if __name__ == '__main__':
    # 记录第一次实验数据
    with LogWriter('./log/hparams_test/train/run1') as writer:
        # 记录hparams数值和metrics名称
        writer.add_hparams(hparams_dict={'lr': 0.1, 'bsize': 1, 'opt': 'sgd'},
                           metrics_list=['hparam/accuracy', 'hparam/loss'])
        # 通过将add_scalar接口中的tag与metrics名称对应，记录一次实验中不同step的metrics数值
        for i in range(10):
            writer.add_scalar(tag='hparam/accuracy', value=i, step=i)
            writer.add_scalar(tag='hparam/loss', value=2*i, step=i)

    # 记录第二次实验数据
    with LogWriter('./log/hparams_test/train/run2') as writer:
        # 记录hparams数值和metrics名称
        writer.add_hparams(hparams_dict={'lr': 0.2, 'bsize': 2, 'opt': 'relu'},
                           metrics_list=['hparam/accuracy', 'hparam/loss'])
        # 通过将add_scalar接口中的tag与metrics名称对应，记录一次实验中不同step的metrics数值
        for i in range(10):
            writer.add_scalar(tag='hparam/accuracy', value=1.0/(i+1), step=i)
            writer.add_scalar(tag='hparam/loss', value=5*i, step=i)
