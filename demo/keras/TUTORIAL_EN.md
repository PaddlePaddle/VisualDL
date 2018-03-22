# How to use VisualDL in Keras

Here we will show you how to use VisualDL with Keras so that you can visualize the training process of Keras.
We will use the Keras Convolution Neural Network to train the [MNIST](http://yann.lecun.com/exdb/mnist/) dataset as an example.

The training program comes from the official GitHub [Example](https://github.com/keras-team/keras/blob/master/examples/mnist_cnn.py) of Keras.
We just need to create the VisualDL data collection loggers in the code

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

Then we can insert our data loggers in the callback function provided by Keras.

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

After the training, the visual results of each component are as follows:

The scalar diagram of the error is as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/keras_demo_figs/keras_scalar.png?raw=true" />
</p>

The input picture and the first, second layer convolution weight after the training are as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/keras_demo_figs/keras_image.png?raw=true" />
</p>

The histograms of the training parameters is as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/keras_demo_figs/keras_histogram.png?raw=true" />
</p>

The full demonstration code can be downloaded in [here](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/keras/keras_mnist_demo.py).
