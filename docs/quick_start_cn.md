快速入门
===========

VisualDL 是一个面向深度学习任务的可视化工具，可用于训练和生成任务里相关信息的展示。
目前，VisualDL支持如下信息的可视化：

- scalar，趋势图，可用于训练测试误差的展示
- image, 图片的可视化，可用于卷积层或者其他参数的图形化展示
- histogram, 用于参数分布及变化趋势的展示
- graph，用于训练模型结构的可视化

VisualDL提供原生的Python和C++ SDK，可以支持多种深度学习平台。用户可以在特定深度学习平台上利用Python SDK进行简单配置来支持可视化，也可以利用 C++ SDK深入嵌入到平台底层。

## 一个简单的Scalar的Python使用示例
为了简单，我们先尝试使用Python SDK。

使用VisualDL的第一步是创建一个 `LogWriter` 来存储用于可视化的数据

```python
from VisualDL import LogWriter
from random import random

logw = LogWriter("./random_log", sync_cycle=30)
```

其中， 第一个参数指定存储数据的目录；第二个参数 `sync_cycle` 指定多少次写操作执行一次内存到磁盘的数据持久化。

模型训练会有不同的模式，比如训练、验证、测试等，这些对应到 VisualDL中就是 `mode`，可以用如下方式指定一个训练模式

```python
with logw.mode("train") as logger:
    pass
```

接着是创建一个 `Scalar` 组件，每个组件需要一个tag，tag可以是任何长度的字符串，比如 `layer/classification/error`。

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

上述例子生成了一段随机日志，接下来可以打开board页面：

```
visualDL --logdir ./random_log --port 8080
```

之后用浏览器打开地址 `http://0.0.0.0:8080`，就可以看到scalar下的可视化结果

<p align="center">
<img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/images/scratch_scalar.png"/>
</p>

## scalar的C++ 示例
VisualDL 的 C++ SDK 与 Python 的基本一致，上面Python示例对应的C++代码如下

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

## 基于 ONNX 的模型结构可视化
VisualDL 支持开源的 [ONNX](https://github.com/onnx/onnx)模型结构的可视化，目前ONNX支持包括 `pytorch`, `Caffe2`, `Caffe`, `MxNet` 在内的多种深度学习平台的模型结构的转化。

```
visualDL --logdir somedir --model_pb <path_to_model>
```

比如mnist，会得到如下graph

<p align=center>
    <img width="70%" src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/demo/mxnet/mxnet_graph.gif" />
</p>

请参阅 [ONNX教程](https://github.com/onnx/tutorials)如何出口ONNX格式模型。

VisualDL的图形系统采用` GraphViz `来可视化ONNX格式模型。
请安装 [GraphViz](https://www.graphviz.org/download/)确保VisualDL图形系统可以启动
