Quick start
===========

VisualDL is a deep learning visualization tool. It can be used to visualize intermediate and final results for training.
Currently, VisualDL supports visualization features as follows:

- Scalar: plot of trends, can be used to show error trends during training.
- Image: image visualization, can be used to show intermediate images from CNN.
- Histogram: can be used to show parameter distribution and trend.
- Graph: can be used to visualize model structure.

VisualDL provides both Python SDK and C++ SDK in nature. It can support various frameworks.
Users can retrieve visualization data by simply adding a few lines of code using Pythong SDK.
In addition, users can also have a deep integration by using the C++ SDK at a lower level.

## A Simple Python Demo on Scalar
For simplicity, we first try to use Python SDK.

The first step of using VisualDL is to create a `LogWriter' that can store visualization data.


```python
from VisualDL import LogWriter
from random import random

logw = LogWriter("./random_log", sync_cycle=30)
```

The first parameter points to a folder; the second parameter `sync_cycle` specifies out of how memory operations should be
store the data into hard drive.

There are different modes for model training, such as training, validating and testing. All these correspond to `mode' in VisualDL.
We can use the following pattern to specify mode:


```python
with logw.mode("train") as logger:
    pass
```

Next we create a `Scalar` component. Each component needs a tag. A tag can be a string of any length.
For example, `layer/classification/error`.

```python
# create scalars in mode train and test.
with logw.mode('train') as logger:
    scalar0 = logger.scalar("scratch/scalar")

with logw.mode('test') as logger:
    scalar1 = logger.scalar("scratch/scalar")

# add scalar records.
for step in range(200):
    scalar0.add_record(step, step * 1. / 200)
    scalar1.add_record(step, 1. - step * 1. / 200)
```

The example above randomly generated some logs. Next we can open the board page:

```
visualDL --logdir ./random_log --port 8080
```

Point your browser to `http://0.0.0.0:8080`, you can see the scalar as follows:

<p align="center">
<img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/images/scratch_scalar.png"/>
</p>

## Scalar Demo in C++
VisualDL's C++ SDK is very similar to its Python SDK. The Python demo above can be writen in C++ as follows:

```c++
  const auto dir = "./randomlog";
  LogWriter logwriter(dir, 30);
  auto logger = logwriter.AsMode("train");

  components::Scalar<float> scalar0(writer.AddTablet("scalar0"));
  components::Scalar<float> scalar1(writer.AddTablet("scalar1"));

  for (int step = 0; step < 200; step++) {
    scalar0.AddRecord(step, step * 1. / 200);
    scalar1.AddRecord(step, 1. - step * 1. / 200);
  }
```

## Visualization Based on ONNX Model Structure
VisualDL supports the visualization for the format in [ONNX](https://github.com/onnx/onnx).
Currently, ONNX supports format conversion among various deep learning frameworks such as `MXNet`, `PyTorch`, `Caffe2`, `Caffe`.

```
visualDL --logdir somedir --model_pb <path_to_model>
```

For example, for the MNIST dataset, Graph component can render model graph as below:

<p align=center>
<img width="70%" src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/demo/mxnet/mxnet_graph.gif" />
</p>

Please consult [ONNX tutorials](https://github.com/onnx/tutorials) on how to export the ONNX format model.

The VisualDL Graphing system uses `GraphViz` to visualize the ONNX model. To enable the VisualDL Graph feature,
please install [GraphViz](https://www.graphviz.org/download/).
