[**中文**](./README_CN.md)

# VisualDL Guide

### Overview

VisualDL is a visualization tool designed for Deep Learning. VisualDL provides a variety of charts to show the trends of parameters. It enables users to understand the training process and model structures of Deep Learning models more clearly and intuitively so as to optimize models efficiently.

Currently, VisualDL provides **Ten Components**: scalar, image, audio, text, graph, histogram, pr curve, ROC curve, high dimensional and hyperparameters. VisualDL iterates rapidly and new functions will be continuously added.



|                        Component Name                        |         Display Chart         | Function                                                     |
| :----------------------------------------------------------: | :---------------------------: | :----------------------------------------------------------- |
|                [ Scalar](#Scalar--Line-Chart)                |          Line Chart           | Display scalar data such as loss and accuracy dynamically.   |
|             [Image](#Image--Image-Visualization)             |      Image Visualization      | Display images, visualizing the input and the output and making it easy to view the changes in the intermediate process. |
|             [Audio](#Audio--Audio-Play)             |      Audio Play      | Play the audio during the training process, making it easy to monitor the process of speech recognition and text-to-speech. |
| [Text](#Text) | Text Visualization | Visualize the text output of NLP models within any stage, aiding developers to compare the changes of outputs so as to deeply understand the training process and simply evaluate the performance of the model. |
|              [Graph](#Graph--Network-Structure)              |       Network Structure       | Visualize network structures, node attributes and data flow, assisting developers to learn and to optimize network structures. |
|       [Histogram](#Histogram--Distribution-of-Tensors)       |    Distribution of Tensors    | Present the changes of distributions of tensors, such as weights/gradients/bias, during the training process. |
|                   [PR Curve](#PR-Curve)                   |   Precision & Recall Curve    | Display precision-recall curves across training steps, clarifying the tradeoff between precision and recall when comparing models. |
|                   [ROC Curve](#ROC-Curve)                   |   Receiver Operating Characteristic curve    | Show the performance of a classification model at all classification thresholds. |
| [High Dimensional](#High-Dimensional--Data-Dimensionality-Reduction) | Data Dimensionality Reduction | Project high-dimensional data into 2D/3D space for embedding visualization, making it convenient to observe the correlation between data. |
| [Hyper Parameters](#hyperparameters--hyperparameter-visualization) |  HyperParameter Visualization  | Visualize the relationship between hyperparameters and model metrics (such as accuracy and loss) in a rich view, helping you identify the best hyperparameters in an efficient way. |

At the same time, VisualDL provides [VDL.service](#vdlservice) , which allows developers to easily save, track and share visualization results of experiments with anyone for free.

## Scalar--Line Chart

### Introduction

The data type of the input is scalar values. Scalar is used to present the training parameters in the form of a line chart. By using Scalar to record loss and accuracy, developers are able to track the trend of changes easily through line charts.

### Record Interface

The interface of the Scalar is shown as follows:

```python
add_scalar(tag, value, step, walltime=None)
```
The interface parameters are described as follows:
| parameter | format | meaning                                                      |
| --------- | ------ | ------------------------------------------------------------ |
| tag       | string | Record the name of the scalar data，e.g.train/loss. Notice that the name cannot contain `%` |
| value     | float  | Record the data, can't be `None`                                              |
| step      | int    | Record the training steps. The data will be sampled, meaning that only part of data will be displayed. (the sampling algorithm is reservoir sampling, details can be refered to [VisualDL sampling algorithm](../faq.md/#what-are-the-sampling-rules-of-visualdl))                                      |
| walltime  | int    | Record the time-stamp of the data, the default is the current time-stamp |

*Note that the rules of specifying tags (e.g.train/acc) are:

1. The tag before the first  `/` is the parent tag and serves as the tag of the same raw
2. The tag after the first `/` is a child tag, the charts with child tag will be displayed under the parent tag. The data of the same parent tag but different child tags will be displayed in the same column, but not in the same picture.
3. Users can use multiple `/`, but the tag of a raw is the parent tag--the tag before the first `/`

Here are three examples:

- When 'train' is created as the parent tag and 'acc' and 'loss' are created as child tags：`train/acc`、 `train/loss`，the tag of a raw is 'train' , which includes two sub charts--'acc' and 'loss':

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90884030-88c54d80-e3e1-11ea-9ba7-4b8df7b3496e.png" width="100%"/>
</p>

- When 'train' is created as the parent tag, and 'test/acc' and 'test/loss' are created as child tags：`train/test/acc`、 `train/test/loss`, the tag of a raw is 'train', which includes two sub charts--'test/acc' and 'test/loss': 

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90884098-a692b280-e3e1-11ea-8c0b-380b970b50b2.png" width="100%"/>
</p>

- When two parent tags are created：`acc`、 `loss`， two rows of charts are named as 'acc' and 'loss' respectively.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90884122-b3afa180-e3e1-11ea-90b0-93a75543f253.png" width="100%"/>
</p>

### Demo

- Fundamental Methods

The following shows an example of using Scalar to record data, and the script can be found in [Scalar Demo](../../demo/components/scalar_test.py)
```python
from visualdl import LogWriter

if __name__ == '__main__':
    value = [i/1000.0 for i in range(1000)]
    # initialize a recorder
    with LogWriter(logdir="./log/scalar_test/train") as writer:
        for step in range(1000):
            # add accuracy with tag of 'acc' to the recorder
            writer.add_scalar(tag="acc", step=step, value=value[step])
            # add loss with tag of 'loss' to the recorder
            writer.add_scalar(tag="loss", step=step, value=1/(value[step] + 1))
```
After running the above program, developers can launch the panel by:
```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address: `http://127.0.0.1:8080`to view line charts:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90871520-c9b36700-e3cd-11ea-9063-ca692b1d3917.png" width="100%"/>
</p>

- Advanced Usage--Comparison of Multiple Experiments

The following shows the comparison of multiple sets of experiments using Scalar.

There are two steps to achieve this function:

1. Create sub-log files to store the parameter data of each group of experiments
2. When recording data to the scalar component，developers can compare **the same type of parameters for different experiments**  by **using the same tag**. Note that the log files you want to display must be placed in different directories because only one log file in a directory is valid and displayed.

```python
from visualdl import LogWriter

if __name__ == '__main__':
    value = [i/1000.0 for i in range(1000)]
    # Step 1: Create a parent folder: log and a child folder: scalar_test
    with LogWriter(logdir="./log/scalar_test") as writer:
        for step in range(1000):
            # Step 2: Add data with tag train/acc to the recorder
            writer.add_scalar(tag="train/acc", step=step, value=value[step])
            # Step 2: Add data with tag train/loss to the recorder
            writer.add_scalar(tag="train/loss", step=step, value=1/(value[step] + 1))
    # Step 1: Create a second child folder: scalar_test2    
    value = [i/500.0 for i in range(1000)]
    with LogWriter(logdir="./log/scalar_test2") as writer:
        for step in range(1000):
            # Step 2: Add the accuracy data of scalar_test2 under the same name `train/acc`
            writer.add_scalar(tag="train/acc", step=step, value=value[step])
            # Step 2: Add the loss data of scalar_test2 under the same name as `train/loss`
            writer.add_scalar(tag="train/loss", step=step, value=1/(value[step] + 1))
```

After running the above program, developers can launch the panel by:

```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address: `http://127.0.0.1:8080` to view line charts:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90884963-4dc41980-e3e3-11ea-824a-277a8d71823e.png" width="100%"/>
</p>
*For more specific details of how to compare multiple experiments, pleas refer to the project on AI Studio：[VisualDL 2.0--Visualization of eye disease recognition training](https://aistudio.baidu.com/aistudio/projectdetail/502834)
It can be seen that the data of different experiments (determined by the path) are displayed in different pictures, and the data of the same tag is displayed on the same picture for comparison.

### Functional Instruction

* Developers are allowed to zoom in, restore, transform of the coordinate axis (y-axis logarithmic coordinates), download the line chart.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-icon.png" width="45%"/>
</p>



* Details can be shown by hovering on specific data points.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90872099-b785f880-e3ce-11ea-9ebe-8083c893d88b.png" width="60%"/>
</p>



* Developers can find target scalar charts by searching corresponded tags.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90872849-cfaa4780-e3cf-11ea-985d-b4c382acf773.png" width="90%"/>
</p>



* Specific runs can be selected by searching for the corresponded  experiment tags.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90873112-2b74d080-e3d0-11ea-8a69-24b7b4abae96.png" width="40%"/>
</p>

* Display the global extrema

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732753-46bc4100-fc05-11ea-92ca-35c89467815b.png" width="30%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732766-58054d80-fc05-11ea-89e0-bc00a283f559.png" width="60%"/>
</p>

* Only display smoothed data 

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732799-7f5c1a80-fc05-11ea-886f-193c3bcc9b5f.png" width="30%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/93732815-9569db00-fc05-11ea-8353-ffa5086d3d52.png" width="60%"/>
</p>

* There are three measurement scales of X axis

1. Step: number of iterations
2. Walltime: absolute training time
3. Relative: training time

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90873502-da191100-e3d0-11ea-8b03-c8fea0b65388.png" width="40%"/>
</p>

* The smoothness of the curve can be adjusted to better show the change of the overall trend.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90873564-edc47780-e3d0-11ea-909c-161e9fd8eeef.png" width="37%"/>
</p>


## Image--Image Visualization

### Introduction

The Image is used to present the change of image data during training. Developers can view images in different training stages by adding few lines of codes to record images in a log file.

### Record Interface

The interface of the Image is shown as follows:

```python
add_image(tag, img, step, walltime=None, dataformats="HWC")
```
The interface parameters are described as follows:
| parameter | format        | meaning                                                      |
| --------- | ------------- | ------------------------------------------------------------ |
| tag       | string        | Record the name of the image data，e.g.train/loss. Notice that the name cannot contain `%` |
| img       | numpy.ndarray | Images in ndarray format. The default `HWC` format dimension is [h, w, c], h and w are the height and width of the images, and c is the number of channels, which can be 1, 3, 4. Floating point data will be clipped to the range[0, 1), and note that the image data cannot be None.                                     |
| step      | int           | Record the training steps                                    |
| walltime  | int           | Record the time-stamp of the data, the default is the current time-stamp |
| dataformats| string       | Format of image，include `NCHW`、`NHWC`、`HWC`、`CHW`、`HW`，default is `HWC`. It will be converted to `HWC` format when stored.|

### Demo
The following shows an example of using Image to record data, and the script can be found in [Image Demo](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/image_test.py).
```python
import numpy as np
from PIL import Image
from visualdl import LogWriter


def random_crop(img):
    """get random 100x100 slices of image
    """
    img = Image.open(img)
    w, h = img.size
    random_w = np.random.randint(0, w - 100)
    random_h = np.random.randint(0, h - 100)
    r = img.crop((random_w, random_h, random_w + 100, random_h + 100))
    return np.asarray(r)


if __name__ == '__main__':
    # initialize a recorder
    with LogWriter(logdir="./log/image_test/train") as writer:
        for step in range(6):
            # add image data
            writer.add_image(tag="eye",
                             img=random_crop("../../docs/images/eye.jpg"),
                             step=step)
```
After running the above program, developers can launch the panel by:
```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address: `http://127.0.0.1:8080`to view:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90874434-4a746200-e3d2-11ea-9395-a039d9e83470.png" width="90%"/>
</p>


### Functional Instructions

- Developers can find target images by searching corresponded tags.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90875589-f8344080-e3d3-11ea-9020-52a5a88324ab.png" width="90%"/>
</p>


- Developers are allowed to view image data under different iterations by scrolling the Step/iteration slider.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90875652-10a45b00-e3d4-11ea-9fd9-3c79f22829f7.gif" width="60%"/>
</p>

## Audio--Audio Play

### Introduction

Audio aims to allow developers to listen to the audio in real-time during the training process, helping developers to monitor the process of speech recognition and text-to-speech.

### Record Interface

The interface of the Image is shown as follows:

```python
add_audio(tag, audio_array, step, sample_rate)
```
The interface parameters are described as follows:
| parameter | format        | meaning                                                      |
| --------- | ------------- | ------------------------------------------------------------ |
| tag      | string        | Record the name of the audio，e.g.audoi/sample. Notice that the name cannot contain `%` |
| audio_arry      | numpy.ndarray | Audio in ndarray format, whose elements are float values, and the range should be normalized in [-1, 1]                     |
| step     | int           | Record the training steps                                  |
| sample_rate | int           | Sample rate，the default sampling rate is 8000. **Please note that the rate should be the rate of the original audio**          |

### Demo
The following shows an example of using Audio to record data, and the script can be found in [Audio Demo](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/audio_test.py).

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
After running the above program, developers can launch the panel by:
```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address: `http://127.0.0.1:8080`to view:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/88753858-eaeab400-d18f-11ea-87c6-46ab7d5a5fd0.png" width="90%"/>
</p>

### Functional Instructions

- Developers can find the target audio by searching corresponded tags.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/88755034-c6dca200-d192-11ea-8349-1414bcf9d38d.png" width="80%"/>
</p>

- Developers are allowed to listen to the audio under different iterations by scrolling the Step/iteration slider.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/88755220-33f03780-d193-11ea-9b0f-a283d9f3a78a.png" width="40%"/>
</p>

- Play/Pause the audio

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/88755240-41a5bd00-d193-11ea-9780-7ae7c7792070.png" width="40%"/>
</p>

- Adjust the volume

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/88755258-53876000-d193-11ea-96b2-9ed698423202.png" width="40%"/>
</p>

- Download the audio

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/88755377-9a755580-d193-11ea-947e-4275b9d3aa54.png" width="40%"/>
</p>

## Text

### Introduction

visualizes the text output of NLP models within any stage, aiding developers to compare the changes of outputs so as to deeply understand the training process and simply evaluate the performance of the model.

### Record Interface

The interface of the Text is shown as follows:

```python
add_text(tag, text_string, step=None, walltime=None)
```

The interface parameters are described as follows:

| parameter          | format                  | meaning                                        |
| -------------- | --------------------- | ------------------------------------------- |
| tag            | string                | Record the name of the text data，e.g.train/loss. Notice that the name cannot contain `%` |
| text_string    | string                | Value of text |
| step           | int                   | Record the training steps                                  |
| walltime       | int                   | Record the time-stamp of the data, and the default is the current time-stamp      |

### Demo

The following shows an example of how to use Text component, and script can be found in [Text Demo](../../demo/components/text_test.py)

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

After running the above program, developers can launch the panel by:

```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address`http://127.0.0.1:8080` to view:

<p align="center">
  <img src="https://user-images.githubusercontent.com/28444161/106248340-cdd09400-624b-11eb-8ea9-5a07a239c365.png" width="95%"/>
</p>

### Functional Instrucions

- Developers can find the target text by searching corresponded tags.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536503-baaa4f80-bf1a-11ea-80ab-cd988617d018.png" width="40%"/>
  </p>

- Developers can find the target runs by searching corresponded tags.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/106256983-f4e09300-6256-11eb-9acc-a24a2ac9b70c.png" width="40%"/>
  </p>

- Developers can fold the tab of text.

 <p align="center">
   <img src="https://user-images.githubusercontent.com/28444161/106252364-28202380-6251-11eb-934c-d8893c2eaeca.png" width="80%"/>
 </p>


## Graph--Network Structure

### Introduction

Graph can visualize the network structure of the model by one click. It enables developers to view the model attributes, node information, searching node and so on. These functions help developers analyze model structures and understand the directions of data flow quickly.

### Record Interface

The interface of the Graph is shown as follows:

```python
add_graph(model, input_spec, verbose=False):
```

The interface parameters are described as follows:

| parameter          | format                  | meaning                                        |
| -------------- | --------------------- | ------------------------------------------- |
| model          | paddle.nn.Layer              | Dynamic model of paddle |
| input_spec     | list\[paddle.static.InputSpec\|Tensor\]   | Describes the input of the saved model's [forward arguments](https://www.paddlepaddle.org.cn/documentation/docs/zh/api/paddle/static/InputSpec_cn.html)        |
| verbose           | bool             | Whether to print graph statistic information in console.       |

**Note**

If you want to use add_graph interface, paddle package is required. Please refer to website of [PaddlePaddle](https://www.paddlepaddle.org.cn/install/quick?docurl=/documentation/docs/en/install/pip/linux-pip_en.html)。

### Demo
The following shows an example of how to use Graph component, and script can be found in [Graph Demo](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/graph_test.py)
There are two methods to launch this component:

```python
import paddle
import paddle.nn as nn
import paddle.nn.functional as F

from visualdl import LogWriter


class MyNet(nn.Layer):
    def __init__(self):
        super(MyNet, self).__init__()
        self.conv1 = nn.Conv2D(
            in_channels=1, out_channels=20, kernel_size=5, stride=1, padding=2)
        self.max_pool1 = nn.MaxPool2D(kernel_size=2, stride=2)
        self.conv2 = nn.Conv2D(
            in_channels=20,
            out_channels=20,
            kernel_size=5,
            stride=1,
            padding=2)
        self.max_pool2 = nn.MaxPool2D(kernel_size=2, stride=2)
        self.fc = nn.Linear(in_features=980, out_features=10)

    def forward(self, inputs):
        x = self.conv1(inputs)
        x = F.relu(x)
        x = self.max_pool1(x)
        x = self.conv2(x)
        x = F.relu(x)
        x = self.max_pool2(x)
        x = paddle.reshape(x, [x.shape[0], -1])
        x = self.fc(x)
        return x


net = MyNet()
with LogWriter(logdir="./log/graph_test/") as writer:
    writer.add_graph(
        model=net,
        input_spec=[paddle.static.InputSpec([-1, 1, 28, 28], 'float32')],
        verbose=True)
```



After running the above program, developers can launch the panel by:

```shell
visualdl --logdir ./log/graph_test/ --port 8080
```

Then, open the browser and enter the address`http://127.0.0.1:8080` to view:

<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175811156-a80ca0c4-207d-44d7-bd5a-9701a7875722.gif" width="80%"/>
</p>

**Note**

We provide option --model to specify model structure file in previous versions, and this option is still supported now. You can specify model exported by `add_graph` interface ("vdlgraph" contained in filename), which will be shown in dynamic graph page, and we use string "manual_input_model" in the page to denote the model you specify by this option. Other supported file formats are presented in static graph page.

For example
```shell
visualdl --model ./log/model.pdmodel --port 8080
```
which will be shown in static graph page. And
```shell
visualdl --model ./log/vdlgraph.1655783158.log --port 8080
```
shown in dynamic graph page.

### Functional Instructions

Graph page is divided into dynamic and static version currently. Dynamic version is used to visualize dynamic model of paddle, which is exported by add_graph interface.
The other is used to visualize static model of paddle, which is exported by [paddle.jit.save](https://www.paddlepaddle.org.cn/documentation/docs/en/api/paddle/jit/save_en.html) interface and other supported formats.


<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175810574-d3526ef5-859f-4ea9-b705-f55bfc8ed5af.png" width="80%"/>
</p>

**Common functions**


- Developers are allowed to drag the model up and down，left and right，zoom in and zoom out.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90878058-a097d400-e3d7-11ea-9543-bcef67ace675.gif" width="80%"/>
</p>

- Search to locate the specific node

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90878136-c0c79300-e3d7-11ea-9a14-1c1e809af442.png" width="30%"/>
</p>

- Click to view the model properties

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90878623-5531f580-e3d8-11ea-89cc-1be3500bff66.png" width="30%"/>
</p>

- Display the model information by selecting corresponded attributes

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90878712-6ed33d00-e3d8-11ea-85b9-48bf57867d30.png" width="23%"/>
</p>

- Files can be ex as PNG or SVG format

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90878893-b35ed880-e3d8-11ea-8c22-badee805bfff.png" width="30%"/>
</p>

- Click nodes to view attribute information

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90878944-c5407b80-e3d8-11ea-9db2-10e1dd1de5bf.png" width="30%"/>
</p>

- Switch the model by one-click

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90879247-34b66b00-e3d9-11ea-94ef-a26b1ba07dd0.png" width="25%"/>
</p>

**Specific feature in dynamic version**

- Fold and unfold one node
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175810800-4823b9f1-3d59-44e8-aaa5-a80577624452.png" width="80%"/>
</p>
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175810790-a35f83bf-a23c-4a28-afb7-2e0cf7711b9c.png" width="80%"/>
</p>

- Fold and unfold all nodes
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175810856-ff98a1ed-2a4f-4cc1-bc9b-3085857c0b81.png" width="80%"/>
</p>
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175810837-a0953956-7320-4e78-9c52-72ad13962216.png" width="80%"/>
</p>

- Link api specification of paddle

  If you use paddle.nn components to construct your network model, you can use alt+click mouse to direct to corresponding api specification.
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175810992-b86e9aef-e700-4c2d-bcd0-21fc96fc2564.png" width="80%"/>
</p>
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175810997-0672d836-4d7c-432d-b5de-187f97c421ae.png" width="80%"/>
</p>

**Specific feature in static version**

- Upload the model file by one-click
  - Supported model：PaddlePaddle、ONNX、Keras、Core ML、Caffe、Caffe2、Darknet、MXNet、ncnn、TensorFlow Lite
  - Experimental supported model：TorchScript、PyTorch、Torch、 ArmNN、BigDL、Chainer、CNTK、Deeplearning4j、MediaPipe、ML.NET、MNN、OpenVINO、Scikit-learn、Tengine、TensorFlow.js、TensorFlow

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90877449-a80aad80-e3d6-11ea-8016-0a2f3afe6f5e.png" width="80%"/>
</p>

## Histogram--Distribution of Tensors 

### Introduction

Histogram displays how the trend of tensors (weight, bias, gradient, etc.) changes during the training process in the form of histogram. Developers can adjust the model structures accurately by having an in-depth understanding of the effect of each layer.

### Record Interface

The interface of the Histogram is shown as follows: 

```python
add_histogram(tag, values, step, walltime=None, buckets=10)
```

The interface parameters are described as follows:

| parameter | format                | meaning                                                      |
| --------- | --------------------- | ------------------------------------------------------------ |
| tag       | string                | Record the name of the image data，e.g.train/loss. Notice that the name cannot contain `%` |
| values    | numpy.ndarray or list | Data is in ndarray or list format, which shape is (N, )        |
| step      | int                   | Record the training steps                                    |
| walltime  | int                   | Record the time-stamp of the data, and the default is the current time-stamp |
| buckets   | int                   | The number of segments to generate the histogram and the default value is 10 |

### Demo

The following shows an example of using  Histogram to record data, and the script can be found in [Histogram Demo](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/histogram_test.py)

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

After running the above program, developers can launch the panel by:

```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address: `http://127.0.0.1:8080`to view the histogram.

### Functional Instructions

- Developers are allowed to zoom in and download the histogram.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86535351-42d82700-bf12-11ea-89f0-171280e7c526.png" width="60%"/>
  </p>

- Provide two modes: Offset and Overlay.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90879332-56175700-e3d9-11ea-87c3-24682191ddd4.png" width="30%"/>
  </p>


  - Offset mode

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536435-2b9d3780-bf1a-11ea-9981-92f837d22ae5.png" width="60%"/>
  </p>


  - Overlay mode

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536458-5ab3a900-bf1a-11ea-985e-05f06c1b762b.png" width="60%"/>
  </p>

- Display the parameters、training steps and frequency by hovering on specific data points.

  - In the 240th training step, the weight is -0.0031and the frequency is 2734

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536482-80d94900-bf1a-11ea-9e12-5bea9f382b34.png" width="60%"/>
  </p>

- Developers can find target histogram by searching corresponded tags.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90879724-ebb2e680-e3d9-11ea-9e05-9bc06691ed9c.png" width="85%"/>
  </p>

- Search tags to show the histograms generated by corresponded experiments.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90879868-26b51a00-e3da-11ea-8c1d-83fb019ec668.png" width="40%"/>
  </p>

## PR Curve

### Introduction

PR Curve presents precision-recall curves in line charts, describing the tradeoff relationship between precision and recall in order to choose a best threshold.

### Record Interface

The interface of the PR Curve is shown as follows:

```python
add_pr_curve(tag, labels, predictions, step=None, num_thresholds=10)
```

The interface parameters are described as follows:

| parameter          | format                  | meaning                                        |
| -------------- | --------------------- | ------------------------------------------- |
| tag            | string                | Record the name of the image data，e.g.train/loss. Notice that the name cannot contain `%` |
| labels         | numpy.ndarray or list | Data is in ndarray or list format, which shape should be (N, ) and value should be 0 or 1            |
| predictions    | numpy.ndarray or list | Prediction data is in ndarray or list format, which shape should be (N, ) and value should in [0, 1]           |
| step           | int                   | Record the training steps                                  |
| num_thresholds | int                   | Set the number of thresholds, default as 10, maximum as 127      |
| weights        | float                 | Set the weights of TN/FN/TP/FP to calculate precision and recall      |
| walltime       | int                   | Record the time-stamp of the data, and the default is the current time-stamp      |

### Demo

The following shows an example of how to use PR Curve component, and script can be found in [PR Curve Demo](../../demo/components/pr_curve_test.py)

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

After running the above program, developers can launch the panel by:

```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address`http://127.0.0.1:8080` to view:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90879904-37fe2680-e3da-11ea-9369-2513620bf541.png" width="85%"/>
</p>

### Functional Instrucions

- Developers can zoom in, restore, and download PR Curves

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86740067-f18e7b80-c068-11ea-96bf-52cb7da1f799.png" width="40%"/>
  </p>

- Developers hover on the specific data point to learn about the detailed information: TP, TN, FP, FN and the corresponded thresholds

    <p align="center">
      <img src="https://user-images.githubusercontent.com/48054808/90879971-4e0be700-e3da-11ea-989a-777b977c271d.png" width="50%"/>
    </p>

- The targeted PR Curves can be displayed by searching tags

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90880145-8e6b6500-e3da-11ea-8f06-28248ee2eb84.png" width="80%"/>
  </p>

- Developers can find specific labels by searching tags or view the all labels

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90880173-9fb47180-e3da-11ea-8704-34cc55c0a844.png" width="30%"/>
</p>

- Developers is able to observe the changes of PR Curves across training steps

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90880301-d2f70080-e3da-11ea-97e0-952b389f8010.png" width="30%"/>
  </p>

- There are three measurement scales of X axis

  1. Step: number of iterations
  2. Walltime: absolute training time
  3. Relative: training time

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90880354-eace8480-e3da-11ea-921f-20f363eb1b1d.png" width="30%"/>
  </p>

## ROC Curve

### Introduction

ROC Curve shows the performance of a classification model at all classification thresholds; the larger the area under the curve, the better the model performs, aiding developers to evaluate the model performance and choose an appropriate threshold.

### Record Interface

The interface of the PR Curve is shown as follows:

```python
add_roc_curve(tag, labels, predictions, step=None, num_thresholds=10)
```

The interface parameters are described as follows:

| parameter          | format                  | meaning                                        |
| -------------- | --------------------- | ------------------------------------------- |
| tag            | string                | Record the name of the image data，e.g.train/loss. Notice that the name cannot contain `%` |
| values         | numpy.ndarray or list | Data is in ndarray or list format, which shape should be (N, ) and value should be 0 or 1            |
| predictions    | numpy.ndarray or list | Prediction data is in ndarray or list format, which shape should be (N, ) and value should in [0, 1]             |
| step           | int                   | Record the training steps                                  |
| num_thresholds | int                   | Set the number of thresholds, default as 10, maximum as 127      |
| weights        | float                 | Set the weights of TN/FN/TP/FP to calculate precision and recall      |
| walltime       | int                   | Record the time-stamp of the data, and the default is the current time-stamp      |

### Demo

The following shows an example of how to use ROC curve component, and script can be found in [ROC Curve Demo](../../demo/components/roc_curve_test.py)

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

After running the above program, developers can launch the panel by:

```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address`http://127.0.0.1:8080` to view:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/103344081-8928d000-4ac8-11eb-84d0-28f249886172.gif" width="85%"/>
</p>

*Note: the use of ROC Curve in the frontend is the same as that of PR Curve, please refer to the instructions in PR Curve section if needed.

## High Dimensional--Data Dimensionality Reduction

### Introduction

High Dimensional projects high-dimensional data into a low dimensional space, aiding users to have an in-depth analysis of the relationship between high-dimensional data. Three dimensionality reduction algorithms are supported:

 - PCA : Principle Component Analysis 
 - t-SNE : t-distributed Stochastic Neighbor Embedding 
 - umap: Uniform Manifold Approximation and Projection

### Record Interface

The interface of the High Dimensional is shown as follows:

```python
add_embeddings(tag, labels, hot_vectors, walltime=None)
```
The interface parameters are described as follows:
| parameter   | format              | meaning                                                      |
| ----------- | ------------------- | ------------------------------------------------------------ |
| tag         | string              | Record the name of the high dimensional data, e.g.`default`. Notice that the name cannot contain `%` |
| labels      | numpy.array or list | Represents the label of hot_vectors. The shape of `labels` should be (N, ) if only one dimension, and should be (M, N) if dimension of `labels` more than one, where each element is a one-dimensional label array. Each element is string type. |
| hot_vectors | numpy.array or list | Each element can be seen as a feature of the tag corresponding to the label. |
| labels_meta | numpy.array or list | The labels of parameter `labels` correspond to `labels` one-to-one. If not specified, the default value `__metadata__` will be used. When parameter `labels` is a one-dimensional array, there is no need to specify this parameter  |
| walltime    | int                 | Record the time stamp of the data, the default is the current time stamp. |

### Demo
The following shows an example of how to use High Dimensional component, and script can be found in [High Dimensional Demo](../../demo/components/high_dimensional_test.py)
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
    # initialize a recorder
    with LogWriter(logdir="./log/high_dimensional_test/train") as writer:
        # recorde a set of labels and corresponding hot_vectors to the recorder 
        writer.add_embeddings(tag='default',
                              labels=labels,
                              hot_vectors=hot_vectors)
```
After running the above program, developers can launch the panel by:
```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address`http://127.0.0.1:8080` to view:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/103188111-1b32ac00-4902-11eb-914e-c2368bdb8373.gif" width="85%"/>
</p>

### Functional Instrucions

* Developers are allowed to select specific runs of data or certain labels of data to display

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103191809-4e306c00-4911-11eb-853f-e143ef86e182.png" width="30%"/>
  </p>

* TSNE

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103192762-cea49c00-4914-11eb-896c-070b0bf0e2ea.png" width="27%"/>
  </p>

* PCA

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103192341-47a2f400-4913-11eb-9995-fdc0acadbdc9.png" width="27%"/>
  </p>

* UMAP

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/103192766-d2d0b980-4914-11eb-871e-e4b31542c5e9.png" width="27%"/>
  </p>

## HyperParameters--HyperParameter Visualization

### Introduction

HyperParameters visualize the relationship between hyperparameters and model metrics (such as accuracy and loss) in a rich view, helping you identify the best hyperparameters in an efficient way.

### Record Interface

The interface of the HyperParameters is slightly different from other components'. Firstly, you need to use the `add_hparams` to record the hyperparameter data(`hparams_dict`) and specify the name of the metrics(`metrics_list`). Then, for the metrics you just added, you need to record those metrics values by using `add_scalar`. In this way you can get all data for HpyerParameters Visualization.

```python
add_hparams(hparam_dict, metric_list, walltime=None):
```
The interface parameters are described as follows:
| parameter   | format              | meaning     |
| ----------- | ------------------- | ---------------------------------- |
| hparam_dict |       dict          | name and data of hparams.          |
| metric_list |       list          | The metrics name to be recorded later corresponds to the `tag` parameter in the `add_scalar` interface, and VisualDL corresponds to the indicator data through the `tag`. |
| walltime    |       int           | Record the time stamp of the data, the default is the current time stamp.  |

### Demo
The following shows an example of how to use HyperParameters component, and script can be found in [HyperParameters Demo](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/components/hparams_test.py)
```python
from visualdl import LogWriter

# This demo demonstrates the hyperparameter records of two experiments. Take the first
# experiment data as an example, First, record the data of the hyperparameter `hparams`
# in the `add_hparams` interface. Then specify the name of `metrics` to be recorded later.
# Finally, use `add_scalar` to specifically record the data of `metrics`. Note that the
# `metrics_list` parameter in the `add_hparams` interface needs to include the `tag`
# parameter of the `add_scalar` interface.
if __name__ == '__main__':
    # Record the data of the first experiment
    with LogWriter('./log/hparams_test/train/run1') as writer:
        # Record the value of `hparams` and the name of `metrics`
        writer.add_hparams(hparams_dict={'lr': 0.1, 'bsize': 1, 'opt': 'sgd'},
                           metrics_list=['hparam/accuracy', 'hparam/loss'])
        # Record the metrics values ​​of different steps in an experiment by matching
        # the `tag` in the `add_scalar` interface with `metrics_list` in `add_hparams` interface.
        for i in range(10):
            writer.add_scalar(tag='hparam/accuracy', value=i, step=i)
            writer.add_scalar(tag='hparam/loss', value=2*i, step=i)

    # Record the data of the second experiment
    with LogWriter('./log/hparams_test/train/run2') as writer:
        # Record the value of `hparams` and the name of `metrics`
        writer.add_hparams(hparams_dict={'lr': 0.2, 'bsize': 2, 'opt': 'relu'},
                           metrics_list=['hparam/accuracy', 'hparam/loss'])
        # Record the metrics values ​​of different steps in an experiment by matching
        # the `tag` in the `add_scalar` interface with `metrics_list` in `add_hparams` interface.
        for i in range(10):
            writer.add_scalar(tag='hparam/accuracy', value=1.0/(i+1), step=i)
            writer.add_scalar(tag='hparam/loss', value=5*i, step=i)
```
After running the above program, developers can launch the panel by:
```shell
visualdl --logdir ./log --port 8080
```

Then, open the browser and enter the address`http://127.0.0.1:8080` to view:

<p align="center">
<img src="https://user-images.githubusercontent.com/28444161/119247155-e9c0c280-bbb9-11eb-8175-58a9c7657a9c.gif" width="85%"/>
</p>

### Functional Instrucions

* Table View
  - The table view can be displayed in a sorted order.
  - Trial ID represents a specific experiment name, the column name displayed in other normal fonts is the hyperparameter name, and the column displayed in bold font is the metric name.
  - The position of hyperparameters and metrics can be customized by dragging.
  - The column width of the table view can be adjusted by dragging.
  - You can click to expand to view the scalar of the metrics.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/119219705-75364700-bb19-11eb-9077-064337ae95be.png" width="85%"/>
  </p>

* Parallel Coordinates View
  - The specific values ​​of hyperparameters and metrics in a certain set of experiments can be displayed by hovering.
  - Scalar of the metrics in this group of experiments can be displayed by selecting a certain curve.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/119221098-440d4500-bb20-11eb-8b26-d29f95147c04.png" width="85%"/>
  </p>

* Scatter Plot Matrix View
  - The specific values ​​of hyperparameters and metrics in a certain set of experiments can be displayed by hovering.
  - Scalar of the metrics in this group of experiments can be displayed by selecting a certain point.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/119221108-54252480-bb20-11eb-9a8f-1d082c36402b.png" width="85%"/>
  </p>

* Scalar of Metrics
  - Can be viewed in table view, parallel coordinates view and scatter plot matrix view.
  - Scalar of the metrics viewed here can also be viewed under the `SCALARS` board.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/119221127-6901b800-bb20-11eb-84f0-407bd7241bc7.png" width="85%"/>
  </p>

* Hyperparameter/metric range selection
  - Display part of the data by selecting the range of hyperparameters or metrics.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/119221141-78810100-bb20-11eb-9e06-5b345459310a.png" width="20%"/>
  </p>

* download data
  - Two formats can be selected, CSV or TSV.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/119221157-8b93d100-bb20-11eb-9c9e-7540b3cb92a1.png" width="20%"/>
  </p>

## VDL.service

### Introduction

VDL.service enables developers to easily save, track and share visualization results with anyone for free.

### Usage Steps

1. Make sure that your get the lastest version of VisualDL, if not, please update by:

```
pip install visualdl --upgrade

```

2. Upload log/model to save, track and share the visualization results.

```
visualdl service upload --logdir ./log \
                        --model ./__model__
```                       
                       
3. An unique URL will be given. Then you can view the visualization results by simply copying and pasting the URL to the browser. 

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/93733769-5ccc0080-fc09-11ea-88c0-6f17c04ebdce.png" width="100%"/>
  </p>
  
   <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/93734496-057b5f80-fc0c-11ea-9b52-229ff8847bc0.png" width="100%"/>
  </p>
