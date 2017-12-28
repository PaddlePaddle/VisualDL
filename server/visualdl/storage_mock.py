import random
import time
import unittest

import numpy as np

import storage

dir = "./tmp/mock"
writer = storage.StorageWriter(dir, sync_cycle=20)

train_writer = writer.as_mode("train")
test_writer = writer.as_mode("test")

train_scalar = train_writer.scalar("model/scalar/min")
test_scalar = test_writer.scalar("model/scalar/min")

train_scalar1 = train_writer.scalar("model/scalar/max")
test_scalar1 = test_writer.scalar("model/scalar/max")

for i in range(100):
    train_scalar.add_record(i, random.random())
    train_scalar1.add_record(i, random.random())
    if i % 10 == 0:
        test_scalar.add_record(i, random.random())
        test_scalar1.add_record(i, random.random())

def add_image(mode):
    writer_ = writer.as_mode(mode)
    tag = "layer1/layer2/image0"
    # TODO check step_cycle
    num_samples = 10
    num_passes = 20
    image_writer = writer_.image(tag, num_samples, 1)
    shape = [50, 50, 3]

    for pass_ in xrange(num_passes):
        image_writer.start_sampling()
        for ins in xrange(2*num_samples):
            print '.',
            index =  image_writer.is_sample_taken()
            if index != -1:
                data = np.random.random(shape) * 256
                data = np.ndarray.flatten(data)
                image_writer.set_sample(index, shape, list(data))
        image_writer.finish_sampling()

add_image("train")
add_image("test")
