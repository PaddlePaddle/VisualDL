# 在MXNet中使用VisualDL

下面我们演示一下如何在MXNet中使用VisualDL，从而可以把MXNet的训练过程以及最后的模型可视化出来。我们将以MXNet用卷积神经网络(CNN, Convolutional Neural Network)来训练[MNIST](http://yann.lecun.com/exdb/mnist/)数据集作为例子。

- [安装MXNet](#%E5%AE%89%E8%A3%85mxnet)
- [安装VisualDL](#%E5%AE%89%E8%A3%85visualdl)
- [开始编写训练MNIST的程序](#%E5%BC%80%E5%A7%8B%E7%BC%96%E5%86%99%E8%AE%AD%E7%BB%83mnist%E7%9A%84%E7%A8%8B%E5%BA%8F)
- [用VisualDL展示模型图](#%E7%94%A8visualdl%E5%B1%95%E7%A4%BA%E6%A8%A1%E5%9E%8B%E5%9B%BE)


## 安装MXNet
请按照MXNet的[官方网站](https://mxnet.incubator.apache.org/install/index.html)来安装MXNet，并验证安装成功。


    >>> import mxnet as mx
    >>> a = mx.nd.ones((2, 3))
    >>> b = a * 2 + 1
    >>> b.asnumpy()
    array([[ 3.,  3.,  3.],
           [ 3.,  3.,  3.]], dtype=float32)

## 安装VisualDL
VisualDL的安装很简单。请按照VisualDL的[官方网站](https://github.com/PaddlePaddle/VisualDL)进行安装。具体只需要两步

```
python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```

## 开始编写训练MNIST的程序

我们为您提供了一个演示程序 [mxnet_demo.py](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/mxnet_demo.py)。里面展示了如何下载MNIST数据集以及编写MXNet程序来进行CNN的训练。MXNet的部分借鉴了MXNet[官方入门文件](https://mxnet.incubator.apache.org/tutorials/python/mnist.html)
为了嵌入VisualDL程序，以便在MXNet训练时进行检测，我们需要声明一个LogWriter实例：

```python
logger = LogWriter(logdir, sync_cycle=30)
```

logger实例里面包含VisualDL的四个功能模块 Scalar， Image 以及 Histogram。这里我们使用 Scalar 模块：

```python
scalar0 = logger.scalar("scalars/scalar0")
```

模块的命名可以有 '/', 以便对于复杂模型创建不同的命名空间。

MXNet在fit函数中提供了很多[API](https://mxnet.incubator.apache.org/api/python/index.html)。我们把自己编写好的回调函数 add_scalar 插入到相应的 API中

```python
lenet_model.fit(train_iter,
                eval_data=val_iter,
                optimizer='sgd',
                optimizer_params={'learning_rate':0.1},
                eval_metric='acc',
                # 在此嵌入我们自定义的回调函数
                batch_end_callback=[add_scalar()],
                num_epoch=2)
```

这样就好了。在MXNet的训练过程中，每一个批次（batch）训练完后，都会调用我们的回调函数来对准确率进行记录。如您所料，随着训练的进行，准确率会不断上升直到95%以上。以下是两个epoch训练过后的准确率走向：

<p align=center><img width="50%" src="https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/epoch2_small.png?raw=true" /></p>

## 用VisualDL展示模型图

VisualDL的一个优点是能可视化深度学习模型，帮助用户更直观的了解模型的构成，都有哪些操作，哪些输入等等。VisualDL的模型图支持原生态的PaddlePaddle格式以及普遍适用的ONNX格式。在这里用户可以使用MXNet训练模型，然后用 [ONNX-MXNet](https://github.com/onnx/onnx-mxnet) 工具将其转换成 ONNX 格式，然后进行可视化。
我们这里使用已经从MXNet转换到ONNX的现成模型 [Super_Resolution model](https://s3.amazonaws.com/onnx-mxnet/examples/super_resolution.onnx)

VisualDL的使用很简单，在完成安装后只需要把模型文件（protobuf格式）用参数 -m 提供给VisualDL即可。

```bash
visualDL --logdir=/workspace -m /workspace/super_resolution_mnist.onnx --port=8888
```

模型图的效果如下：

<p align=center><img width="70%" src="https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/mxnet_graph.gif?raw=true" /></p>

生成的完整效果图可以在[这里](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/mxnet/super_resolution_graph.png)下载。
