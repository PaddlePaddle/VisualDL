import storage
import numpy as np
import unittest
import random
import time


class StorageTest(unittest.TestCase):
    def setUp(self):
        self.dir = "./tmp/storage_test"

    def test_read(self):
        print 'test write'
        self.writer = storage.StorageWriter(
            self.dir, sync_cycle=1).as_mode("train")
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


if __name__ == '__main__':
    unittest.main()
