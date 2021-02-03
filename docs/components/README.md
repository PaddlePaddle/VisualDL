[**English**](./UserGuide-en.md)
 
# VisualDL 使用指南

### 概述

VisualDL 是一个面向深度学习任务设计的可视化工具。VisualDL 利用了丰富的图表来展示数据，用户可以更直观、清晰地查看数据的特征与变化趋势，有助于分析数据、及时发现错误，进而改进神经网络模型的设计。

目前，VisualDL 支持 scalar, image, audio，graph, histogram, pr curve, ROC curve, high dimensional 七个组件，项目正处于高速迭代中，敬请期待新组件的加入。

|                           组件名称                           |  展示图表  | 作用                                                         |
| :----------------------------------------------------------: | :--------: | :----------------------------------------------------------- |
|      [ Scalar](#Scalar--标量组件)      |   折线图   | 动态展示损失函数值、准确率等标量数据                         |
|      [Image](#Image--图片可视化组件)      | 图片可视化 | 显示图片，可显示输入图片和处理后的结果，便于查看中间过程的变化 |
|      [Audio](#Audio--音频播放组件)      | 音频可视化 | 播放训练过程中的音频数据，监控语音识别与合成等任务的训练过程 |
| [Text](#Text--文本组件) |  文本可视化  | 展示文本任务任意阶段的数据输出，对比不同阶段的文本变化，便于深入了解训练过程及效果。 |
|               [Graph](#Graph--网络结构组件)                |  网络结构  | 展示网络结构、节点属性及数据流向，辅助学习、优化网络结构     |
|            [Histogram](#Histogram--直方图组件)             |   直方图   | 展示训练过程中权重、梯度等张量的分布                         |
|              [PR Curve](#PR-Curve--PR曲线组件)               |   折线图   | 权衡精度与召回率之间的平衡关系                               |
|              [ROC Curve](#ROC-Curve--ROC曲线组件)               |   折线图   | 展示不同阈值下的模型表现                               |
| [High Dimensional](#High-Dimensional--数据降维组件) |  数据降维  | 将高维数据映射到 2D/3D 空间来可视化嵌入，便于观察不同数据的相关性 |


同时，VisualDL提供可视化结果保存服务，通过 [VDL.service](#vdlservice) 生成链接，保存并分享可视化结果

## Scalar--标量组件

### 介绍

Scalar 组件的输入数据类型为标量，该组件的作用是将训练参数以折线图形式呈现。将损失函数值、准确率等标量数据作为参数传入 scalar 组件，即可画出折线图，便于观察变化趋势。

### 记录接口

Scalar 组件的记录接口如下：

```python
add_scalar(tag, value, step, walltime=None)
```
接口参数说明如下：
|   参数   |  格式  |                    含义                     |
| -------- | ------ | ------------------------------------------- |
| tag      | string | 记录指标的标志，如`train/loss`，不能含有`%` |
| value    | float  | 要记录的数据值                              |
| step     | int    | 记录的步数                                  |
| walltime | int    | 记录数据的时间戳，默认为当前时间戳          |

*注意tag的使用规则为：

1. 第一个`/`前的为父tag，并作为一栏图片的tag
2. 第一个`/`后的为子tag，子tag的对应图片将显示在父tag下
3. 可以使用多次`/`，但一栏图片的tag依旧为第一个`/`前的tag

具体使用参见以下三个例子：

- 创建train为父tag，acc和loss为子tag：`train/acc`、 `train/loss`，即创建了tag为train的图片栏，包含acc和loss两张图表：

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84653342-d6d05780-af3f-11ea-8979-8da039ae7201.JPG" width="100%"/>
</p>

- 创建train为父tag，test/acc和test/loss为子tag：`train/test/acc`、 `train/test/loss`，即创建了tag为train的图片栏，包含test/acc和test/loss两张图表：

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84644066-3bd08100-af31-11ea-8eb5-c4a4cab351ed.png" width="100%"/>
</p>

- 创建两个父tag：`acc`、 `loss`，即创建了tag分别为acc和loss的两个图表栏：：

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84644323-99fd6400-af31-11ea-9855-eca7f7b01810.png" width="100%"/>
</p>

### Demo

- 基础使用

下面展示了使用 Scalar 组件记录数据的示例，代码见[Scalar组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/scalar_test.py)
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
  <img src="https://user-images.githubusercontent.com/48054808/93732057-36ef2d80-fc02-11ea-9dac-b8fdce194d09.png" width="100%"/>
</p>

- 多组实验对比

下面展示了使用Scalar组件实现多组实验对比

多组实验对比的实现分为两步：

1. 创建子日志文件储存每组实验的参数数据
2. 将数据写入scalar组件时，**使用相同的tag**，即可实现对比**不同实验**的**同一类型参数**

```python
from visualdl import LogWriter

if __name__ == '__main__':
    value = [i/1000.0 for i in range(1000)]
    # 步骤一：创建父文件夹：log与子文件夹：scalar_test
    with LogWriter(logdir="./log/scalar_test") as writer:
        for step in range(1000):
            # 步骤二：向记录器添加一个tag为`train/acc`的数据
            writer.add_scalar(tag="train/acc", step=step, value=value[step])
            # 步骤二：向记录器添加一个tag为`train/loss`的数据
            writer.add_scalar(tag="train/loss", step=step, value=1/(value[step] + 1))
    # 步骤一：创建第二个子文件夹scalar_test2       
    value = [i/500.0 for i in range(1000)]
    with LogWriter(logdir="./log/scalar_test2") as writer:
        for step in range(1000):
            # 步骤二：在同样名为`train/acc`下添加scalar_test2的accuracy的数据
            writer.add_scalar(tag="train/acc", step=step, value=value[step])
            # 步骤二：在同样名为`train/loss`下添加scalar_test2的loss的数据
            writer.add_scalar(tag="train/loss", step=step, value=1/(value[step] + 1))
```

运行上述程序后，在命令行执行

```shell
visualdl --logdir ./log --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看以下折线图，观察scalar_test和scalar_test2的accuracy和loss的对比。

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84644158-5efb3080-af31-11ea-8e64-bbe4078425f4.png" width="100%"/>
</p>

*多组实验对比的应用案例可参考AI Studio项目：[VisualDL 2.0--眼疾识别训练可视化](https://aistudio.baidu.com/aistudio/projectdetail/502834)

### 功能操作说明

* 支持数据卡片「最大化」、「还原」、「坐标系转化」（y轴对数坐标）、「下载」折线图

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-icon.png" width="55%"/>
</p>



* 数据点Hover展示详细信息

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-tooltip.png" width="60%"/>
</p>



* 可搜索卡片标签，展示目标图像

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-searchlabel.png" width="90%"/>
</p>



* 可搜索打点数据标签，展示特定数据

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-searchstream.png" width="40%"/>
</p>

* 选择显示最值，展示最大最小值以及对应的训练步数

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732336-65213d00-fc03-11ea-96f4-cc6497094a06.png" width="20%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732424-d8c34a00-fc03-11ea-8b7b-0a728274f50f.png" width="60%"/>
</p>

* 选择仅显示平滑后的数据

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732485-263fb700-fc04-11ea-9edb-40cb8676aad0.png" width="25%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732514-4cfded80-fc04-11ea-99c9-9053f9945c8b.png" width="60%"/>
</p>

* X轴有三种衡量尺度

1. Step：迭代次数
2. Walltime：训练绝对时间
3. Relative：训练时长

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/x-axis.png" width="40%"/>
</p>
* 可调整曲线平滑度，以便更好的展现参数整体的变化趋势

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-smooth.png" width="37%"/>
</p>


## Image--图片可视化组件

### 介绍

Image 组件用于显示图片数据随训练的变化。在模型训练过程中，将图片数据传入 Image 组件，就可在 VisualDL 的前端网页查看相应图片。

### 记录接口

Image 组件的记录接口如下：

```python
add_image(tag, img, step, walltime=None, dataformats="HWC")
```
接口参数说明如下：
|   参数   |     格式      |                    含义                     |
| -------- | ------------- | ------------------------------------------- |
| tag      | string        | 记录指标的标志，如`train/loss`，不能含有`%` |
| img      | numpy.ndarray | 以ndarray格式表示的图片                     |
| step     | int           | 记录的步数                                  |
| walltime | int           | 记录数据的时间戳，默认为当前时间戳          |
| dataformats| string      | 传入的图片格式，包括`NCHW`、`HWC`、`HW`，默认为`HWC`|

### Demo
下面展示了使用 Image 组件记录数据的示例，代码文件请见[Image组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/image_test.py)
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
            writer.add_image(tag="eye",
                             img=random_crop("../../docs/images/eye.jpg"),
                             step=step)
```
运行上述程序后，在命令行执行
```shell
visualdl --logdir ./log --port 8080
```

在浏览器输入`http://127.0.0.1:8080`，即可查看图片数据。

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/82397685-86babe00-9a83-11ea-870e-502f313bdc7c.png" width="90%"/>
</p>


### 功能操作说明

- 可搜索图片标签显示对应图片数据

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/image-search.png" width="90%"/>
</p>


- 支持滑动Step/迭代次数查看不同迭代次数下的图片数据

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/image-eye.gif" width="60%"/>
</p>

### 添加图片矩阵
除使用add_image记录一张图片之外，还可以使用add_image_matrix一次添加多张图片并生成一张图片矩阵，接口及参数说明如下：
add_image_matrix的记录接口如下：

```python
add_image_matrix(tag, imgs, step, rows=-1, scale=1, walltime=None, dataformats="HWC")
```
接口参数说明如下：
|   参数   |     格式      |                    含义                     |
| -------- | ------------- | ------------------------------------------- |
| tag      | string        | 记录指标的标志，如`train/loss`，不能含有`%` |
| imgs     | numpy.ndarray | 以ndarray格式表示的多张图片，第一维为图片的数量  |
| step     | int           | 记录的步数                                  |
| rows     | int           | 生成图片矩阵的行数，默认值为-1，表示尽量把传入的图片组合成行列数相近的形式 |
| scale    | int           | 图片放大比例，默认为1 |
| walltime | int           | 记录数据的时间戳，默认为当前时间戳          |
| dataformats| string      | 传入的图片格式，包括`NCHW`、`HWC`、`HW`，默认为`HWC`|

**PS：当给定的子图像数量不足时，将用空白图像填充，以保证生成的图形为完整矩形**

#### Demo
下面展示了使用 Image 组件合成并记录多张图片数据的示例，代码文件请见[Image组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/image_matrix_test.py)
```python
import numpy as np
from PIL import Image
from visualdl import LogWriter


if __name__ == '__main__':
    imgs = []
    for index in range(6):
        imgs.append(np.asarray(Image.open("../../docs/images/images_matrix/%s.jpg" % str((index)))))

    with LogWriter(logdir='./log/image_matrix_test/train') as writer:
        writer.add_image(tag='detection', step=0, img=imgs[0])
        # 合成长宽尽量接近的图形矩阵，本例生成3X2的矩阵
        writer.add_image_matrix(tag='detection', step=1, imgs=imgs, rows=-1)
        # 合成长为1的图形矩阵，本例生成1x6的矩阵
        writer.add_image_matrix(tag='detection', step=2, imgs=imgs, rows=1)
        # 合成长为2的图形矩阵，本例生成2X3的矩阵
        writer.add_image_matrix(tag='detection', step=3, imgs=imgs, rows=2)
        # 合成长为3的图形矩阵，本例生成3X2的矩阵
        writer.add_image_matrix(tag='detection', step=4, imgs=imgs, rows=3)
        # 合成长为4的图形矩阵，本例生成4X2的矩阵，自动补充子图像填充第四行
        writer.add_image_matrix(tag='detection', step=5, imgs=imgs, rows=4)
```
运行上述程序后，在命令行执行
```shell
visualdl --logdir ./log --port 8080
```

在浏览器输入`http://127.0.0.1:8080`，即可查看图片数据。

<p align="center">
  <img src="https://user-images.githubusercontent.com/28444161/106742199-aae11e00-6657-11eb-827a-c785f9ff336e.png" width="40%"/>
  <img src="https://user-images.githubusercontent.com/28444161/106742248-c0eede80-6657-11eb-9c9e-3e858ae6562d.png" width="40%"/>
</p>


## Audio--音频播放组件

### 介绍

Audio组件实时查看训练过程中的音频数据，监控语音识别与合成等任务的训练过程。

### 记录接口

Audio 组件的记录接口如下：

```python
add_audio(tag, audio_array, step, sample_rate)
```
接口参数说明如下：
|   参数   |     格式      |                    含义                     |
| -------- | ------------- | ------------------------------------------- |
| tag      | string        | 记录指标的标志，如`audio_tag`，不能含有`%` |
| audio_arry      | numpy.ndarray | 以ndarray格式表示的音频                     |
| step     | int           | 记录的步数                                  |
| sample_rate | int           | 采样率，**注意正确填写对应音频的采样率**          |


### Demo
下面展示了使用 Audio 组件记录数据的示例，代码文件请见[Audio组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/audio_test.py)
```python
from visualdl import LogWriter
from scipy.io import wavfile


if __name__ == '__main__':
    with LogWriter(logdir="./log/audio_test/train") as writer:
        sample_rate, audio_data = wavfile.read('./test.wav')
        writer.add_audio(tag="audio_tag",
                         audio_array=audio_data,
                         step=0,
                         sample_rate=sample_rate)
```

运行上述程序后，在命令行执行
```shell
visualdl --logdir ./log --port 8080
```

在浏览器输入`http://127.0.0.1:8080`，即可查看音频数据。

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/87659138-b4746880-c78f-11ea-965b-c33804e7c296.png" width="90%"/>
</p>

### 功能操作说明

- 可搜索音频标签显示对应音频数据

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/87661431-29956d00-c793-11ea-833b-172d8fc1b221.png" width="80%"/>
</p>

- 支持滑动Step/迭代次数查看不同迭代次数下的音频数据

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/87661089-a07e3600-c792-11ea-8740-cbe99a64d830.png" width="40%"/>
</p>

- 支持播放/暂停音频数据

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/87661130-b3910600-c792-11ea-9f9f-2ae66132e9de.png" width="40%"/>
</p>

- 支持音量调节

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/87661497-49c52c00-c793-11ea-9eeb-471543cd2a0b.png" width="40%"/>
</p>

- 支持音频下载

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/87661166-c277b880-c792-11ea-8ad7-5c60bb08379b.png" width="40%"/>
</p>

## Text--文本组件

### 介绍

Text展示文本任务任意阶段的数据输出，对比不同阶段的文本变化，便于深入了解训练过程及效果。

### 记录接口

Text组件的记录接口如下：

```python
add_text(self, tag, text_string, step=None, walltime=None)
```

接口参数说明如下：

| 参数           | 格式                  | 含义                                        |
| -------------- | --------------------- | ------------------------------------------- |
| tag            | string                | 记录指标的标志，如`train/loss`，不能含有`%` |
| text_string    | string                | 文本字符串           |
| step           | int                   | 记录的步数                                  |
| walltime       | int                   | 记录数据的时间戳，默认为当前时间戳     |

### Demo

下面展示了使用 Text 组件记录数据的示例，代码见[Text组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/text_test.py)

```python
from visualdl import LogWriter
if __name__ == '__main__':
    texts = [
        '上联: 众 佛 群 灵 光 圣 地	下联: 众 生 一 念 证 菩 提',
        '上联: 乡 愁 何 处 解	下联: 故 事 几 时 休',
        '上联: 清 池 荷 试 墨	下联: 碧 水 柳 含 情',
        '上联: 既 近 浅 流 安 笔 砚	下联: 欲 将 直 气 定 乾 坤',
        '上联: 日 丽 萱 闱 祝 无 量 寿	下联: 月 明 桂 殿 祝 有 余 龄',
        '上联: 一 地 残 红 风 拾 起	下联: 半 窗 疏 影 月 窥 来'
    ]
    with LogWriter(logdir="./log/text_test/train") as writer:
        for step in range(len(texts)):
            writer.add_text(tag="output", step=step, text_string=texts[step])
```

运行上述程序后，在命令行执行

```shell
visualdl --logdir ./log --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看Text

<p align="center">
  <img src="https://user-images.githubusercontent.com/28444161/106248340-cdd09400-624b-11eb-8ea9-5a07a239c365.png" width="95%"/>
</p>

### 功能操作说明

- 可搜索文本标签显示对应文本数据

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/86536503-baaa4f80-bf1a-11ea-80ab-cd988617d018.png" width="40%"/>
</p>

- 可搜索数据流标签显示对应数据流数据

<p align="center">
  <img src="https://user-images.githubusercontent.com/28444161/106256983-f4e09300-6256-11eb-9acc-a24a2ac9b70c.png" width="40%"/>
</p>

- 可折叠标签

<p align="center">
  <img src="https://user-images.githubusercontent.com/28444161/106252364-28202380-6251-11eb-934c-d8893c2eaeca.png" width="80%"/>
</p>

## Graph--网络结构组件

### 介绍

Graph组件一键可视化模型的网络结构。用于查看模型属性、节点信息、节点输入输出等，并进行节点搜索，协助开发者们快速分析模型结构与了解数据流向。

### Demo
共有两种启动方式：

- 前端启动Graph：

  - 如只需使用Graph，无需添加任何参数，在命令行执行`visualdl`后即可启动。
  - 如果同时需使用其他功能，在命令行指定日志文件路径（以`./log`为例），即可启动：

  ```shell
  visualdl --logdir ./log --port 8080
  ```


- 后端启动Graph：

  - 在命令行加入参数`--model`并指定**模型文件**路径（非文件夹路径），即可启动：

  ```shell
  visualdl --model ./log/model --port 8080
  ```
*Graph目前只支持可视化网络结构格式的模型文件（如__model__（注意此处为两个下划线'_'））

   
启动后即可查看网络结构可视化：

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84490149-51e20580-acd5-11ea-9663-1f156892c0e0.png" width="80%"/>
</p>

### 功能操作说明

- 一键上传模型
  - 支持模型格式：PaddlePaddle、ONNX、Keras、Core ML、Caffe、Caffe2、Darknet、MXNet、ncnn、TensorFlow Lite
  - 实验性支持模型格式：TorchScript、PyTorch、Torch、 ArmNN、BigDL、Chainer、CNTK、Deeplearning4j、MediaPipe、ML.NET、MNN、OpenVINO、Scikit-learn、Tengine、TensorFlow.js、TensorFlow

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487396-44c31780-acd1-11ea-831a-1632e636613d.png" width="80%"/>
</p>

- 支持上下左右任意拖拽模型、放大和缩小模型

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487568-8784ef80-acd1-11ea-9da1-befedd69b872.GIF" width="80%"/>
</p>

- 搜索定位到对应节点

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487694-b9965180-acd1-11ea-8214-34f3febc1828.png" width="30%"/>
</p>

- 点击查看模型属性

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487751-cadf5e00-acd1-11ea-9ce2-4fdfeeea9c5a.png" width="30%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487759-d03ca880-acd1-11ea-9294-520ef7f9e0b1.png" width="30%"/>
</p>

- 支持选择模型展示的信息

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487829-ee0a0d80-acd1-11ea-8563-6682a15483d9.png" width="23%"/>
</p>

- 支持以PNG、SVG格式导出文件

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487884-ff531a00-acd1-11ea-8b12-5221db78683e.png" width="30%"/>
</p>

- 点击节点即可展示对应属性信息

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487941-13971700-acd2-11ea-937d-42fb524b9ee1.png" width="30%"/>
</p>

- 支持一键更换模型

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487998-27db1400-acd2-11ea-83d7-5d75832ef41d.png" width="25%"/>
</p>

## Histogram--直方图组件

### 介绍

Histogram组件以直方图形式展示Tensor（weight、bias、gradient等）数据在训练过程中的变化趋势。深入了解模型各层效果，帮助开发者精准调整模型结构。

### 记录接口

Histogram 组件的记录接口如下：

```python
add_histogram(tag, values, step, walltime=None, buckets=10)
```
接口参数说明如下：
|   参数   |          格式          |                    含义                     |
| -------- | --------------------- | ------------------------------------------- |
| tag      | string                | 记录指标的标志，如`train/loss`，不能含有`%` |
| values   | numpy.ndarray or list | 以ndarray或list格式表示的数据                     |
| step     | int                   | 记录的步数                                  |
| walltime | int                   | 记录数据的时间戳，默认为当前时间戳          |
| buckets  | int                   | 生成直方图的分段数，默认为10          |

### Demo

下面展示了使用 Histogram组件记录数据的示例，代码见[Histogram组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/histogram_test.py)

```python
from visualdl import LogWriter
import numpy as np


if __name__ == '__main__':
    values = np.arange(0, 1000)
    with LogWriter(logdir="./log/histogram_test/train") as writer:
        for index in range(1, 101):
            interval_start = 1 + 2 * index / 100.0
            interval_end = 6 - 2 * index / 100.0
            data = np.random.uniform(interval_start, interval_end, size=(10000))
            writer.add_histogram(tag='default tag',
                                 values=data,
                                 step=index,
                                 buckets=10)
```

运行上述程序后，在命令行执行

```shell
visualdl --logdir ./log --port 8080
```

在浏览器输入`http://127.0.0.1:8080`，即可查看训练参数直方图。

### 功能操作说明

- 支持数据卡片「最大化」、「下载」直方图
  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86535351-42d82700-bf12-11ea-89f0-171280e7c526.png" width="60%"/>
  </p>

- 可选择Offset或Overlay模式

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86535413-c134c900-bf12-11ea-9ad6-f0ad8eafa76f.png" width="30%"/>
  </p>

  - Offset模式

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536435-2b9d3780-bf1a-11ea-9981-92f837d22ae5.png" width="60%"/>
  </p>

  - Overlay模式

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536458-5ab3a900-bf1a-11ea-985e-05f06c1b762b.png" width="60%"/>
  </p>

- 数据点Hover展示参数值、训练步数、频次
  - 在第240次训练步数时，权重为-0.0031，且出现的频次是2734次

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536482-80d94900-bf1a-11ea-9e12-5bea9f382b34.png" width="60%"/>
  </p>

- 可搜索卡片标签，展示目标直方图

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536503-baaa4f80-bf1a-11ea-80ab-cd988617d018.png" width="30%"/>
  </p>

- 可搜索打点数据标签，展示特定数据流

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536639-b894c080-bf1b-11ea-9ee5-cf815dd4bbd7.png" width="30%"/>
  </p>

## PR Curve--PR曲线组件

### 介绍

PR Curve以折线图形式呈现精度与召回率的权衡分析，清晰直观了解模型训练效果，便于分析模型是否达到理想标准。

### 记录接口

PR Curve组件的记录接口如下：

```python
add_pr_curve(tag, labels, predictions, step=None, num_thresholds=10)
```

接口参数说明如下：

| 参数           | 格式                  | 含义                                        |
| -------------- | --------------------- | ------------------------------------------- |
| tag            | string                | 记录指标的标志，如`train/loss`，不能含有`%` |
| labels         | numpy.ndarray or list | 以ndarray或list格式表示的实际类别           |
| predictions    | numpy.ndarray or list | 以ndarray或list格式表示的预测类别           |
| step           | int                   | 记录的步数                                  |
| num_thresholds | int                   | 阈值设置的个数，默认为10，最大值为127       |
| weights        | float                 | 用于设置TP/FP/TN/FN在计算precision和recall时的权重       |
| walltime       | int                   | 记录数据的时间戳，默认为当前时间戳     |

### Demo

下面展示了使用 PR Curve 组件记录数据的示例，代码见[PR Curve组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/pr_curve_test.py)

```python
from visualdl import LogWriter
import numpy as np

with LogWriter("./log/pr_curve_test/train") as writer:
    for step in range(3):
        labels = np.random.randint(2, size=100)
        predictions = np.random.rand(100)
        writer.add_pr_curve(tag='pr_curve',
                            labels=labels,
                            predictions=predictions,
                            step=step,
                            num_thresholds=5)
```

运行上述程序后，在命令行执行

```shell
visualdl --logdir ./log --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看PR Curve

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/86738774-ee46c000-c067-11ea-90d2-a98aac445cca.png" width="80%"/>
</p>

### 功能操作说明

- 支持数据卡片「最大化」、「还原」、「下载」PR曲线

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86740067-f18e7b80-c068-11ea-96bf-52cb7da1f799.png" width="40%"/>
  </p>

- 数据点Hover展示详细信息：阈值对应的TP、TN、FP、FN

    <p align="center">
      <img src="https://user-images.githubusercontent.com/48054808/86740477-43370600-c069-11ea-93f0-f4d05445fbab.png" width="50%"/>
    </p>

- 可搜索卡片标签，展示目标图表

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86740670-66fa4c00-c069-11ea-9ee3-0a22e2d0dbec.png" width="30%"/>
  </p>

- 可搜索打点数据标签，展示特定数据

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/86740817-809b9380-c069-11ea-9453-6531e3ff5f43.png" width="30%"/>
</p>

- 支持查看不同训练步数下的PR曲线

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86741057-b04a9b80-c069-11ea-9fef-2dcc16f9cd46.png" width="30%"/>
  </p>

- X轴-时间显示类型有三种衡量尺度
  - Step：迭代次数
  - Walltime：训练绝对时间
  - Relative：训练时长
  
  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86741304-db34ef80-c069-11ea-86eb-787b49ed3705.png" width="30%"/>
  </p>

## ROC Curve--ROC曲线组件

### 介绍

ROC曲线展示不同阈值下模型指标的变化，同时曲线下的面积（AUC）直观的反应模型表现，辅助开发者掌握模型训练情况并高效进行阈值选择。

### 记录接口

ROC Curve组件的记录接口如下：

```python
add_roc_curve(tag, labels, predictions, step=None, num_thresholds=10)
```

接口参数说明如下：

| 参数           | 格式                  | 含义                                        |
| -------------- | --------------------- | ------------------------------------------- |
| tag            | string                | 记录指标的标志，如`train/loss`，不能含有`%` |
| labels         | numpy.ndarray or list | 以ndarray或list格式表示的实际类别           |
| predictions    | numpy.ndarray or list | 以ndarray或list格式表示的预测类别           |
| step           | int                   | 记录的步数                                  |
| num_thresholds | int                   | 阈值设置的个数，默认为10，最大值为127       |
| weights        | float                 | 用于设置TP/FP/TN/FN在计算precision和recall时的权重       |
| walltime       | int                   | 记录数据的时间戳，默认为当前时间戳     |

### Demo

下面展示了使用 ROC Curve 组件记录数据的示例，代码见[ROC Curve组件](https://github.com/YixinKristy/VisualDL/blob/develop/demo/components/roc_curve_test.py)

```python
from visualdl import LogWriter
import numpy as np

with LogWriter("./log/roc_curve_test/train") as writer:
    for step in range(3):
        labels = np.random.randint(2, size=100)
        predictions = np.random.rand(100)
        writer.add_roc_curve(tag='roc_curve',
                             labels=labels,
                             predictions=predictions,
                             step=step,
                             num_thresholds=5)
```

运行上述程序后，在命令行执行

```shell
visualdl --logdir ./log --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看ROC Curve

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/103344081-8928d000-4ac8-11eb-84d0-28f249886172.gif" width="80%"/>
</p>

*Note：ROC前端页面使用和PR相同，请参考上述PR Curve的使用说明。

## High Dimensional--数据降维组件

### 介绍

High Dimensional 组件将高维数据进行降维展示，用于深入分析高维数据间的关系。目前支持以下两种降维算法：

 - PCA : Principle Component Analysis 主成分分析
 - t-SNE : t-distributed stochastic neighbor embedding t-分布式随机领域嵌入
 - umap: uniform manifold approximation and projection for dimension reduction 流形学习降维算法

### 记录接口

High Dimensional 组件的记录接口如下：

```python
add_embeddings(tag, labels, hot_vectors, walltime=None)
```
接口参数说明如下：
|    参数     |        格式         |                         含义                         |
| ----------- | ------------------- | ---------------------------------------------------- |
| tag         | string              | 记录指标的标志，如`default`，不能含有`%`             |
| labels      | numpy.array 或 list | 一维数组表示的标签，代表hot_vectors的标签，如果有多个维度的labels需要使用二维数组，其中每个元素为某维度下的一维标签数组 |
| hot_vectors | numpy.array or list | 与labels一一对应，每个元素可以看作是某个标签的特征   |
| labels_meta | numpy.array or list | labels的标签，与labels一一对应，不指定则使用默认值`__metadata__`，当labels为一维数组时无需指定   |
| walltime    | int                 | 记录数据的时间戳，默认为当前时间戳                   |

### Demo
下面展示了使用 High Dimensional 组件记录数据的示例，代码见[High Dimensional组件](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/high_dimensional_test.py)
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
    """
    # 也可以同时提供多个label，此时`labels`为二维数组，且需要提供`labels_meta`以供前端页面选择展示不同label.
    labels = [["label_a_1", "label_a_2", "label_a_3", "label_a_4", "label_a_5"],
              ["label_b_1", "label_b_2", "label_b_3", "label_b_4", "label_b_5"]]
    # labels_meta需要和labels一一对应
    labels_meta = ["label_a", "label_b"]
    with LogWriter(logdir="./log/high_dimensional_test/train") as writer:
        writer.add_embeddings(tag='default',
                              labels=labels,
                              labels_meta=labels_meta,
                              hot_vectors=hot_vectors)
    """
```
运行上述程序后，在命令行执行
```shell
visualdl --logdir ./log --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看降维后的可视化数据。

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/103188111-1b32ac00-4902-11eb-914e-c2368bdb8373.gif" width="85%"/>
</p>

### 功能操作说明

* 支持选择特定实验数据进行展示，且支持根据所选择的数据标签进行展示

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103191809-4e306c00-4911-11eb-853f-e143ef86e182.png" width="30%"/>
  </p>

* 降维方式--TSNE

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103192762-cea49c00-4914-11eb-896c-070b0bf0e2ea.png" width="27%"/>
  </p>

* 降维方式--PCA

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103192341-47a2f400-4913-11eb-9995-fdc0acadbdc9.png" width="27%"/>
  </p>

* 降维方式--UMAP

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103192766-d2d0b980-4914-11eb-871e-e4b31542c5e9.png" width="27%"/>
  </p>

## VDL.service

### 简介

VisualDL可视化结果保存服务，以链接形式将可视化结果保存下来，方便用户快速、便捷的进行托管与分享。

### 使用步骤

1. 确保VisualDL已升级到最新版本，如未升级，请使用以下命令进行升级

```
pip install visualdl --upgrade

```

2. 上传需保存/分享的日志/模型文件

```
visualdl service upload --logdir ./log \
                        --model ./__model__
```                       
                       
3. VDL.service将返回一个URL链接，复制粘贴链接至浏览器中即可查看可视化结果

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/93733769-5ccc0080-fc09-11ea-88c0-6f17c04ebdce.png" width="100%"/>
  </p>
  
   <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/93733790-69e8ef80-fc09-11ea-9256-68a88072f5d2.png" width="100%"/>
  </p>
