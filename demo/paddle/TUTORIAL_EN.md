# How to use VisualDL in PaddlePaddle

Here we will show you how to use VisualDL with PaddlePaddle so that you can visualize the training process of PaddlePaddle.
We will use the Paddle Convolution Neural Network to train the [Cifar10](https://www.cs.toronto.edu/~kriz/cifar.html) dataset as an example.

This example is the modification with fluid PaddlePaddle's API from this official Paddle Book
[Example](https://github.com/PaddlePaddle/book/tree/develop/03.image_classification)

The full demonstration code can be downloaded in [here](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/paddle/paddle_cifar10.py).

The script is based on Paddle v2 0.11. You can do ```pip install paddlepaddle``` or ```docker pull paddlepaddle/paddle:0.11.0```. Notice Paddle does not support Python3 yet and protobuf version needs to be 3.5+.
If you encounter the error `TypeError: __init__() got an unexpected keyword argument 'file'`, that is due to protobuf version is not 3.5+，simply run `pip install --upgrade protobuf` will fix the issue.
For details, please follow Paddle's installation guide [here](http://paddlepaddle.org/docs/0.11.0/documentation/en/getstarted/build_and_install/index_en.html)


First we initialize Loggers for different types of record as follows:

```python
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
    conv_image = writer.image("conv_image", num_samples, 1) #show 4 samples for every 1 step
    input_image = writer.image("input_image", num_samples, 1)

with logwriter.mode("train") as writer:
    param1_histgram = writer.histogram("param1", 100) #100 buckets, e.g 100 data sets in a histograms

```

We use Paddle v2 Fluid APIs to define our VGG CNN model as follows:

```python
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
```

Then we start to train and use VisualDL to record data at the same time.


```python
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
```

After the training, launch VisualDL and here is the results.
The scalar diagram of the accuracy and loss is as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/paddle_demo_figs/paddle_scalar.png?raw=true" />
</p>

The 4 samples of input image and the convolution layer image after the training are as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/paddle_demo_figs/paddle_image.png?raw=true" />
</p>
