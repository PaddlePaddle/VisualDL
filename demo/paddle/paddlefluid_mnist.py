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

import paddle
import paddle.fluid as fluid
from visualdl import LogWriter


# define a LeNet-5 nn
def lenet_5(img, label):
    conv1 = fluid.nets.simple_img_conv_pool(
        input=img,
        filter_size=5,
        num_filters=20,
        pool_size=2,
        pool_stride=2,
        act="relu")

    conv1_bn = fluid.layers.batch_norm(input=conv1)

    conv2 = fluid.nets.simple_img_conv_pool(
        input=conv1_bn,
        filter_size=5,
        num_filters=50,
        pool_size=2,
        pool_stride=2,
        act="relu")

    predition = fluid.layers.fc(input=conv2, size=10, act="softmax")

    cost = fluid.layers.cross_entropy(input=predition, label=label)
    avg_cost = fluid.layers.mean(cost)
    acc = fluid.layers.accuracy(input=predition, label=label)

    return avg_cost, acc


# train the nn
def train():
    img = fluid.layers.data(name="img", shape=[1, 28, 28], dtype="float32")
    label = fluid.layers.data(name="label", shape=[1], dtype="int64")
    avg_cost, acc = lenet_5(img, label)

    # get the mnist dataset
    train_reader = paddle.batch(paddle.dataset.mnist.train(), batch_size=64)

    # define the loss
    optimizer = fluid.optimizer.Adam(learning_rate=0.001)
    optimizer.minimize(avg_cost)

    # running on cpu
    place = fluid.CPUPlace()
    feeder = fluid.DataFeeder(feed_list=[img, label], place=place)
    exe = fluid.Executor(place)

    log_writter = LogWriter("./vdl_log", sync_cycle=10)
    with log_writter.mode("train") as logger:
        scalar_loss = logger.scalar(tag="loss")
        scalar_accuracy = logger.scalar(tag="accuracy")
        num_samples = 10
        image_input = logger.image(tag="input", num_samples=num_samples)
        histogram = logger.histogram(tag="histogram", num_buckets=50)

    # init all param
    exe.run(fluid.default_startup_program())
    step = 0
    sample_num = 0
    epochs = 5
    param_name = fluid.default_startup_program().global_block().all_parameters(
    )[0].name

    # start to train
    for i in range(epochs):
        for batch in train_reader():
            cost, accuracy, input, param = exe.run(
                feed=feeder.feed(batch),
                fetch_list=[avg_cost.name, acc.name, img.name, param_name])
            step += 1

            # record the loss and accuracy
            scalar_loss.add_record(step, cost)
            scalar_accuracy.add_record(step, accuracy)

            if sample_num % num_samples == 0:
                image_input.start_sampling()

            idx = image_input.is_sample_taken()

            if idx != -1:
                # the first image in the batch data
                image_data = input[0]
                # the image shape recrod in VDL is H * W * C
                image_data = image_data.reshape([28, 28, 1])
                image_input.set_sample(idx, image_data.shape,
                                       100 * image_data.flatten())
                sample_num += 1
                if sample_num % num_samples == 0:
                    image_input.finish_sampling()
                    sample_num = 0

            # record the parameter trend
            histogram.add_record(step, param.flatten())


if __name__ == "__main__":
    train()
