import pprint
import unittest

import lib
import storage
from storage_mock import add_image, add_scalar


class LibTest(unittest.TestCase):
    def setUp(self):
        dir = "./tmp/mock"
        writer = storage.LogWriter(dir, sync_cycle=20)

        add_scalar(writer, "train", "layer/scalar0/min", 1000, 1)
        add_scalar(writer, "test", "layer/scalar0/min", 1000, 10)
        add_scalar(writer, "valid", "layer/scalar0/min", 1000, 10)

        add_scalar(writer, "train", "layer/scalar0/max", 1000, 1)
        add_scalar(writer, "test", "layer/scalar0/max", 1000, 10)
        add_scalar(writer, "valid", "layer/scalar0/max", 1000, 10)

        add_image(writer, "train", "layer/image0", 7, 10, 1)
        add_image(writer, "test", "layer/image0", 7, 10, 3)

        add_image(writer, "train", "layer/image1", 7, 10, 1, shape=[30,30,2])
        add_image(writer, "test", "layer/image1", 7, 10, 1, shape=[30,30,2])

        self.reader = storage.LogReader(dir)

    def test_modes(self):
        modes = lib.get_modes(self.reader)
        self.assertEqual(sorted(modes), sorted(["default", "train", "test", "valid"]))

    def test_scalar(self):

        for mode in "train test valid".split():
            tags = lib.get_scalar_tags(self.reader, mode)
            print 'scalar tags:'
            pprint.pprint(tags)
            self.assertEqual(len(tags), 3)
            self.assertEqual(sorted(tags.keys()), sorted("train test valid".split()))

    def test_image(self):
        tags = lib.get_image_tags(self.reader)
        self.assertEqual(len(tags), 2)

        tags = lib.get_image_tag_steps(self.reader, 'train', 'layer/image0/0')
        pprint.pprint(tags)

        image = lib.get_invididual_image(self.reader, "train", 'layer/image0/0', 2)
        print image


if __name__ == '__main__':
    unittest.main()
