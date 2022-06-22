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
import paddle
import paddle.nn as nn
import paddle.nn.functional as F

from visualdl import LogWriter


class MyNet(nn.Layer):
    def __init__(self):
        super(MyNet, self).__init__()
        self.conv1 = nn.Conv2D(
            in_channels=1, out_channels=20, kernel_size=5, stride=1, padding=2)
        self.max_pool1 = nn.MaxPool2D(kernel_size=2, stride=2)
        self.conv2 = nn.Conv2D(
            in_channels=20,
            out_channels=20,
            kernel_size=5,
            stride=1,
            padding=2)
        self.max_pool2 = nn.MaxPool2D(kernel_size=2, stride=2)
        self.fc = nn.Linear(in_features=980, out_features=10)

    def forward(self, inputs):
        x = self.conv1(inputs)
        x = F.relu(x)
        x = self.max_pool1(x)
        x = self.conv2(x)
        x = F.relu(x)
        x = self.max_pool2(x)
        x = paddle.reshape(x, [x.shape[0], -1])
        x = self.fc(x)
        return x


net = MyNet()
with LogWriter(logdir="./log/graph_test/") as writer:
    writer.add_graph(
        model=net,
        input_spec=[paddle.static.InputSpec([-1, 1, 28, 28], 'float32')],
        verbose=True)
