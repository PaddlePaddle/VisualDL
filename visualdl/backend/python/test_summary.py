import summary
import numpy as np
import unittest
import time

once_flag = False


class ScalarTester(unittest.TestCase):
    def setUp(self):
        summary.set_storage("tmp_dir")
        global once_flag
        self.scalar = summary.scalar("scalar0")
        if not once_flag:
            self.py_captions = ["train cost", "test cost"]
            self.scalar.set_captions(self.py_captions)

        self.py_records = []
        self.py_ids = []
        for i in range(10):
            record = [0.1 * i, 0.2 * i]
            id = i * 10
            self.py_records.append(record)
            self.py_ids.append(id)
            if not once_flag:
                self.scalar.add(id, record)
        once_flag = True

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


if __name__ == '__main__':
    unittest.main()
