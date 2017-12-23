import storage
import numpy as np
import unittest
import random
import time

class StorageTest(unittest.TestCase):
    def setUp(self):
        self.dir = "./tmp/storage_test"
        self.writer = storage.StorageWriter("train", self.dir)

    def test_write(self):
        scalar = self.writer.scalar("model/scalar/min")
        scalar.set_caption("model/scalar/min")
        for i in range(10):
            scalar.add_record(i, [1.0])

    def test_read(self):
        self.reader = storage.StorageReader("train", self.dir)
        scalar = self.reader.scalar("model/scalar/min")
        self.assertEqual(scalar.get_caption(), "model/scalar/min")


if __name__ == '__main__':
    unittest.main()
