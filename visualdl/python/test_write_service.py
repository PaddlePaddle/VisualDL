import summary
import numpy as np
import unittest
import time


class StorageTester(unittest.TestCase):
    def test_read_storage(self):
        summary.set_readable_storage("./tmp")
        time.sleep(1)
        scalar = summary.read_scalar('tag01')
        time.sleep(5)
        summary.stop_service()


if __name__ == '__main__':
    unittest.main()
