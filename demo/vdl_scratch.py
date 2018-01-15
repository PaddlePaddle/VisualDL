#!/user/bin/env python
import os
from visualdl import LogWriter, ROOT
import subprocess
from scipy.stats import norm
import numpy as np
import random
from PIL import Image

logdir = './scratch_log'

logw = LogWriter(logdir, sync_cycle=30)

# create scalars in mode train and test.
with logw.mode('train') as logger:
    scalar0 = logger.scalar("scratch/scalar")

with logw.mode('test') as logger:
    scalar1 = logger.scalar("scratch/scalar")

# add scalar records.
for step in range(200):
    scalar0.add_record(step, step * 1. / 200)
    scalar1.add_record(step, 1. - step * 1. / 200)

# create histogram
with logw.mode('train') as logger:
    histogram = logger.histogram("scratch/histogram", num_buckets=100)
    for step in range(100):
        histogram.add_record(step,
                             np.random.normal(0.1 + step * 0.01, size=1000))

# create image
with logw.mode("train") as logger:
    image = logger.image("scratch/dog", 4,
                         1)  # randomly sample 4 images one pass
    dog_jpg = Image.open(os.path.join(ROOT, 'python/dog.jpg'))
    shape = [dog_jpg.size[1], dog_jpg.size[0], 3]

    for pass_ in xrange(4):
        image.start_sampling()
        for sample in xrange(10):
            # randomly crop a demo image.
            target_shape = [100, 100, 3]  # width, height, channels(3 for RGB)
            left_x = random.randint(0, shape[1] - target_shape[1])
            left_y = random.randint(0, shape[0] - target_shape[0])
            right_x = left_x + target_shape[1]
            right_y = left_y + target_shape[0]

            idx = image.is_sample_taken()
            # a more efficient way to sample images is
            if idx >= 0:
                data = np.array(
                    dog_jpg.crop((left_x, left_y, right_x,
                                  right_y))).flatten()
                image.set_sample(idx, target_shape, data)
            # you can also just write followig codes, it is more clear, but need to
            # process image even if it will not be sampled.
            # data = np.array(
            #     dog_jpg.crop((left_x, left_y, right_x,
            #                     right_y))).flatten()
            # image.add_sample(shape, data)

        image.finish_sampling()
