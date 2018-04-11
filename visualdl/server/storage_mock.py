# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
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

import random

import numpy as np


def add_scalar(writer, mode, tag, num_steps, skip):
    with writer.mode(mode) as my_writer:
        scalar = my_writer.scalar(tag)
        for i in range(num_steps):
            if i % skip == 0:
                scalar.add_record(i, random.random())


def add_image(writer,
              mode,
              tag,
              num_samples,
              num_passes,
              step_cycle,
              shape=[50, 50, 3]):
    with writer.mode(mode) as writer_:
        image_writer = writer_.image(tag, num_samples, step_cycle)

        for pass_ in range(num_passes):
            image_writer.start_sampling()
            for ins in range(2 * num_samples):
                data = np.random.random(shape) * 256
                data = np.ndarray.flatten(data)
                image_writer.add_sample(shape, list(data))
            image_writer.finish_sampling()


def add_histogram(writer, mode, tag, num_buckets):
    with writer.mode(mode) as writer:
        histogram = writer.histogram(tag, num_buckets)
        for i in range(10):
            histogram.add_record(i, np.random.normal(
                0.1 + i * 0.01, size=1000))
