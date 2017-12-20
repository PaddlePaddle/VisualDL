import summary
import numpy as np
import unittest
import random
import time


class ScalarTester(unittest.TestCase):
    def setUp(self):
        self.dir = "tmp/summary.test"
        # clean path
        try:
            os.rmdir(self.dir)
        except:
            pass
        self.im = summary.IM(self.dir, "write", 200)
        self.tablet_name = "scalar0"
        self.scalar = summary.scalar(self.im, self.tablet_name)
        self.py_captions = ["train cost", "test cost"]
        self.scalar.set_captions(self.py_captions)

        self.py_records = []
        self.py_ids = []
        # write
        for i in range(10):
            record = [0.1 * i, 0.2 * i]
            id = i * 10
            self.py_records.append(record)
            self.py_ids.append(id)
            self.scalar.add(id, record)

    def test_records(self):
        self.assertEqual(self.scalar.size, len(self.py_records))
        for i, record in enumerate(self.scalar.records):
            self.assertTrue(np.isclose(record, self.py_records[i]).all())

    def test_ids(self):
        self.assertEqual(len(self.py_ids), self.scalar.size)
        for i, id in enumerate(self.scalar.ids):
            self.assertEqual(self.py_ids[i], id)

    def test_captions(self):
        self.assertEqual(self.scalar.captions, self.py_captions)

    def test_read_records(self):
        time.sleep(1)
        im = summary.IM(self.dir, "read", 200)
        time.sleep(1)
        scalar = summary.scalar(im, self.tablet_name)
        records = scalar.records
        self.assertEqual(len(self.py_records), scalar.size)
        for i, record in enumerate(self.scalar.records):
            self.assertTrue(np.isclose(record, records[i]).all())

    def test_read_ids(self):
        time.sleep(0.6)
        im = summary.IM(self.dir, "read", msecs=200)
        time.sleep(0.6)
        scalar = summary.scalar(im, self.tablet_name)
        self.assertEqual(len(self.py_ids), scalar.size)
        for i, id in enumerate(scalar.ids):
            self.assertEqual(self.py_ids[i], id)

    def test_read_captions(self):
        time.sleep(0.6)
        im = summary.IM(self.dir, "read", msecs=200)
        time.sleep(0.6)
        scalar = summary.scalar(im, self.tablet_name)
        self.assertEqual(scalar.captions, self.py_captions)

    def test_mix_read_write(self):
        write_im = summary.IM(self.dir, "write", msecs=200)
        time.sleep(0.6)
        read_im = summary.IM(self.dir, "read", msecs=200)

        scalar_writer = summary.scalar(write_im, self.tablet_name)
        scalar_reader = summary.scalar(read_im, self.tablet_name)

        scalar_writer.set_captions(["train cost", "test cost"])
        for i in range(1000):
            scalar_writer.add(i, [random.random(), random.random()])

        scalar_reader.records

        for i in range(500):
            scalar_writer.add(i, [random.random(), random.random()])

        scalar_reader.records

        for i in range(500):
            scalar_writer.add(i, [random.random(), random.random()])

        for i in range(10):
            scalar_reader.records
            scalar_reader.captions


if __name__ == '__main__':
    unittest.main()
