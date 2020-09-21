[**中文**](./README.md)

# VisualDL Guide

### Overview

VisualDL is a visualization tool designed for Deep Learning. VisualDL provides a variety of charts to show the trends of parameters. It enables users to understand the training process and model structures of Deep Learning models more clearly and intuitively so as to optimize models efficiently.

Currently, VisualDL provides seven components: scalar, image, audio, graph, histogram, pr curve and high dimensional. VisualDL iterates rapidly and new functions will be continuously added.




|                        Component Name                        |         Display Chart         | Function                                                     |
| :----------------------------------------------------------: | :---------------------------: | :----------------------------------------------------------- |
|                [ Scalar](#Scalar--Line-Chart)                |          Line Chart           | Display scalar data such as loss and accuracy dynamically.   |
|             [Image](#Image--Image-Visualization)             |      Image Visualization      | Display images, visualizing the input and the output and making it easy to view the changes in the intermediate process. |
|             [Audio](#Audio--Audio-Play)             |      Audio Play      | Play the audio during the training process, making it easy to monitor the process of speech recognition and text-to-speech. |
|              [Graph](#Graph--Network-Structure)              |       Network Structure       | Visualize network structures, node attributes and data flow, assisting developers to learn and to optimize network structures. |
|       [Histogram](#Histogram--Distribution-of-Tensors)       |    Distribution of Tensors    | Present the changes of distributions of tensors, such as weights/gradients/bias, during the training process. |
|                   [PR Curve](#PR-Curve)                   |   Precision & Recall Curve    | Display precision-recall curves across training steps, clarifying the tradeoff between precision and recall when comparing models. |
| [High Dimensional](#High-Dimensional--Data-Dimensionality-Reduction) | Data Dimensionality Reduction | Project high-dimensional data into 2D/3D space for embedding visualization, making it convenient to observe the correlation between data. |

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
  <img src="https://user-images.githubusercontent.com/48054808/90884963-4dc41980-e3e3-11ea-824a-277a8d71823e.png" width="100%"/>
</p>
*For more specific details of how to compare multiple experiments, pleas refer to the project on AI Studio：[VisualDL 2.0--Visualization of eye disease recognition training](https://aistudio.baidu.com/aistudio/projectdetail/502834)

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
| img       | numpy.ndarray | Images in ndarray format                                     |
| step      | int           | Record the training steps                                    |
| walltime  | int           | Record the time-stamp of the data, the default is the current time-stamp |
| dataformats| string       | Format of image，include `NCHW`、`HWC`、`HW`，default is `HWC`|

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
| audio_arry      | numpy.ndarray | Audio in ndarray format                     |
| step     | int           | Record the training steps                                  |
| sample_rate | int           | Sample rate，**Please note that the rate should be the rate of the original audio**          |

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
  <img src="https://user-images.githubusercontent.com/48054808/90877274-6548d580-e3d6-11ea-9804-74a1ead47b30.png" width="80%"/>
</p>

### Functional Instructions

- Upload the model file by one-click
  - Supported model：PaddlePaddle、ONNX、Keras、Core ML、Caffe、Caffe2、Darknet、MXNet、ncnn、TensorFlow Lite
  - Experimental supported model：TorchScript、PyTorch、Torch、 ArmNN、BigDL、Chainer、CNTK、Deeplearning4j、MediaPipe、ML.NET、MNN、OpenVINO、Scikit-learn、Tengine、TensorFlow.js、TensorFlow

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90877449-a80aad80-e3d6-11ea-8016-0a2f3afe6f5e.png" width="80%"/>
</p>

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
| values         | numpy.ndarray or list | Data is in ndarray or list format            |
| predictions    | numpy.ndarray or list | Prediction data is in ndarray or list format            |
| step           | int                   | Record the training steps                                  |
| num_thresholds | int                   | Set the number of thresholds, default as 10, maximum as 127      |
| weights        | float                   | Set the weights of TN/FN/TP/FP to calculate precision and recall      |
| walltime       | int                   | Record the time-stamp of the data, and the default is the current time-stamp      |

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
  <img src="https://user-images.githubusercontent.com/48054808/90880543-341ed400-e3db-11ea-8fdc-8b914704b916.GIF" width="80%"/>
</p>

### Functional Instrucions

* Developers are allowed to select specific run of data to display

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90880592-48fb6780-e3db-11ea-9d87-bd54716839aa.png" width="30%"/>
  </p>

* Developers can find specific labels by searching tags or view the all labels

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90880759-9aa3f200-e3db-11ea-8b66-ecc890ffdaf9.png" width="30%"/>
  </p>

* Support "2D" or "3D" forms to display the high-dimensional data distribution

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90880813-ad1e2b80-e3db-11ea-8540-5e78075dfb69.png" width="27%"/>
  </p>

* PCA and T-SNE are supported

  <p align="center">
    <img src="https://user-images.githubusercontent.com/48054808/90880856-bf986500-e3db-11ea-8ffd-261b56d8e730.png" width="27%"/>
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
