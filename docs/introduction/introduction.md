## Visual DL
`Visual DL`：让你的深度学习任务变得生动形象，可视化起来。

目前大部分深度学习框架都是基于Python语言，训练过程的状态通过日志的方式记录下来，类似下面这种：

```shell
loss:[2.532566] acc:[0.0859375] pass_acc:[0.0859375]
loss:[2.6916795] acc:[0.09375] pass_acc:[0.08984375]
loss:[2.7038598] acc:[0.1171875] pass_acc:[0.09895834]
loss:[2.6405232] acc:[0.125] pass_acc:[0.10546875]
```

这种方式可以短期看一下训练状态，但是很难从全局把握训练过程的一些变化趋势，提取的信息有限。

Visual DL 让你方便的将训练过程可视化起来，形成类似下面的图片：
<p align="center">
<img src="scalar.png"/>
</p>

上述只是Visual DL诸多功能中的一项，Visual DL有以下几方面的优点。

### 功能全
1. Scalar. 支持Scalar打点数据展示，如上图所示：
	- 可以将训练过程中的loss，准确率等信息以折现的形式体现出来，方便看出整体趋势。
	- 可以在同一个图片中画出多条曲线，方便对比分析。
2. Image. 支持图片展示。
	- 输入图片展示，方便查看数据样本的质量
	- 支持卷积层的结果展示，方便查看卷积之后的效果。
<p align="center">
<img src="dog.png" height="300" width="300"/>
</p>
	- 支持图像生成任务生成图片的预览。
<p align="center">
<img src="image-gan.png" height="300" width="300"/>
</p>

3. Histogram. 参数分布展示，方便查看参数矩阵中数值的分布曲线，以及随着训练的进行，参数数值分布的变化趋势。
	- 帮助用户理解训练过程，随着训练的进行，参数从一种分布变化到另外一种分布，背后对应的原因。
	- 方便用户判断训练是否正常，例如参数迅速变小到0或者迅速变大，说明有梯度消失或者梯度爆炸的问题。
<p align="center">
<img src="histogram.png" />
</p>

4. Graph. 方便查看深度神经网络的模型结构。
	- Graph支持直接对[ONNX](http://onnx.ai/)的模型进行预览，因为MXNet，Caffe2，Pytorch和CNTK都支持转成ONNX的模型，也就间接支持了这些框架的模型可视化功能。
	- 便于排查网络配置的错误
	- 帮助理解网络结构

<p align="center">
<img src="graph.png" height="250" width="400"/>
</p>

### 易集成
Visual DL提供独立的Python SDK，如果训练任务是基于Python的话，直接安装visualdl的whl包，import到自己项目中即可使用。

a. 安装visualdl包。

```shell
pip install visualdl
```
b. 在自己的Python代码中加入visualdl记日志的逻辑。

```python
import visualdl
```

### 易使用
a. 在自己的Python代码中加入visualdl记日志的逻辑。

```python
import visualdl

log_writer = LogWriter("./log", sync_cycle=30)
with log_writer.mode('train') as logger:
	loss_writer = logger.scalar("loss")

for step in steps:
	loss = train_process()
	loss_writer.add_record(step, loss)
```

b. 启动visualdl service即可通过浏览器查看日志的可视化结果。

```shell
visualDL --logdir ./log --port 8080
```

### 完全开放
Visual DL作为一个深度学习任务可视化工具，同时支持所有的深度学习框架。SDK层面可以方便的集成到Python或者C++项目中，Graph通过支持ONNX支持了PaddlePaddle、MxNet、PyTorch和Caffe2等流行的深度学习框架。

欢迎大家一起来改进，让工具变得更好用，提高大家的工作效率。
