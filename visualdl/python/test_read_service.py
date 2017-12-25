import summary
import numpy as np
import unittest
import time


class StorageTester(unittest.TestCase):
    def test_storage(self):
        summary.set_writable_storage("./tmp_dir")
        time.sleep(5)
        summary.stop_service()


if __name__ == '__main__':
    unittest.main()
