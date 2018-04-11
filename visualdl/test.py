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

import sys

import unittest
import numpy as np

sys.path.append('../../build')  # noqa: E402
import core

im = core.im()


class StorageTester(unittest.TestCase):
    def setUp(self):
        im.clear_tablets()
        self.storage = im.storage()

    def test_size(self):
        self.assertEqual(self.storage.tablets_size(), 0)
        im.add_tablet("tag0", 100)
        self.assertEqual(self.storage.tablets_size(), 1)

        for i in range(1, 11):
            im.add_tablet("tag%d" % i, 100)
        self.assertEqual(self.storage.tablets_size(), 11)

    def test_timestamp(self):
        print(self.storage.timestamp())

    def test_dir(self):
        dir = "./1.txt"
        self.storage.set_dir(dir)
        self.assertEqual(dir, self.storage.dir())

    def test_human_readable_buffer(self):
        print(self.storage.human_readable_buffer())


class TabletTester(unittest.TestCase):
    def setUp(self):
        im.clear_tablets()
        self.tablet = im.add_tablet("tag101", 20)

    def test_human_readable_buffer(self):
        print(self.tablet.human_readable_buffer())

    def test_scalar(self):
        scalar = self.tablet.as_float_scalar()
        py_captions = ["train", "test"]
        step_ids = [10, 20, 30]
        py_records = [[0.1, 0.2], [0.2, 0.3], [0.3, 0.4]]

        scalar.set_captions(py_captions)
        for i in range(len(py_records)):
            scalar.add_record(step_ids[i], py_records[i])

        records = scalar.get_records()
        ids = scalar.get_ids()
        for i in range(len(py_records)):
            self.assertTrue(np.isclose(py_records[i], records[i]).all())
            self.assertEqual(step_ids[i], ids[i])


class ImTester(unittest.TestCase):
    def test_persist(self):
        im.clear_tablets()
        im.add_tablet("tab0", 111)
        self.assertEqual(im.storage().tablets_size(), 1)
        im.storage().set_dir("./1")
        im.persist_to_disk()


if __name__ == '__main__':
    unittest.main()
