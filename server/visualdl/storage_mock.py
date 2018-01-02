import random
import time
import unittest

import numpy as np


def add_scalar(writer, mode, tag, num_steps, skip):
    with writer.mode(mode) as my_writer:
        scalar = my_writer.scalar(tag)
        for i in range(num_steps):
            if i % skip == 0:
                scalar.add_record(i, random.random())


def add_image(writer,
              mode,
              tag,
              num_samples,
              num_passes,
              step_cycle,
              shape=[50, 50, 3]):
    with writer.mode(mode) as writer_:
        image_writer = writer_.image(tag, num_samples, step_cycle)

        for pass_ in xrange(num_passes):
            image_writer.start_sampling()
            for ins in xrange(2 * num_samples):
                index = image_writer.is_sample_taken()
                if index != -1:
                    data = np.random.random(shape) * 256
                    data = np.ndarray.flatten(data)
                    assert shape
                    assert len(data) > 0
                    image_writer.set_sample(index, shape, list(data))
            image_writer.finish_sampling()


if __name__ == '__main__':
    add_scalar("train", "layer/scalar0/min", 1000, 1)
    add_scalar("test", "layer/scalar0/min", 1000, 10)
    add_scalar("valid", "layer/scalar0/min", 1000, 10)

    add_scalar("train", "layer/scalar0/max", 1000, 1)
    add_scalar("test", "layer/scalar0/max", 1000, 10)
    add_scalar("valid", "layer/scalar0/max", 1000, 10)

    add_image("train", "layer/image0", 7, 10, 1)
    add_image("test", "layer/image0", 7, 10, 3)
