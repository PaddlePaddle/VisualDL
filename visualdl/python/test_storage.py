import storage
import numpy as np
import unittest
import random
import time


class StorageTest(unittest.TestCase):
    def setUp(self):
        self.dir = "./tmp/storage_test"
        self.writer = storage.StorageWriter(
            self.dir, sync_cycle=1).as_mode("train")

    def test_scalar(self):
        print 'test write'
        scalar = self.writer.scalar("model/scalar/min")
        # scalar.set_caption("model/scalar/min")
        for i in range(10):
            scalar.add_record(i, float(i))

        print 'test read'
        self.reader = storage.StorageReader(self.dir).as_mode("train")
        scalar = self.reader.scalar("model/scalar/min")
        self.assertEqual(scalar.caption(), "train")
        records = scalar.records()
        ids = scalar.ids()
        self.assertTrue(np.equal(records, [float(i) for i in range(10)]).all())
        self.assertTrue(np.equal(ids, [float(i) for i in range(10)]).all())
        print 'records', records
        print 'ids', ids

    def test_image(self):
        tag = "layer1/layer2/image0"
        image_writer = self.writer.image(tag, 10)
        num_passes = 10
        num_samples = 100

        for pass_ in xrange(num_passes):
            image_writer.start_sampling()
            for ins in xrange(num_samples):
                index =  image_writer.is_sample_taken()
                if index != -1:
                    shape = [3, 10, 10]
                    data = np.random.random(shape) * 256
                    data = np.ndarray.flatten(data)
                    image_writer.set_sample(index, shape, list(data))
            image_writer.finish_sampling()

        self.reader = storage.StorageReader(self.dir).as_mode("train")
        image_reader = self.reader.image(tag)
        self.assertEqual(image_reader.caption(), tag)


if __name__ == '__main__':
    unittest.main()
