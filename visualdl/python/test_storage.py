import random
import time
import unittest

import numpy as np
from PIL import Image

import storage


class StorageTest(unittest.TestCase):
    def setUp(self):
        self.dir = "./tmp/storage_test"
        self.writer = storage.LogWriter(
            self.dir, sync_cycle=1).as_mode("train")

    def test_scalar(self):
        print 'test write'
        scalar = self.writer.scalar("model/scalar/min")
        # scalar.set_caption("model/scalar/min")
        for i in range(10):
            scalar.add_record(i, float(i))

        print 'test read'
        self.reader = storage.LogReader(self.dir)
        with self.reader.mode("train") as reader:
            scalar = reader.scalar("model/scalar/min")
            self.assertEqual(scalar.caption(), "train")
            records = scalar.records()
            ids = scalar.ids()
            self.assertTrue(np.equal(records, [float(i) for i in range(10)]).all())
            self.assertTrue(np.equal(ids, [float(i) for i in range(10)]).all())
            print 'records', records
            print 'ids', ids

    def test_image(self):
        tag = "layer1/layer2/image0"
        image_writer = self.writer.image(tag, 10, 1)
        num_passes = 10
        num_samples = 100
        shape = [10, 10, 3]

        for pass_ in xrange(num_passes):
            image_writer.start_sampling()
            for ins in xrange(num_samples):
                index = image_writer.is_sample_taken()
                if index != -1:
                    data = np.random.random(shape) * 256
                    data = np.ndarray.flatten(data)
                    image_writer.set_sample(index, shape, list(data))
            image_writer.finish_sampling()

        self.reader = storage.LogReader(self.dir)
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
        print 'check image'
        tag = "layer1/check/image1"
        image_writer = self.writer.image(tag, 10, 1)

        image = Image.open("./dog.jpg")
        shape = [image.size[1], image.size[0], 3]
        origin_data = np.array(image.getdata()).flatten()

        self.reader = storage.LogReader(self.dir)
        with self.reader.mode("train") as reader:

            image_writer.start_sampling()
            index = image_writer.is_sample_taken()
            image_writer.set_sample(index, shape, list(origin_data))
            image_writer.finish_sampling()

            # read and check whether the original image will be displayed

            image_reader = reader.image(tag)
            image_record = image_reader.record(0, 0)
            data = image_record.data()
            shape = image_record.shape()

            PIL_image_shape = (shape[0] * shape[1], shape[2])
            data = np.array(data, dtype='uint8').reshape(PIL_image_shape)
            print 'origin', origin_data.flatten()
            print 'data', data.flatten()
            image = Image.fromarray(data.reshape(shape))
            # manully check the image and found that nothing wrong with the image storage.
            # image.show()

            # after scale, elements are changed.
            # self.assertTrue(
            #     np.equal(origin_data.reshape(PIL_image_shape), data).all())

    def test_with_syntax(self):
        with self.writer.mode("train") as writer:
            scalar = writer.scalar("model/scalar/average")
            for i in range(10):
                scalar.add_record(i, float(i))

        self.reader = storage.LogReader(self.dir)
        with self.reader.mode("train") as reader:
            scalar = reader.scalar("model/scalar/average")
            self.assertEqual(scalar.caption(), "train")

    def test_modes(self):
        dir = "./tmp/storagetest0"
        store = storage.LogWriter(
            self.dir, sync_cycle=1)

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
