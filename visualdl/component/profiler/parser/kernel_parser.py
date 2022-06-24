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

class DeviceItem:
    def __init__(self, name):
        self.name = name
        self.call = 0
        self.gpu_time = 0
        self.max_gpu_time = 0
        self.min_gpu_time = float('inf')

    @property
    def avg_gpu_time(self):
        return self.gpu_time / self.call

    def add_gpu_time(self, time):
        if time > self.max_gpu_time:
            self.max_gpu_time = time
        if time < self.min_gpu_time:
            self.min_gpu_time = time
        self.gpu_time += time

    def add_item(self, node):
        self.call += 1
        self.add_gpu_time(node.end_ns - node.start_ns)

class KernelParser:
  def __init__(self):
    self.kernel_items = {}  # for kernel summary


  def parse(self, nodelists):
    for threadid, nodes in nodelists.items():
      for node in nodes:
        if node.type == TracerEventType.Kernel:
          name = node.name
          if name not in self.kernel_items:
              self.kernel_items[name] = EventSummary.DeviceItem(name)
          self.kernel_items[name].add_item(node)