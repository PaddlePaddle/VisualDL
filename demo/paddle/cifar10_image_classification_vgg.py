from __future__ import print_function

import sys

import numpy as np
from visualdl import LogWriter

import paddle.v2 as paddle
import paddle.v2.fluid as fluid
import paddle.v2.fluid.framework as framework
from paddle.v2.fluid.initializer import NormalInitializer
from paddle.v2.fluid.param_attr import ParamAttr

logdir = "./tmp"
logwriter = LogWriter(logdir, sync_cycle=10)

with logwriter.mode("train") as writer:
    loss_scalar = writer.scalar("loss")

with logwriter.mode("train") as writer:
    acc_scalar = writer.scalar("acc")

num_samples = 4
with logwriter.mode("train") as writer:
    conv_image = writer.image("conv_image", num_samples, 1)
    input_image = writer.image("input_image", num_samples, 1)

with logwriter.mode("train") as writer:
    param1_histgram = writer.histogram("param1", 100)


def resnet_cifar10(input, depth=32):
    def conv_bn_layer(input, ch_out, filter_size, stride, padding, act='relu'):
        tmp = fluid.layers.conv2d(
            input=input,
            filter_size=filter_size,
            num_filters=ch_out,
            stride=stride,
            padding=padding,
            act=None,
            bias_attr=False)
        return fluid.layers.batch_norm(input=tmp, act=act)

    def shortcut(input, ch_in, ch_out, stride):
        if ch_in != ch_out:
            return conv_bn_layer(input, ch_out, 1, stride, 0, None)
        else:
            return input

    def basicblock(input, ch_in, ch_out, stride):
        tmp = conv_bn_layer(input, ch_out, 3, stride, 1)
        tmp = conv_bn_layer(tmp, ch_out, 3, 1, 1, act=None)
        short = shortcut(input, ch_in, ch_out, stride)
        return fluid.layers.elementwise_add(x=tmp, y=short, act='relu')

    def layer_warp(block_func, input, ch_in, ch_out, count, stride):
        tmp = block_func(input, ch_in, ch_out, stride)
        for i in range(1, count):
            tmp = block_func(tmp, ch_out, ch_out, 1)
        return tmp

    assert (depth - 2) % 6 == 0
    n = (depth - 2) / 6
    conv1 = conv_bn_layer(
        input=input, ch_out=16, filter_size=3, stride=1, padding=1)
    res1 = layer_warp(basicblock, conv1, 16, 16, n, 1)
    res2 = layer_warp(basicblock, res1, 16, 32, n, 2)
    res3 = layer_warp(basicblock, res2, 32, 64, n, 2)
    pool = fluid.layers.pool2d(
        input=res3, pool_size=8, pool_type='avg', pool_stride=1)
    return pool


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

net_type = "vgg"
if len(sys.argv) >= 2:
    net_type = sys.argv[1]

if net_type == "vgg":
    print("train vgg net")
    net, conv1 = vgg16_bn_drop(images)
elif net_type == "resnet":
    print("train resnet")
    net = resnet_cifar10(images, 32)
else:
    raise ValueError("%s network is not supported" % net_type)

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

        if sample_num == 0:
            input_image.start_sampling()
            conv_image.start_sampling()

        idx1 = input_image.is_sample_taken()
        idx2 = conv_image.is_sample_taken()
        assert idx1 == idx2
        idx = idx1
        if idx != -1:
            image_data = data[0][0]
            input_image_data = np.transpose(
                image_data.reshape(data_shape), axes=[1, 2, 0])
            input_image.set_sample(idx, input_image_data.shape,
                                   input_image_data.flatten())

            conv_image_data = conv1_out[0][0]
            conv_image.set_sample(idx, conv_image_data.shape,
                                  conv_image_data.flatten())

            sample_num += 1
            if sample_num % num_samples == 0:
                input_image.finish_sampling()
                conv_image.finish_sampling()
                sample_num = 0

        loss_scalar.add_record(step, loss)
        acc_scalar.add_record(step, acc)
        param1_histgram.add_record(step, param1.flatten())

        print("loss:" + str(loss) + " acc:" + str(acc) + " pass_acc:" + str(
            pass_acc))
        step += 1
        # this model is slow, so if we can train two mini batch, we think it works properly.
        # exit(0)
exit(1)
