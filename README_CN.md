 [**English**](./README.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/frontend/packages/core/public/images/logo-visualdl.svg?sanitize=true" width="70%"/>
</p>



<p align="center">
<a href="https://actions-badge.atrox.dev/PaddlePaddle/VisualDL/goto?ref=develop"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FPaddlePaddle%2FVisualDL%2Fbadge%3Fref%3Ddevelop&style=flat-square" alt="Build Status" /></a>
<a href="https://pypi.org/project/visualdl/"><img src="https://img.shields.io/pypi/v/visualdl?style=flat-square" alt="PyPI" /></a>
<a href="https://pypi.org/project/visualdl/#files"><img src="https://img.shields.io/pypi/dm/visualdl?style=flat-square" alt="Downloads" /></a>
<a href="https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE"><img src="https://img.shields.io/github/license/paddlepaddle/visualdl?style=flat-square" alt="License" /></a>
</p>


<p align="center">
<a href="https://jq.qq.com/?_wv=1027&k=TyzyVT4C" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/QQ_Group-1045783368-52B6EF?style=social&logo=tencent-qq&logoColor=000&logoWidth=20" alt="QQ Group" /></a>
</p>


## 介绍

VisualDL是飞桨可视化分析工具，以丰富的图表呈现训练参数变化趋势、模型结构、数据样本、高维数据分布等。可帮助用户更清晰直观地理解深度学习模型训练过程及模型结构，进而实现高效的模型优化。

VisualDL提供丰富的可视化功能，**支持标量、图结构、数据样本（图像、语音、文本）、超参数可视化、直方图、PR曲线、ROC曲线及高维数据降维呈现等诸多功能**，同时VisualDL提供可视化结果保存服务，通过VDL.service生成链接，保存并分享可视化结果。具体功能使用方式，请参见 [**VisualDL使用指南**](./docs/components/README_CN.md)。如欲体验最新特性，欢迎试用我们的[**在线演示系统**](https://www.paddlepaddle.org.cn/paddle/visualdl/demo)。项目正处于高速迭代中，敬请期待新组件的加入。

VisualDL支持浏览器：

- Google Chrome ≥ 79
- Firefox ≥ 67
- Microsoft Edge ≥ 79
- Safari ≥ 11.1

VisualDL原生支持Python的使用， 通过在模型的Python配置中添加几行代码，便可为训练过程提供丰富的可视化支持。


## 目录

* [核心亮点](#核心亮点)

* [安装方式](#安装方式)

* [使用方式](#使用方式)

* [可视化功能概览](#可视化功能概览)

* [开源贡献](#开源贡献)

* [常见问题](#常见问题)

* [更多细节](#更多细节)

## 核心亮点

### 简单易用

API设计简洁易懂，使用简单。模型结构一键实现可视化。

### 功能丰富

功能覆盖标量、数据样本、图结构、直方图、PR曲线及数据降维可视化。

### 高兼容性

全面支持Paddle、ONNX、Caffe等市面主流模型结构可视化，广泛支持各类用户进行可视化分析。

### 全面支持

与飞桨服务平台及工具组件全面打通，为您在飞桨生态系统中提供最佳使用体验。



## 安装方式

### 使用pip安装

```shell
python -m pip install visualdl -i https://mirror.baidu.com/pypi/simple
```

### 使用代码安装

```
git clone https://github.com/PaddlePaddle/VisualDL.git
cd VisualDL

python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```

需要注意，官方自2020年1月1日起不再维护Python2，为了保障代码可用性，VisualDL现仅支持Python3

## 使用方式

VisualDL将训练过程中的数据、参数等信息储存至日志文件中后，启动面板即可查看可视化结果。

### 1. 记录日志

VisualDL的后端提供了Python SDK，可通过LogWriter定制一个日志记录器，接口如下：

```python
class LogWriter(logdir=None,
                max_queue=10,
                flush_secs=120,
                filename_suffix='',
                display_name='',
                file_name='',
                **kwargs)
```

#### 接口参数

| 参数            | 格式    | 含义                                                         |
| --------------- | ------- | ------------------------------------------------------------ |
| logdir          | string  | 日志文件所在的路径，VisualDL将在此路径下建立日志文件并进行记录，如果不填则默认为`runs/${CURRENT_TIME}` |
| max_queue       | int     | 日志记录消息队列的最大容量，达到此容量则立即写入到日志文件   |
| flush_secs      | int     | 日志记录消息队列的最大缓存时间，达到此时间则立即写入到日志文件（日志消息队列到达最大缓存时间或最大容量，都会立即写入日志文件） |
| filename_suffix | string  | 为默认的日志文件名添加后缀                                   |
| display_name    | string  | 指定面板启动后显示的路径，如不指定此项则显示日志所在的实际路径，当日志所在路径过长或想隐藏日志所在路径时可指定此参数 |
| file_name       | string  | 指定写入的日志文件名，如果指定的文件名已经存在，则将日志续写在此文件中，因此可通过此参数实现日志续写的功能，文件名必须包括`vdlrecords` |

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/103187556-b9714280-48ff-11eb-9052-008e02a21199.png" width="100%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/103187552-b4ac8e80-48ff-11eb-998a-57d5a1bc7ee6.png" width="100%"/>
</p>

#### 示例

设置日志文件并记录标量数据：

```python
from visualdl import LogWriter

# 在`./log/scalar_test/train`路径下建立日志文件
with LogWriter(logdir="./log/scalar_test/train") as writer:
    # 使用scalar组件记录一个标量数据,将要记录的所有数据都记录在该writer中
    writer.add_scalar(tag="acc", step=1, value=0.5678)
    writer.add_scalar(tag="acc", step=2, value=0.6878)
    writer.add_scalar(tag="acc", step=3, value=0.9878)
# 如果不想使用上下文管理器`with`，可拆解为以下几步完成：
"""
writer = LogWriter(logdir="./log/scalar_test/train")

writer.add_scalar(tag="acc", step=1, value=0.5678)
writer.add_scalar(tag="acc", step=2, value=0.6878)
writer.add_scalar(tag="acc", step=3, value=0.9878)

writer.close()
"""
```
注：调用LogWriter(logdir="./log/scalar_test/train")将会在./log/scalar_test/train目录下生成一个日志文件，
运行一次程序所产生的训练数据应该只记录到一个日志文件中，因此应该只调用一次LogWriter，用返回的LogWriter对象来记录所有数据，
而不是每记录一个数据就创建一次LogWriter。

<font color=#FF0000>如下是错误示范</font>：
```python
from visualdl import LogWriter
with LogWriter(logdir="./log/scalar_test/train") as writer:  # 将会创建日志文件vdlrecords.xxxx1.log
    writer.add_scalar(tag="acc", step=1, value=0.5678)  # 数据写入./log/scalar_test/train/vdlrecords.xxxx1.log
with LogWriter(logdir="./log/scalar_test/train") as writer:  # 将会创建日志文件vdlrecords.xxxx2.log
    writer.add_scalar(tag="acc", step=2, value=0.6878)  # 数据将会写入./log/scalar_test/train/vdlrecords.xxxx2.log
```

### 2. 启动面板

在上述示例中，日志已记录三组标量数据，现可启动VisualDL面板查看日志的可视化结果，共有两种启动方式：

#### 在命令行启动

使用命令行启动VisualDL面板，命令格式如下：

```python
visualdl --logdir <dir_1, dir_2, ... , dir_n> --model <model_file> --host <host> --port <port> --cache-timeout <cache_timeout> --language <language> --public-path <public_path> --api-only
```

参数详情：

| 参数            | 意义                                                         |
| --------------- | ------------------------------------------------------------ |
| --logdir        | 设定日志所在目录，可以指定多个目录，VisualDL将遍历并且迭代寻找指定目录的子目录，将所有实验结果进行可视化 |
| --model         | 设定模型文件路径(非文件夹路径)，VisualDL将在此路径指定的模型文件进行可视化，目前可支持PaddlePaddle、ONNX、Keras、Core ML、Caffe等多种模型结构，详情可查看[graph支持模型种类](./docs/components/README_CN.md#功能操作说明-4) |
| --host          | 设定IP，默认为`127.0.0.1`，若想使得本机以外的机器访问启动的VisualDL面板，需指定此项为`0.0.0.0`或自己的公网IP地址                                    |
| --port          | 设定端口，默认为`8040`                                       |
| --cache-timeout | 后端缓存时间，在缓存时间内前端多次请求同一url，返回的数据从缓存中获取，默认为20秒 |
| --language      | VisualDL面板语言，可指定为'en'或'zh'，默认为浏览器使用语言   |
| --public-path   | VisualDL面板URL路径，默认是'/app'，即访问地址为'http://&lt;host&gt;:&lt;port&gt;/app' |
| --api-only      | 是否只提供API，如果设置此参数，则VisualDL不提供页面展示，只提供API服务，此时API地址为'http://&lt;host&gt;:&lt;port&gt;/&lt;public_path&gt;/api'；若没有设置public_path参数，则默认为'http://&lt;host&gt;:&lt;port&gt;/api' |

针对上一步生成的日志，启动命令为：

```
visualdl --logdir ./log
```

#### 在Python脚本中启动

支持在Python脚本中启动VisualDL面板，接口如下：

```python
visualdl.server.app.run(logdir,
                        model="path/to/model",
                        host="127.0.0.1",
                        port=8080,
                        cache_timeout=20,
                        language=None,
                        public_path=None,
                        api_only=False,
                        open_browser=False)
```

请注意：除`logdir`外，其他参数均为不定参数，传递时请指明参数名。

接口参数具体如下：

| 参数          | 格式                                             | 含义                                                         |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| logdir        | string或list[string_1, string_2, ... , string_n] | 日志文件所在的路径，VisualDL将在此路径下递归搜索日志文件并进行可视化，可指定单个或多个路径，每个路径中及其子目录中的日志都将视为独立日志展现在前端面板上 |
| model         | string                                           | 模型文件路径(非文件夹路径)，VisualDL将在此路径指定的模型文件进行可视化，目前可支持PaddlePaddle、ONNX、Keras、Core ML、Caffe等多种模型结构，详情可查看[graph支持模型种类](./docs/components/README_CN.md#功能操作说明-4) |
| host          | string                                           | 设定IP，默认为`127.0.0.1`，若想使得本机以外的机器访问启动的VisualDL面板，需指定此项为`0.0.0.0`或自己的公网IP地址                       |
| port          | int                                              | 启动服务端口，默认为`8040`                                   |
| cache_timeout | int                                              | 后端缓存时间，在缓存时间内前端多次请求同一url，返回的数据从缓存中获取，默认为20秒 |
| language      | string                                           | VisualDL面板语言，可指定为'en'或'zh'，默认为浏览器使用语言   |
| public_path   | string                                           | VisualDL面板URL路径，默认是'/app'，即访问地址为'http://&lt;host&gt;:&lt;port&gt;/app' |
| api_only      | boolean                                          | 是否只提供API，如果设置此参数，则VisualDL不提供页面展示，只提供API服务，此时API地址为'http://&lt;host&gt;:&lt;port&gt;/&lt;public_path&gt;/api'；若没有设置public_path参数，则默认为'http://&lt;host&gt;:&lt;port&gt;/api' |
| open_browser  | boolean                                          | 是否打开浏览器，设置为True则在启动后自动打开浏览器并访问VisualDL面板，若设置api_only，则忽略此参数 |

针对上一步生成的日志，我们的启动脚本为：

```python
from visualdl.server import app

app.run(logdir="./log")
```

在使用任意一种方式启动VisualDL面板后，打开浏览器访问VisualDL面板，即可查看日志的可视化结果，如图：

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/82786044-67ae9880-9e96-11ea-8a2b-3a0951a6ec19.png" width="60%"/>
</p>


### 3. 使用LogReader获取日志中的数据

VisualDL的后端也提供了获取日志数据的组件`LogReader`，可通过其获取日志中任意数据，接口如下：

```python
class LogReader(file_path='')
```

#### 接口参数

| 参数            | 格式    | 含义                                                         |
| --------------- | ------- | ------------------------------------------------------------ |
| file_path       | string  | 指定要读的日志文件路径，必填，注意这里与file_name不同，需填写具体路径|

#### 示例

假定在`./log`文件夹下有一个日志文件`vdlrecords.1605533348.log`，则获取LogReader实例如下：

```python
from visualdl import LogReader

reader = LogReader(file_path='./log/vdlrecords.1605533348.log')
data = reader.get_data('scalar', 'loss')
print(data)
```

结果为列表形式，如下

```python
...
id: 5
tag: "Metrics/Training(Step): loss"
timestamp: 1605533356039
value: 3.1297709941864014
...
```

关于LogReader的更多具体用法，可参考[LogReader](./docs/io/LogReader.md)。

## 可视化功能概览

### Scalar

以图表形式实时展示训练过程参数，如loss、accuracy。让用户通过观察单组或多组训练参数变化，了解训练过程，加速模型调优。具有两大特点：

#### 动态展示

在启动VisualDL Board后，LogReader将不断增量的读取日志中数据并供前端调用展示，因此能够在训练中同步观测指标变化，如下图：

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/dynamic_display.gif" width="60%"/>
</p>



#### 多实验对比

只需在启动VisualDL Board的时将每个实验日志所在路径同时传入即可，每个实验中相同tag的指标将绘制在一张图中同步呈现，如下图：

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/multi_experiments.gif" width="100%"/>
</p>



### Image

实时展示训练过程中的图像数据，用于观察不同训练阶段的图像变化，进而深入了解训练过程及效果。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/90356439-24715980-e082-11ea-8896-01c27fc2fc9b.gif" width="85%"/>
</p>


### Audio

实时查看训练过程中的音频数据，监控语音识别与合成等任务的训练过程。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/87659138-b4746880-c78f-11ea-965b-c33804e7c296.png" width="85%"/>
</p>


### Text
展示文本任务任意阶段的数据输出，对比不同阶段的文本变化，便于深入了解训练过程及效果。

<p align="center">
<img src="https://user-images.githubusercontent.com/28444161/106248340-cdd09400-624b-11eb-8ea9-5a07a239c365.png" width="85%"/>
</p>


### Graph

一键可视化模型的网络结构。可查看模型属性、节点信息、节点输入输出等，并支持节点搜索，辅助用户快速分析模型结构与了解数据流向，覆盖动态图与静态图两种格式。
- 动态图

<p align="center">
<img src="https://user-images.githubusercontent.com/22424850/175770313-2509f7e9-041a-4654-9a0f-45f4bd76e1e8.gif" width="85%"/>
</p>

- 静态图

<p align="center">
<img src="https://user-images.githubusercontent.com/22424850/175770315-11e2c3f5-141c-4f05-be86-0e1e2785e11f.gif" width="85%"/>
</p>

### Histogram

以直方图形式展示Tensor（weight、bias、gradient等）数据在训练过程中的变化趋势。深入了解模型各层效果，帮助开发者精准调整模型结构。

- Offset模式

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/86551031-86647c80-bf76-11ea-8ec2-8c86826c8137.png" width="85%"/>
</p>


- Overlay模式

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/86551033-882e4000-bf76-11ea-8e6a-af954c662ced.png" width="85%"/>
</p>


### PR Curve

精度-召回率曲线，帮助开发者权衡模型精度和召回率之间的平衡，设定最佳阈值。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/86738774-ee46c000-c067-11ea-90d2-a98aac445cca.png" width="85%"/>
</p>

### ROC Curve

展示不同阈值下模型指标的变化，同时曲线下的面积（AUC）直观的反应模型表现，辅助开发者掌握模型训练情况并高效进行阈值选择。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/103344081-8928d000-4ac8-11eb-84d0-28f249886172.gif" width="85%"/>
</p>

### High Dimensional

将高维数据进行降维展示，目前支持T-SNE、PCA、UMAP三种降维方式，用于深入分析高维数据间的关系，方便用户根据数据特征进行算法优化。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/103188111-1b32ac00-4902-11eb-914e-c2368bdb8373.gif" width="85%"/>
</p>


### Hyper Parameters

以丰富的视图多角度地可视化超参数与模型关键指标间的关系，便于快速确定最佳超参组合，实现高效调参。

<p align="center">
<img src="https://user-images.githubusercontent.com/28444161/119247155-e9c0c280-bbb9-11eb-8175-58a9c7657a9c.gif" width="85%"/>
</p>

### Profiler
通过多个视图可视化性能分析的数据，辅助用户定位性能瓶颈并进行优化。可参考[使用VisualDL做性能分析](./profiler/README_CN.md)。
<p align="center">
<img src="https://user-images.githubusercontent.com/22424850/185893177-a049c8d5-2310-4138-8dd5-844cf198e425.gif" width="85%"/>
</p>


### VDL.service

VisualDL可视化结果保存服务，以链接形式将可视化结果保存下来，方便用户快速、便捷的进行托管与分享。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/93729521-72382f00-fbf7-11ea-91ff-6b6ab4b41e32.png" width="85%"/>
</p>


## 常见问题

在使用VisualDL的过程中可能遇到的一些问题，可参考[常见问题](./docs/faq_CN.md)帮助解决

## 近期活动更新

- 2020.12.22 

  《手拆朋友圈斗图利器—『圣诞写真生成器』》b站直播中奖用户名单请点击[圣诞直播中奖名单](./docs/luckydraw.md)查看~

## 开源贡献

VisualDL 是由 [PaddlePaddle](https://www.paddlepaddle.org/) 和 [ECharts](https://echarts.apache.org/) 合作推出的开源项目。
Graph 相关功能由 [Netron](https://github.com/lutzroeder/netron) 提供技术支持。
欢迎所有人使用，提意见以及贡献代码。


## 更多细节

想了解更多关于VisualDL可视化功能的使用详情介绍，请查看[**VisualDL使用指南**](./docs/components/README_CN.md)。

## 技术交流

欢迎您加入VisualDL官方QQ群：1045783368 与飞桨团队以及其他用户共同针对VisualDL进行讨论与交流。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/82522691-c2758680-9b5c-11ea-9aee-fca994aba175.png" width="20%"/>
</p>
