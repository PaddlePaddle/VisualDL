# How to use VisualDL in MXNet

Here we will show you how to use VisualDL in MXNet so that you can visualize the training process of MXNet.
We will use the MXNet Convolution Neural Network to train the [MNIST](http://yann.lecun.com/exdb/mnist/) dataset as an example.

## Install MXNet
Please install MXNet according to MXNet's [official website](https://mxnet.incubator.apache.org/install/index.html)
and verify that the installation is successful.

    >>> import mxnet as mx
    >>> a = mx.nd.ones((2, 3))
    >>> b = a * 2 + 1
    >>> b.asnumpy()
    array([[ 3.,  3.,  3.],
           [ 3.,  3.,  3.]], dtype=float32)

## Install VisualDL
The installation of VisualDL is very simple. Please install it according to the [official website](https://github.com/PaddlePaddle/VisualDL) of VisualDL.
Only two steps are required.

```
python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```

## Start writing the program for training MNIST

We have provided you with a demonstration program [mxnet_demo.py](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/mxnet_demo.py).
It shows how to download MNIST data sets and write a MXNet programs for CNN training.
The training program is based on the [MXNet tutorial](https://mxnet.incubator.apache.org/tutorials/python/mnist.html)

We need to create a VisualDL LogWriter instance to record MXNet training:

```python
logger = LogWriter(logdir, sync_cycle=30)
```

The logger instance contains three modules, Scalar, Image, and Histogram. Here we use the Scalar module:

```python
scalar0 = logger.scalar("scalars/scalar0")
```

The Tag can contain '/' in order to create a different namespace for complex model.

MXNet provides a lot of [API](https://mxnet.incubator.apache.org/api/python/index.html) in the fit function.
We insert our callback function `add_scalar` into the corresponding API

```python
lenet_model.fit(train_iter,
                eval_data=val_iter,
                optimizer='sgd',
                optimizer_params={'learning_rate':0.1},
                eval_metric='acc',
                # Here we embed our custom callback function
                batch_end_callback=[add_scalar()],
                num_epoch=2)
```

That's all. In the training process of MXNet, our callback function is called to record the accuracy at the end of each training batch.
The rate of accuracy will continue to rise until more than 95%.
The following is the accuracy of the two epochs:

<p align=center><img width="50%" src="https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/epoch2_small.png?raw=true" /></p>

## Display the model graph with VisualDL

VisualDL helps users understand the composition of the model more intuitively by visualizing deep learning models.
VisualDL can visualize ONNX format models, which is widely supported.
Users may use MXNet to train the model, then convert it into ONNX format with [ONNX-MXNet](https://github.com/onnx/onnx-mxnet) tool, and then visualize it.

Here we use the existing model that has been transformed from MXNet to ONNX, [Super_Resolution model](https://s3.amazonaws.com/onnx-mxnet/examples/super_resolution.onnx).

To display the model graph via VisualDL, pass the model file path with the parameter -m to the VisualDL

```bash
visualDL --logdir=/workspace -m /workspace/super_resolution_mnist.onnx --port=8888
```

The model graph is as follows:

<p align=center><img width="70%" src="https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/mxnet_graph.gif?raw=true" /></p>

You can download the full size image [here](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/super_resolution_graph.png).
