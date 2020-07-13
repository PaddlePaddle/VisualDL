[**中文**](./docs/components/README.md)

# VisualDL Guide

### Overview

VisualDL is a visualization tool designed for Deep Learning. VisualDL provides a variety of charts to show the trends of parameters. It enables users to understand the training process and model structures of Deep Learning models more clearly and intuitively so as to optimize models efficiently.

Currently, VisualDL provides six components: scalar, image, graph, histogram, pr curve and high dimensional. VisualDL iterates rapidly and new functions will be continuously added.



|                        component name                        |         display chart         | function                                                     |
| :----------------------------------------------------------: | :---------------------------: | :----------------------------------------------------------- |
|                [ Scalar](#Scalar--Line-Chart)                |          line chart           | Display scalar data such as loss and accuracy dynamically.   |
|             [Image](#Image--Image-Visualization)             |      image visualization      | Display images, visualizing the input and the output and making it easy to view the changes in the intermediate process. |
|              [Graph](#Graph--Network-Structure)              |       network structure       | Visualize network structures, node attributes and data flow, assisting developers to learn and to optimize network structures. |
|       [Histogram](#Histogram--Distribution-of-Tensors)       |    distribution of tensors    | Present the changes of distributions of tensors, such as weights/gradients/bias, during the training process. |
|                   [PR Curve](#PR-曲线组件)                   |   Precision & Recall Curve    | Display precision-recall curves across training steps, clarifying the tradeoff between precision and recall when comparing models. |
| [High Dimensional](#High-Dimensional--Data-Dimensionality-Reduction) | data dimensionality reduction | Project high-dimensional data into 2D/3D space for embedding visualization, making it convenient to observe the correlation between data. |



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
| value     | float  | Record the data                                              |
| step      | int    | Record the training steps                                    |
| walltime  | int    | Record the time-stamp of the data, the default is the current time-stamp |

*Note that the rules of specifying tags (e.g.train/acc) are:

1. The tag before the first  `/` is the parent tag and serves as the tag of the same raw
2. The tag after the first `/` is a child tag, the charts with child tag will be displayed under the parent tag
3. Users can use multiple `/`, but the tag of a raw is the parent tag--the tag before the first `/`

Here are three examples:

- When 'train' is created as the parent tag and 'acc' and 'loss' are created as child tags：`train/acc`、 `train/loss`，the tag of a raw is 'train' , which includes two sub charts--'acc' and 'loss':

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84653342-d6d05780-af3f-11ea-8979-8da039ae7201.JPG" width="100%"/>
</p>

- When 'train' is created as the parent tag, and 'test/acc' and 'test/loss' are created as child tags：`train/test/acc`、 `train/test/loss`, the tag of a raw is 'train', which includes two sub charts--'test/acc' and 'test/loss': 

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84644066-3bd08100-af31-11ea-8eb5-c4a4cab351ed.png" width="100%"/>
</p>

- When two parent tags are created：`acc`、 `loss`， two rows of charts are named as 'acc' and 'loss' respectively.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84644323-99fd6400-af31-11ea-9855-eca7f7b01810.png" width="100%"/>
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
  <img src="https://user-images.githubusercontent.com/48054808/82397559-478c6d00-9a83-11ea-80db-a0844dcaca35.png" width="100%"/>
</p>

- Advanced Usage--Comparison of Multiple Experiments

The following shows the comparison of multiple sets of experiments using Scalar.

There are two steps to achieve this function:

1. Create sub-log files to store the parameter data of each group of experiments
2. When recording data to the scalar component，developers can compare **the same type of parameters for different experiments**  by **using the same tag**

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
  <img src="https://user-images.githubusercontent.com/48054808/84644158-5efb3080-af31-11ea-8e64-bbe4078425f4.png" width="100%"/>
</p>
*For more specific details of how to compare multiple experiments, pleas refer to the project on AI Studio：[VisualDL 2.0--Visualization of eye disease recognition training](https://aistudio.baidu.com/aistudio/projectdetail/502834)

### Functional Instruction

* Developers are allowed to zoom in, restore, transform of the coordinate axis (y-axis logarithmic coordinates), download the line chart.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-icon.png" width="55%"/>
</p>



* Details can be shown by hovering on specific data points.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-tooltip.png" width="60%"/>
</p>



* Developers can find target images by searching corresponded image tags.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-searchlabel.png" width="90%"/>
</p>



* Specific runs can be selected by searching for the corresponded  experiment tags.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-searchstream.png" width="40%"/>
</p>


* There are three measurement scales of X axis

1. Step: number of iterations
2. Walltime: absolute training time
3. Relative: training time

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/x-axis.png" width="40%"/>
</p>
* The smoothness of the curve can be adjusted to better show the change of the overall trend.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/scalar-smooth.png" width="37%"/>
</p>


## Image--Image Visualization

### Introduction

The Image is used to present the change of image data during training. Developers can view images in different training stages by adding few lines of codes to record images in a log file.

### Record Interface

The interface of the Image is shown as follows:

```python
add_image(tag, img, step, walltime=None)
```
The interface parameters are described as follows:
| parameter | format        | meaning                                                      |
| --------- | ------------- | ------------------------------------------------------------ |
| tag       | string        | Record the name of the image data，e.g.train/loss. Notice that the name cannot contain `%` |
| img       | numpy.ndarray | Images in ndarray format                                     |
| step      | int           | Record the training steps                                    |
| walltime  | int           | Record the time-stamp of the data, the default is the current time-stamp |

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
  <img src="https://user-images.githubusercontent.com/48054808/82397685-86babe00-9a83-11ea-870e-502f313bdc7c.png" width="90%"/>
</p>


### Functional Instructions

- Developers can find target images by searching corresponded tags.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/image-search.png" width="90%"/>
</p>


- Developers are allowed to view image data under different iterations by scrolling the Step/iteration slider.

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/image-eye.gif" width="60%"/>
</p>

## Graph--Network Structure

### Introduction

Graph can visualize the network structure of the model by one click. It enables developers to view the model attributes, node information, searching node and so on. These functions help developers analyze model structures and understand the directions of data flow quickly.

### Demo
There are two methods to launch this component:

- By the front end:

  - If developers only need to use Graph, developers can launch VisualDL (Graph) by executing `visualdl`on the command line.
  - If developers need to use Graph and other functions at the same time, they need to specify the log file path (using `./log` as an example):

  ```shell
  visualdl --logdir ./log --port 8080
  ```


- By the backend:

  - Add the parameter `--model` and specify the **model file** path (not the folder path) to launch the panel:

  ```shell
  visualdl --model ./log/model --port 8080
  ```


After the launch, developers can view the network structure:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84490149-51e20580-acd5-11ea-9663-1f156892c0e0.png" width="80%"/>
</p>

### Functional Instructions

- Upload the model file by one-click
  - Supported model：PaddlePaddle、ONNX、Keras、Core ML、Caffe、Caffe2、Darknet、MXNet、ncnn、TensorFlow Lite
  - Experimental supported model：TorchScript、PyTorch、Torch、 ArmNN、BigDL、Chainer、CNTK、Deeplearning4j、MediaPipe、ML.NET、MNN、OpenVINO、Scikit-learn、Tengine、TensorFlow.js、TensorFlow

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487396-44c31780-acd1-11ea-831a-1632e636613d.png" width="80%"/>
</p>

- Developers are allowed to drag the model up and down，left and right，zoom in and zoom out.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487568-8784ef80-acd1-11ea-9da1-befedd69b872.GIF" width="80%"/>
</p>

- Search to locate the specific node

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487694-b9965180-acd1-11ea-8214-34f3febc1828.png" width="30%"/>
</p>

- Click to view the model properties

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487751-cadf5e00-acd1-11ea-9ce2-4fdfeeea9c5a.png" width="30%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487759-d03ca880-acd1-11ea-9294-520ef7f9e0b1.png" width="30%"/>
</p>

- Display the model information by selecting corresponded attributes

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487829-ee0a0d80-acd1-11ea-8563-6682a15483d9.png" width="23%"/>
</p>

- Files can be ex as PNG or SVG format

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487884-ff531a00-acd1-11ea-8b12-5221db78683e.png" width="30%"/>
</p>

- Click nodes to view attribute information

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487941-13971700-acd2-11ea-937d-42fb524b9ee1.png" width="30%"/>
</p>

- Switch the model by one-click

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/84487998-27db1400-acd2-11ea-83d7-5d75832ef41d.png" width="25%"/>
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
| values    | numpy.ndarray or list | Data is in ndarray or list format                            |
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
    <img src="https://user-images.githubusercontent.com/48054808/86535413-c134c900-bf12-11ea-9ad6-f0ad8eafa76f.png" width="30%"/>
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
    <img src="https://user-images.githubusercontent.com/48054808/86536503-baaa4f80-bf1a-11ea-80ab-cd988617d018.png" width="40%"/>
  </p>

- Search tags to show the histograms generated by corresponded experiments.

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86536639-b894c080-bf1b-11ea-9ee5-cf815dd4bbd7.png" width="40%"/>
  </p>

## PR Curve--PR 曲线组件

### Introduction

PR Curve presents precision-recall curves in line charts, describing the tradeoff relationship between precision and recall in order to choose a best threshold.

### Record Interface

The interface of the PR Curve is shown as follows:

```python
add_pr_curve(tag, labels, predictions, step=None, num_thresholds=10)
```

The interface parameters are described as follows:

| 参数           | 格式                  | 含义                                        |
| -------------- | --------------------- | ------------------------------------------- |
| tag            | string                | 记录指标的标志，如`train/loss`，不能含有`%` |
| values         | numpy.ndarray or list | 以ndarray或list格式表示的实际类别           |
| predictions    | numpy.ndarray or list | 以ndarray或list格式表示的预测类别           |
| step           | int                   | 记录的步数                                  |
| num_thresholds | int                   | 阈值设置的个数，默认为10，最大值为127       |

### Demo

The following shows an example of how to use High Dimensional component, and script can be found in [PR Curve Demo](../../demo/components/pr_curve_test.py)

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
  <img src="https://user-images.githubusercontent.com/48054808/86738774-ee46c000-c067-11ea-90d2-a98aac445cca.png" width="80%"/>
</p>

### Functional Instrucions

- Developers can zoom in, restore, and download PR Curves

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86740067-f18e7b80-c068-11ea-96bf-52cb7da1f799.png" width="40%"/>
  </p>

- Developers hover on the specific data point to learn about the detailed information: TP, TN, FP, FN and the corresponded thresholds

    <p align="center">
      <img src="https://user-images.githubusercontent.com/48054808/86740477-43370600-c069-11ea-93f0-f4d05445fbab.png" width="50%"/>
    </p>

- The targeted PR Curves can be displayed by searching tags

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86740670-66fa4c00-c069-11ea-9ee3-0a22e2d0dbec.png" width="30%"/>
  </p>

- Developers can find specific labels by searching tags or view the all labels

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/86740817-809b9380-c069-11ea-9453-6531e3ff5f43.png" width="30%"/>
</p>

- Developers is able to observe the changes of PR Curves across training steps

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86741057-b04a9b80-c069-11ea-9fef-2dcc16f9cd46.png" width="30%"/>
  </p>

- There are three measurement scales of X axis

  1. Step: number of iterations
  2. Walltime: absolute training time
  3. Relative: training time

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/86741304-db34ef80-c069-11ea-86eb-787b49ed3705.png" width="30%"/>
  </p>

## High Dimensional--Data Dimensionality Reduction

### Introduction

High Dimensional projects high-dimensional data into a low dimensional space, aiding users to have an in-depth analysis of the relationship between high-dimensional data. Two dimensionality reduction algorithms are supported:

 - PCA : Principle Component Analysis 
 - t-SNE : t-distributed Stochastic Neighbor Embedding 

### Record Interface

The interface of the High Dimensional is shown as follows:

```python
add_embeddings(tag, labels, hot_vectors, walltime=None)
```
The interface parameters are described as follows:
| parameter   | format              | meaning                                                      |
| ----------- | ------------------- | ------------------------------------------------------------ |
| tag         | string              | Record the name of the high dimensional data, e.g.`default`. Notice that the name cannot contain `%` |
| labels      | numpy.array or list | Labels are represented by one-dimensional array. Each element is string type. |
| hot_vectors | numpy.array or list | Each element can be seen as a feature of the tag corresponding to the label. |
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
  <img src="https://visualdl.bj.bcebos.com/images/dynamic_high_dimensional.gif" width="80%"/>
</p>

### Functional Instrucions

* Developers are allowed to select specific run of data to display

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/83006541-f6f9ae80-a044-11ea-82d9-03f1c99a310a.png" width="30%"/>
  </p>

* Developers can find specific labels by searching tags or view the all labels

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/83006580-0842bb00-a045-11ea-9f7b-776f80ae8b90.png" width="30%"/>
  </p>

* Support "2D" or "3D" forms to display the high-dimensional data distribution

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/83006687-2f998800-a045-11ea-888e-2b59e16a92b9.png" width="27%"/>
  </p>

* PCA and T-SNE are supported

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/83006747-3fb16780-a045-11ea-83e0-a314b7765108.png" width="27%"/>
  </p>
