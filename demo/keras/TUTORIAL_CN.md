# 如何在Keras中使用VisualDL

下面我们演示一下如何在Keras中使用VisualDL，从而可以把Keras的训练过程可视化出来。我们将以Keras用卷积神经网络(CNN, Convolutional Neural Network)来训练
[MNIST](http://yann.lecun.com/exdb/mnist/) 数据集作为例子。


程序的主体来自Keras的官方GitHub [Example](https://github.com/keras-team/keras/blob/master/examples/mnist_cnn.py)。

我们只需要在代码里面创建 VisualDL 的数据采集 loggers

```python
# create VisualDL logger
logdir = "/workspace"
logger = LogWriter(logdir, sync_cycle=100)

# mark the components with 'train' label.
with logger.mode("train"):
    # create a scalar component called 'scalars/'
    scalar_keras_train_loss = logger.scalar(
        "scalars/scalar_keras_train_loss")
    image_input = logger.image("images/input", 1)
    image0 = logger.image("images/image0", 1)
    image1 = logger.image("images/image1", 1)
    histogram0 = logger.histogram("histogram/histogram0", num_buckets=50)
    histogram1 = logger.histogram("histogram/histogram1", num_buckets=50)

```

然后在Keras提供的回调函数（callback）中插入我们的数据采集代码就可以了。

```python
train_step = 0

class LossHistory(keras.callbacks.Callback):
    def on_train_begin(self, logs={}):
        self.losses = []

    def on_batch_end(self, batch, logs={}):
        global train_step

        # Scalar
        scalar_keras_train_loss.add_record(train_step, logs.get('loss'))

        # get weights for 2 layers
        W0 = model.layers[0].get_weights()[0] # 3 x 3 x 1 x 32
        W1 = model.layers[1].get_weights()[0] # 3 x 3 x 32 x 64

        weight_array0 = W0.flatten()
        weight_array1 = W1.flatten()

        # histogram
        histogram0.add_record(train_step, weight_array0)
        histogram1.add_record(train_step, weight_array1)

        # image
        image_input.start_sampling()
        image_input.add_sample([28, 28], x_train[0].flatten())
        image_input.finish_sampling()

        image0.start_sampling()
        image0.add_sample([9, 32], weight_array0)
        image0.finish_sampling()

        image1.start_sampling()
        image1.add_sample([288, 64], weight_array1)
        image1.finish_sampling()

        train_step += 1
        self.losses.append(logs.get('loss'))
```

训练结束后，各个组件的可视化结果如下：

关于误差的数值图的如下：

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/keras_demo_figs/keras_scalar.png?raw=true" />
</p>

输入图片以及训练过后的第一，第二层卷积权重图的如下：

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/keras_demo_figs/keras_image.png?raw=true" />
</p>


训练参数的柱状图的如下：

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/keras_demo_figs/keras_histogram.png?raw=true" />
</p>



完整的演示程序可以在[这里](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/keras/keras_mnist_demo.py)下载。
