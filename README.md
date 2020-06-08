
<p align="center">
  <img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/frontend/packages/core/public/images/logo-visualdl.svg?sanitize=true" width="70%"/>
</p>

[![Build Status](https://img.shields.io/travis/PaddlePaddle/VisualDL/develop?style=flat-square)](https://travis-ci.org/PaddlePaddle/VisualDL)
[![Documentation Status](https://img.shields.io/badge/docs-latest-brightgreen.svg?style=flat-square)](https://github.com/PaddlePaddle/VisualDL/tree/develop/docs)
[![Release](https://img.shields.io/github/release/PaddlePaddle/VisualDL.svg?style=flat-square)](https://github.com/PaddlePaddle/VisualDL/releases)
[![License](https://img.shields.io/badge/license-Apache%202-blue.svg?style=flat-square)](LICENSE)

## 介绍
VisualDL是深度学习模型可视化分析工具，以丰富的图表呈现训练参数变化趋势、模型结构、数据样本、高维数据分布等。可帮助用户更清晰直观地理解深度学习模型训练过程及模型结构，进而实现高效的模型优化。

VisualDL提供丰富的可视化功能，支持实时训练参数分析、图结构、数据样本可视化及高维数据降维呈现等诸多功能。具体功能使用方式，请参见 [**VisualDL使用指南**](./docs/components/README.md)。项目正处于高速迭代中，敬请期待新组件的加入。

VisualDL原生支持python的使用， 通过在模型的Python配置中添加几行代码，便可为训练过程提供丰富的可视化支持。

## 目录

* [核心亮点](#核心亮点)

* [安装方式](#安装方式)

* [使用方式](#使用方式)

* [可视化功能概览](#可视化功能概览)

* [开源贡献](#开源贡献)

* [更多细节](#更多细节)



## 核心亮点

### 简单易用

API设计简洁易懂，使用简单。模型结构一键实现可视化。

### 功能丰富

功能覆盖训练参数、数据样本及数据降维可视化。

### 全面支持

与飞桨服务平台及工具组件全面打通，为您在飞桨生态系统中提供最佳使用体验。



## 安装方式

### 使用pip安装

```shell
pip install --upgrade visualdl==2.0.0b4
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
                comment='',
                max_queue=10,
                flush_secs=120,
                filename_suffix='',
                write_to_disk=True,
                **kwargs)
```

#### 接口参数

| 参数            | 格式    | 含义                                                         |
| --------------- | ------- | ------------------------------------------------------------ |
| logdir          | string  | 日志文件所在的路径，VisualDL将在此路径下建立日志文件并进行记录，如果不填则默认为`runs/${CURRENT_TIME}` |
| comment         | string  | 为日志文件夹名添加后缀，如果制定了logdir则此项无效           |
| max_queue       | int     | 日志记录消息队列的最大容量，达到此容量则立即写入到日志文件   |
| flush_secs      | int     | 日志记录消息队列的最大缓存时间，达到此时间则立即写入到日志文件 |
| filename_suffix | string  | 为默认的日志文件名添加后缀                                   |
| write_to_disk   | boolean | 是否写入到磁盘                                               |

#### 示例

设置日志文件并记录标量数据：

```python
from visualdl import LogWriter

# 在`./log/scalar_test/train`路径下建立日志文件
with LogWriter(logdir="./log/scalar_test/train") as writer:
    # 使用scalar组件记录一个标量数据
    writer.add_scalar(tag="acc", step=1, value=0.5678)
    writer.add_scalar(tag="acc", step=2, value=0.6878)
    writer.add_scalar(tag="acc", step=3, value=0.9878)
```

### 2. 启动面板

在上述示例中，日志已记录三组标量数据，现可启动VisualDL面板查看日志的可视化结果，共有两种启动方式：

#### 在命令行启动

使用命令行启动VisualDL面板，命令格式如下：

```python
visualdl --logdir <dir_1, dir_2, ... , dir_n> --host <host> --port <port> --cache-timeout <cache_timeout> --language <language> --public-path <public_path> --api-only
```

参数详情：

|      参数       |                                                                                             意义                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| --logdir        | 设定日志所在目录，可以指定多个目录，VisualDL将遍历并且迭代寻找指定目录的子目录，将所有实验结果进行可视化                                                                                     |
| --host          | 设定IP，默认为`127.0.0.1`                                                                                                                                                                    |
| --port          | 设定端口，默认为`8040`                                                                                                                                                                       |
| --cache-timeout | 后端缓存时间，在缓存时间内前端多次请求同一url，返回的数据从缓存中获取，默认为20秒                                                                                                            |
| --language      | VisualDL面板语言，可指定为'en'或'zh'，默认为浏览器使用语言                                                                                                                                   |
| --public-path   | VisualDL面板URL路径，默认是'/app'，即访问地址为'http://<host>:<port>/app'                                                                                                                    |
| --api-only      | 是否只提供API，如果设置此参数，则VisualDL不提供页面展示，只提供API服务，此时API地址为'http://<host>:<port>/<public_path>/api'；若没有设置public_path参数，则默认为'http://<host>:<port>/api' |

针对上一步生成的日志，启动命令为：

```
visualdl --logdir ./log
```

#### 在Python脚本中启动

支持在Python脚本中启动VisualDL面板，接口如下：

```python
visualdl.server.app.run(logdir,
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

|     参数      |                       格式                       |                                                                                             含义                                                                                             |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| logdir        | string或list[string_1, string_2, ... , string_n] | 日志文件所在的路径，VisualDL将在此路径下递归搜索日志文件并进行可视化，可指定单个或多个路径                                                                                                   |
| host          | string                                           | 指定启动服务的ip，默认为`127.0.0.1`                                                                                                                                                          |
| port          | int                                              | 启动服务端口，默认为`8040`                                                                                                                                                                   |
| cache_timeout | int                                              | 后端缓存时间，在缓存时间内前端多次请求同一url，返回的数据从缓存中获取，默认为20秒                                                                                                            |
| language      | string                                           | VisualDL面板语言，可指定为'en'或'zh'，默认为浏览器使用语言                                                                                                                                   |
| public_path   | string                                           | VisualDL面板URL路径，默认是'/app'，即访问地址为'http://<host>:<port>/app'                                                                                                                    |
| api_only      | boolean                                          | 是否只提供API，如果设置此参数，则VisualDL不提供页面展示，只提供API服务，此时API地址为'http://<host>:<port>/<public_path>/api'；若没有设置public_path参数，则默认为'http://<host>:<port>/api' |
| open_browser  | boolean                                          | 是否打开浏览器，设置为True则在启动后自动打开浏览器并访问VisualDL面板，若设置api_only，则忽略此参数                                                                                           |

针对上一步生成的日志，我们的启动脚本为：

```python
from visualdl.server import app

app.run(logdir="./log")
```

在使用任意一种方式启动VisualDL面板后，打开浏览器访问VisualDL面板，即可查看日志的可视化结果，如图：

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/82786044-67ae9880-9e96-11ea-8a2b-3a0951a6ec19.png" width="60%"/>
</p>



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
<img src="https://visualdl.bj.bcebos.com/images/image-eye.gif" width="60%"/>
</p>


### High Dimensional

将高维数据进行降维展示，目前支持T-SNE、PCA两种降维方式，用于深入分析高维数据间的关系，方便用户根据数据特征进行算法优化。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/82396340-3e4dd100-9a80-11ea-911d-798acdbc9c90.gif" width="85%"/>
</p>

## 开源贡献

VisualDL 是由 [PaddlePaddle](https://www.paddlepaddle.org/) 和 [ECharts](https://echarts.apache.org/) 合作推出的开源项目。欢迎所有人使用，提意见以及贡献代码。


## 更多细节

想了解更多关于VisualDL可视化功能的使用详情介绍，请查看[**VisualDL使用指南**](./docs/components/README.md)。

## 技术交流

欢迎您加入VisualDL官方qq群：1045783368 与飞桨团队以及其他用户共同针对VisualDL进行讨论与交流。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/82522691-c2758680-9b5c-11ea-9aee-fca994aba175.png" width="20%"/>
</p>
