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

from __future__ import print_function
import pprint
import unittest

from visualdl import LogReader, LogWriter

from . import lib
from .storage_mock import add_histogram, add_image, add_scalar

_retry_counter = 0


class LibTest(unittest.TestCase):
    def setUp(self):
        dir = "./tmp/mock"
        writer = LogWriter(dir, sync_cycle=30)

        add_scalar(writer, "train", "layer/scalar0/min", 1000, 1)
        add_scalar(writer, "test", "layer/scalar0/min", 1000, 10)
        add_scalar(writer, "valid", "layer/scalar0/min", 1000, 10)

        add_scalar(writer, "train", "layer/scalar0/max", 1000, 1)
        add_scalar(writer, "test", "layer/scalar0/max", 1000, 10)
        add_scalar(writer, "valid", "layer/scalar0/max", 1000, 10)

        add_image(writer, "train", "layer/image0", 7, 10, 1)
        add_image(writer, "test", "layer/image0", 7, 10, 3)

        add_image(writer, "train", "layer/image1", 7, 10, 1, shape=[30, 30, 2])
        add_image(writer, "test", "layer/image1", 7, 10, 1, shape=[30, 30, 2])

        add_histogram(writer, "train", "layer/histogram0", 100)
        add_histogram(writer, "test", "layer/histogram0", 100)

        self.reader = LogReader(dir)

    def test_retry(self):
        ntimes = 7
        time2sleep = 1

        def func():
            global _retry_counter
            if _retry_counter < 5:
                _retry_counter += 1
                raise
            return _retry_counter

        lib.retry(ntimes, func, time2sleep)

        self.assertEqual(_retry_counter, 5)

    def test_modes(self):
        modes = lib.get_modes(self.reader)
        self.assertEqual(
            sorted(modes), sorted(["default", "train", "test", "valid"]))

    def test_scalar(self):
        tags = lib.get_scalar_tags(self.reader)
        print('scalar tags:')
        pprint.pprint(tags)
        self.assertEqual(len(tags), 3)
        self.assertEqual(
            sorted(tags.keys()), sorted("train test valid".split()))

    def test_image(self):
        tags = lib.get_image_tags(self.reader)
        self.assertEqual(len(tags), 2)

        tags = lib.get_image_tag_steps(self.reader, 'train', 'layer/image0/0')
        pprint.pprint(tags)

        image = lib.get_invididual_image(self.reader, "train",
                                         'layer/image0/0', 2)
        print(image)

    def test_histogram(self):
        tags = lib.get_histogram_tags(self.reader)
        self.assertEqual(len(tags), 2)

        res = lib.get_histogram(self.reader, "train", "layer/histogram0")
        pprint.pprint(res)


if __name__ == '__main__':
    unittest.main()
