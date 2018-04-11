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
import sys
import unittest

import numpy as np
from PIL import Image
from visualdl import LogReader, LogWriter

pprint.pprint(sys.path)


class StorageTest(unittest.TestCase):
    def setUp(self):
        self.dir = "./tmp/storage_test"
        self.writer = LogWriter(self.dir, sync_cycle=1).as_mode("train")

    def test_scalar(self):
        print('test write')
        scalar = self.writer.scalar("model/scalar/min")
        # scalar.set_caption("model/scalar/min")
        for i in range(10):
            scalar.add_record(i, float(i))

        print('test read')
        self.writer.save()
        self.reader = LogReader(self.dir)
        with self.reader.mode("train") as reader:
            scalar = reader.scalar("model/scalar/min")
            self.assertEqual(scalar.caption(), "train")
            records = scalar.records()
            ids = scalar.ids()
            self.assertTrue(
                np.equal(records, [float(i) for i in range(10)]).all())
            self.assertTrue(np.equal(ids, [float(i) for i in range(10)]).all())
            print('records', records)
            print('ids', ids)

    def test_image(self):
        tag = "layer1/layer2/image0"
        image_writer = self.writer.image(tag, 10, 1)
        num_passes = 10
        num_samples = 100
        shape = [10, 10, 3]

        for pass_ in range(num_passes):
            image_writer.start_sampling()
            for ins in range(num_samples):
                data = np.random.random(shape) * 256
                data = np.ndarray.flatten(data)
                image_writer.add_sample(shape, list(data))
            image_writer.finish_sampling()

        self.writer.save()

        self.reader = LogReader(self.dir)
        with self.reader.mode("train") as reader:
            image_reader = reader.image(tag)
            self.assertEqual(image_reader.caption(), tag)
            self.assertEqual(image_reader.num_records(), num_passes)

            image_record = image_reader.record(0, 1)
            self.assertTrue(np.equal(image_record.shape(), shape).all())
            data = image_record.data()
            self.assertEqual(len(data), np.prod(shape))

            image_tags = reader.tags("image")
            self.assertTrue(image_tags)
            self.assertEqual(len(image_tags), 1)

    def test_check_image(self):
        '''
        check whether the storage will keep image data consistent
        '''
        print('check image')
        tag = "layer1/check/image1"
        image_writer = self.writer.image(tag, 10)

        image = Image.open("./dog.jpg")
        shape = [image.size[1], image.size[0], 3]
        origin_data = np.array(image.getdata()).flatten()

        self.writer.save()

        self.reader = LogReader(self.dir)
        with self.reader.mode("train") as reader:

            image_writer.start_sampling()
            image_writer.add_sample(shape, list(origin_data))
            image_writer.finish_sampling()

            # read and check whether the original image will be displayed
            image_reader = reader.image(tag)
            image_record = image_reader.record(0, 0)
            data = image_record.data()
            shape = image_record.shape()

            PIL_image_shape = (shape[0] * shape[1], shape[2])
            data = np.array(data, dtype='uint8').reshape(PIL_image_shape)
            print('origin', origin_data.flatten())
            print('data', data.flatten())
            image = Image.fromarray(data.reshape(shape))
            # manully check the image and found that nothing wrong with the image storage.
            # image.show()

    def test_with_syntax(self):
        with self.writer.mode("train") as writer:
            scalar = writer.scalar("model/scalar/average")
            for i in range(10):
                scalar.add_record(i, float(i))

        self.writer.save()

        self.reader = LogReader(self.dir)
        with self.reader.mode("train") as reader:
            scalar = reader.scalar("model/scalar/average")
            self.assertEqual(scalar.caption(), "train")

    def test_modes(self):
        store = LogWriter(self.dir, sync_cycle=1)

        scalars = []

        for i in range(10):
            with store.mode("mode-%d" % i) as writer:
                scalar = writer.scalar("add/scalar0")
                scalars.append(scalar)

        for scalar in scalars[:-1]:
            for i in range(10):
                scalar.add_record(i, float(i))


if __name__ == '__main__':
    unittest.main()
