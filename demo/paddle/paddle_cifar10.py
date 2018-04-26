# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =======================================================================

from __future__ import print_function

import numpy as np
from visualdl import LogWriter

import paddle.v2 as paddle
import paddle.v2.fluid as fluid
import paddle.v2.fluid.framework as framework
from paddle.v2.fluid.initializer import NormalInitializer
from paddle.v2.fluid.param_attr import ParamAttr

# create VisualDL logger and directory
logdir = "./tmp"
logwriter = LogWriter(logdir, sync_cycle=10)

# create 'train' run
with logwriter.mode("train") as writer:
    # create 'loss' scalar tag to keep track of loss function
    loss_scalar = writer.scalar("loss")

with logwriter.mode("train") as writer:
    acc_scalar = writer.scalar("acc")

num_samples = 4
with logwriter.mode("train") as writer:
    conv_image = writer.image("conv_image", num_samples,
                              1)  # show 4 samples for every 1 step
    input_image = writer.image("input_image", num_samples, 1)

with logwriter.mode("train") as writer:
    param1_histgram = writer.histogram(
        "param1", 100)  # 100 buckets, e.g 100 data sets in a histograms


def vgg16_bn_drop(input):
    def conv_block(input, num_filter, groups, dropouts):
        return fluid.nets.img_conv_group(
            input=input,
            pool_size=2,
            pool_stride=2,
            conv_num_filter=[num_filter] * groups,
            conv_filter_size=3,
            conv_act='relu',
            conv_with_batchnorm=True,
            conv_batchnorm_drop_rate=dropouts,
            pool_type='max')

    conv1 = conv_block(input, 64, 2, [0.3, 0])
    conv2 = conv_block(conv1, 128, 2, [0.4, 0])
    conv3 = conv_block(conv2, 256, 3, [0.4, 0.4, 0])
    conv4 = conv_block(conv3, 512, 3, [0.4, 0.4, 0])
    conv5 = conv_block(conv4, 512, 3, [0.4, 0.4, 0])

    drop = fluid.layers.dropout(x=conv5, dropout_prob=0.5)
    fc1 = fluid.layers.fc(input=drop, size=512, act=None)
    bn = fluid.layers.batch_norm(input=fc1, act='relu')
    drop2 = fluid.layers.dropout(x=bn, dropout_prob=0.5)
    fc2 = fluid.layers.fc(input=drop2, size=512, act=None)
    return fc2, conv1


classdim = 10
data_shape = [3, 32, 32]

images = fluid.layers.data(name='pixel', shape=data_shape, dtype='float32')
label = fluid.layers.data(name='label', shape=[1], dtype='int64')

net, conv1 = vgg16_bn_drop(images)

predict = fluid.layers.fc(
    input=net,
    size=classdim,
    act='softmax',
    param_attr=ParamAttr(name="param1", initializer=NormalInitializer()))
cost = fluid.layers.cross_entropy(input=predict, label=label)
avg_cost = fluid.layers.mean(x=cost)

optimizer = fluid.optimizer.Adam(learning_rate=0.001)
opts = optimizer.minimize(avg_cost)

accuracy = fluid.evaluator.Accuracy(input=predict, label=label)

BATCH_SIZE = 16
PASS_NUM = 1

train_reader = paddle.batch(
    paddle.reader.shuffle(paddle.dataset.cifar.train10(), buf_size=128 * 10),
    batch_size=BATCH_SIZE)

place = fluid.CPUPlace()
exe = fluid.Executor(place)
feeder = fluid.DataFeeder(place=place, feed_list=[images, label])
exe.run(fluid.default_startup_program())

step = 0
sample_num = 0

start_up_program = framework.default_startup_program()

param1_var = start_up_program.global_block().var("param1")

for pass_id in range(PASS_NUM):
    accuracy.reset(exe)
    for data in train_reader():
        loss, conv1_out, param1, acc = exe.run(
            fluid.default_main_program(),
            feed=feeder.feed(data),
            fetch_list=[avg_cost, conv1, param1_var] + accuracy.metrics)
        pass_acc = accuracy.eval(exe)

        # all code below is for VisualDL

        # start picking sample from beginning
        if sample_num == 0:
            input_image.start_sampling()
            conv_image.start_sampling()

        idx1 = input_image.is_sample_taken()
        idx2 = conv_image.is_sample_taken()
        assert idx1 == idx2
        idx = idx1
        if idx != -1:
            image_data = data[0][0]
            # reshape the image to 32x32 and 3 channels
            input_image_data = np.transpose(
                image_data.reshape(data_shape), axes=[1, 2, 0])
            # add sample to VisualDL Image Writer to view input image
            input_image.set_sample(idx, input_image_data.shape,
                                   input_image_data.flatten())

            conv_image_data = conv1_out[0][0]
            # add sample to view conv image
            conv_image.set_sample(idx, conv_image_data.shape,
                                  conv_image_data.flatten())

            sample_num += 1
            # when we have enough samples, call finish sampling()
            if sample_num % num_samples == 0:
                input_image.finish_sampling()
                conv_image.finish_sampling()
                sample_num = 0

        # add record for loss and accuracy to scalar
        loss_scalar.add_record(step, loss)
        acc_scalar.add_record(step, acc)
        param1_histgram.add_record(step, param1.flatten())

        print("loss:" + str(loss) + " acc:" + str(acc) + " pass_acc:" + str(
            pass_acc))
        step += 1
        # this model is slow, so if we can train two mini batch, we think it works properly.
        # exit(0)
exit(1)
