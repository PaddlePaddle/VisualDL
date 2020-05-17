

# VisualDL 使用指南

### 概述

VisualDL 是一个面向深度学习任务设计的可视化工具。VisualDL 利用了丰富的图表来展示数据，用户可以更直观、清晰地查看数据的特征与变化趋势，有助于分析数据、及时发现错误，进而改进神经网络模型的设计。

目前，VisualDL 支持 scalar, image, high dimensional 三个组件，项目正处于高速迭代中，敬请期待新组件的加入。

|                           组件名称                           |  展示图表  | 作用                                                         |
| :----------------------------------------------------------: | :--------: | :----------------------------------------------------------- |
|      <a href="#1">[ Scalar](#Scalar -- 折线图组件)</a>       |   折线图   | 动态展示损失函数值、准确率等标量数据                         |
|      <a href="#3">[Image](#Image -- 图片可视化组件)</a>      | 图片可视化 | 显示图片，可显示输入图片和处理后的结果，便于查看中间过程的变化 |
| <a href="#6">[High Dimensional](#High Dimensional -- 数据降维组件)</a> |  数据降维  | 将高维数据映射到 2D/3D 空间来可视化嵌入，便于观察不同数据的相关性 |



## Scalar -- 折线图组件

### 介绍

Scalar 组件的输入数据类型为标量，该组件的作用是将训练参数以折线图形式呈现。将损失函数值、准确率等标量数据作为参数传入 scalar 组件，即可画出折线图，便于观察变化趋势。

### 记录接口

Scalar 组件的记录接口如下：

```python
add_scalar(tag, value, step, walltime=None)
```
接口参数说明如下：
|参数|格式|含义|
|-|-|-|
|tag|string|记录指标的标志，如`train/loss`，不能含有`%`|
|value|float|要记录的数据值|
|step|int|记录的步数|
|walltime|int|记录数据的时间戳，默认为当前时间戳|

### Demo
下面展示了使用 Scalar 组件记录数据的示例，代码见[Scalar组件](../../demo/components/scalar_test.py)
```python
from visualdl import LogWriter

if __name__ == '__main__':
    value = [i/1000.0 for i in range(1000)]
    # 初始化一个记录器
    with LogWriter(logdir="./log/scalar_test/train") as writer:
        for step in range(1000):
            # 向记录器添加一个tag为`acc`的数据
            writer.add_scalar(tag="acc", step=step, value=value[step])
            # 向记录器添加一个tag为`loss`的数据
            writer.add_scalar(tag="loss", step=step, value=1/(value[step] + 1))
```
运行上述程序后，在命令行执行
```shell
visualdl --logdir ./log --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看以下折线图。

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/scalar-globalstatic.png" width="100%"/>
</p>



### 功能操作说明

* 支持数据卡片「最大化」、「还原」、「坐标系转化」（y轴对数坐标）、「下载」折线图

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/scalar-icon.png" width="55%"/>
</p>



* 数据点Hover展示详细信息

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/scalar-tooltip.png" width="60%"/>
</p>



* 可搜索卡片标签，展示目标图像

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/scalar-searchlabel.png" width="90%"/>
</p>



* 可搜索打点数据标签，展示特定数据

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/scalar-searchstream.png" width="40%"/>
</p>


* X轴有三种衡量尺度

1. Step：迭代次数
2. Walltime：训练绝对时间
3. Relative：训练时长

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/x-axis.png" width="40%"/>
</p>
* 可调整曲线平滑度，以便更好的展现参数整体的变化趋势

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/scalar-smooth.png" width="37%"/>
</p>


## Image -- 图片可视化组件

### 介绍

Image 组件用于显示图片数据随训练的变化。在模型训练过程中，将图片数据传入 Image 组件，就可在 VisualDL 的前端网页查看相应图片。

### 记录接口

Image 组件的记录接口如下：

```python
add_image(tag, img, step, walltime=None)
```
接口参数说明如下：
|参数|格式|含义|
|-|-|-|
|tag|string|记录指标的标志，如`train/loss`，不能含有`%`|
|img|numpy.ndarray|以ndarray格式表示的图片|
|step|int|记录的步数|
|walltime|int|记录数据的时间戳，默认为当前时间戳|

### Demo
下面展示了使用 Image 组件记录数据的示例，代码文件请见[Image组件](../../demo/components/image_test.py)
```python
import numpy as np
from PIL import Image
from visualdl import LogWriter


def random_crop(img):
    """获取图片的随机 100x100 分片
    """
    img = Image.open(img)
    w, h = img.size
    random_w = np.random.randint(0, w - 100)
    random_h = np.random.randint(0, h - 100)
    r = img.crop((random_w, random_h, random_w + 100, random_h + 100))
    return np.asarray(r)


if __name__ == '__main__':
    # 初始化一个记录器
    with LogWriter(logdir="./log/image_test/train") as writer:
        for step in range(6):
            # 添加一个图片数据
            writer.add_image(tag="doge",
                             img=random_crop("../../docs/images/eye.jpg"),
                             step=step)
```
运行上述程序后，在命令行执行
```shell
visualdl --logdir ./log --port 8080
```

在浏览器输入`http://127.0.0.1:8080`，即可查看图片数据。

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/image-static.png" width="90%"/>
</p>


### 功能操作说明

可搜索图片标签显示对应图片数据

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/image-search.png" width="90%"/>
</p>


支持滑动Step/迭代次数查看不同迭代次数下的图片数据

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/image-eye.gif" width="60%"/>
</p>


## High Dimensional -- 数据降维组件

### 介绍

High Dimensional 组件将高维数据进行降维展示，用于深入分析高维数据间的关系。目前支持以下两种降维算法：

 - PCA : Principle Component Analysis 主成分分析
 - t-SNE : t-distributed stochastic neighbor embedding t-分布式随机领域嵌入

### 记录接口

High Dimensional 组件的记录接口如下：

```python
add_embeddings(tag, labels, hot_vectors, walltime=None)
```
接口参数说明如下：
|参数|格式|含义|
|-|-|-|
|tag|string|记录指标的标志，如`default`，不能含有`%`|
|labels|numpy.array 或 list|一维数组表示的标签，每个元素是一个string类型的字符串|
|hot_vectors|numpy.array or list|与labels一一对应，每个元素可以看作是某个标签的特征|
|walltime|int|记录数据的时间戳，默认为当前时间戳|

### Demo
下面展示了使用 High Dimensional 组件记录数据的示例，代码见[High Dimensional组件](../../demo/components/high_dimensional_test.py)
```python
from visualdl import LogWriter


if __name__ == '__main__':
    hot_vectors = [
        [1.3561076367500755, 1.3116267195134017, 1.6785401875616097],
        [1.1039614644440658, 1.8891609992484688, 1.32030488587171],
        [1.9924524852447711, 1.9358920727142739, 1.2124401279391606],
        [1.4129542689796446, 1.7372166387197474, 1.7317806077076527],
        [1.3913371800587777, 1.4684674577930312, 1.5214136352476377]]

    labels = ["label_1", "label_2", "label_3", "label_4", "label_5"]
    # 初始化一个记录器
    with LogWriter(logdir="./log/high_dimensional_test/train") as writer:
        # 将一组labels和对应的hot_vectors传入记录器进行记录
        writer.add_embeddings(tag='default',
                              labels=labels,
                              hot_vectors=hot_vectors)
```
运行上述程序后，在命令行执行
```shell
visualdl --logdir ./log --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看降维后的可视化数据。

<p align="center">
  <img src="http://visualdl.bj.bcebos.com/images/dynamic_high_dimensional.gif" width="80%"/>
</p>
