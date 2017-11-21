import sys
import unittest

sys.path.append('../../build')
import core

im = core.im()


class StorageTester(unittest.TestCase):
    def setUp(self):
        self.storage = im.storage()

    def test_size(self):
        self.assertEqual(self.storage.tablets_size(), 0)
        im.add_tablet("tag0", 100)
        self.assertEqual(self.storage.tablets_size(), 1)

        for i in range(1, 11):
            im.add_tablet("tag%d" % i, 100)
        self.assertEqual(self.storage.tablets_size(), 11)

    def test_timestamp(self):
        print self.storage.timestamp()

    def test_dir(self):
        dir = "./1.txt"
        self.storage.set_dir(dir)
        self.assertEqual(dir, self.storage.dir())

    def test_human_readable_buffer(self):
        print self.storage.human_readable_buffer()


class TabletTester(unittest.TestCase):
    def setUp(self):
        self.tablet = im.add_tablet("tag101", 20)

    def test_add_scalar(self):
        self.tablet.add_scalar_float(1, 0.3)
        self.assertEqual(self.tablet.records_size(), 1)

    def test_human_readable_buffer(self):
        print self.tablet.human_readable_buffer()


if __name__ == '__main__':
    unittest.main()
