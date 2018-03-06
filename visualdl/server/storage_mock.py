import random

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

        for pass_ in range(num_passes):
            image_writer.start_sampling()
            for ins in range(2 * num_samples):
                data = np.random.random(shape) * 256
                data = np.ndarray.flatten(data)
                image_writer.add_sample(shape, list(data))
            image_writer.finish_sampling()


def add_histogram(writer, mode, tag, num_buckets):
    with writer.mode(mode) as writer:
        histogram = writer.histogram(tag, num_buckets)
        for i in range(10):
            histogram.add_record(i, np.random.normal(
                0.1 + i * 0.01, size=1000))
