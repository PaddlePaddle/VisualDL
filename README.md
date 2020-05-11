[![Build Status](https://travis-ci.org/PaddlePaddle/VisualDL.svg?branch=develop)](https://travis-ci.org/PaddlePaddle/VisualDL)
[![Documentation Status](https://img.shields.io/badge/docs-latest-brightgreen.svg?style=flat)](https://github.com/PaddlePaddle/VisualDL/tree/develop/docs)
[![Release](https://img.shields.io/github/release/PaddlePaddle/VisualDL.svg)](https://github.com/PaddlePaddle/VisualDL/releases)
[![License](https://img.shields.io/badge/license-Apache%202-blue.svg)](LICENSE)

<p align="center">
  <img src="/frontend/packages/core/public/images/logo-visualdl.svg" width="60%"/>
</p>

## 介绍
VisualDL是一个面向深度学习任务设计的可视化工具，利用丰富的图表展示数据，用户可以更直观、清晰地查看数据的特征与变化趋势，有助于分析数据、及时发现错误，进而改进神经网络模型的设计。

目前，VisualDL支持Scalar, Image, High Dimensional, Graph 这四个组件，项目正处于高速迭代中，新的组件会不断加入。

由于大多数DNN平台均使用Python作为配置语言，VisualDL原生支持python的使用，
通过在模型的Python配置中添加几行，便可以为训练过程提供丰富的可视化支持。


## 组件
VisualDL 目前支持以下组件：

- scalar
- image
- high dimensional
- graph

### Scalar
可以用于展示训练测试的指标变化趋势

<p align="center">
<img src="/docs/images/scalar_test.png" width="100%"/>
</p>


### Image
可以用于可视化任何图片，包括模型训练和预测得到的结果

<p align="center">
<img src="/docs/images/image_test.png" width="100%"/>
</p>

### High Dimensional

可以用于将高维度数据映射到2D/3D可实现可视化

<p align="center">
<img src="/docs/images/high_dimensional_test.png" width="100%"/>
</p>

## 安装
### 使用 Anaconda 安装

Anaconda是一个用于科学计算的Python发行版，提供了包管理与环境管理的功能，可以很方便地解决多版本python并存、切换以及各种第三方包安装问题。

请根据[Anaconda下载网站](https://www.anaconda.com/download) 的指示去下载和安装Anaconda.
下载Python 3.6版本的command-Line installer.

创建conda环境名字为```vdl```或任何名字:
```
conda create -n vdl python=3.7
```

激活conda环境如下:
```
source activate vdl
```

现在再安装 VisualDL 和运行范例：

```shell
pip install --upgrade visualdl
```

也可以使用源代码安装方式，能够获取最新的VisualDL更新。

### 使用代码安装

建议在anaconda环境下进行安装。
```shell
git clone https://github.com/PaddlePaddle/VisualDL.git
cd VisualDL

python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```

## SDK
以最简单的Scalar组件为例，尝试创建一个日志记录多个scalar的数据步骤如下：

```python
from visualdl import LogWriter

with LogWriter(logdir="./tmp") as writer:
    for step in range(100):
        writer.add_scalar(step=step, value=step*2)
```


## 启动VisualDL服务

当训练过程中已经产生了日志数据，就可以启动VisualDL服务进行实时预览可视化信息。

### 在命令行中启动

```
visualdl --logdir <some log dir>
```

board 还支持一些参数来实现远程的访问：

- `--host` 设定IP
- `--port` 设定端口
### 在Python脚本中启动
```python
>>> from visualdl.server import app

>>> app.run(logdir="SOME_LOG_DIR")
```
`app.run()`支持命令行启动的所有参数，除此之外，还可以通过指定`open_browser=True`，自动打开浏览器。
## 贡献

VisualDL 是由 [PaddlePaddle](http://www.paddlepaddle.org/) 和 [ECharts](http://echarts.baidu.com/) 合作推出的开源项目。我们欢迎所有人使用，提意见以及贡献代码。


## 更多细节

想了解更多关于VisualDL的使用介绍，请查看[文档](./docs/README.md)
