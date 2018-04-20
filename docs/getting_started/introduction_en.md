<p align="center">
  <img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/images/vs-logo.png" width="60%" />
</p>

# Introduction
VisualDL is a deep learning visualization tool that can help design deep learning jobs.
It includes features such as scalar, parameter distribution, model structure and image visualization.
Currently it is being developed at a high pace.
New features will be continuously added.

At present, most DNN frameworks use Python as their primary language. VisualDL supports Python by nature.
Users can get plentiful visualization results by simply add a few lines of Python code into their model before training.

Besides Python SDK, VisualDL was writen in C++ on the low level. It also provides C++ SDK that
can be integrated into other platforms.  

## Why should I use VisualDL?
Visual DL has the following advantages:

### Visualization
At present, most deep learning frameworks are using Python. The status of training process is recorded by logs.
This method can show short-term training status. But it can hardly show long-term trends. Visual DL can help you visualize the whole training process and construct plots as below:
<p align="center">
<img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/getting_started/scalar.png" height="300"/>
</p>

### Easy to Integrate

Visual DL provides independent Python SDK. If the training task is based on Python, user can simply
use Visual DL by installing the Visual DL wheel package and importing it into her/his own project.
Please refer to Installation for more details.

### Easy to Use
- Add log collecting logic to your own Python code.

```python
import visualdl

log_writer = LogWriter("./log", sync_cycle=300)
with log_writer.mode('train') as logger:
	loss_writer = logger.scalar("loss")

for step in steps:
	loss = train_process() // Insert your training code here
	loss_writer.add_record(step, loss)
```

- Launch Visual DL service and you can see the visualization results.

```shell
visualDL --logdir ./log --port 8080
```

### Comprehensive Usability

1. Scalar: support scalar line/dot data visualization, like the figure above.
    - can show metrics such as loss, accuracy, etc via lines and dots and let user see trends easily
    - can draw several curves in one figure so that it is easy to compare various metrics

2. Image: support image display.
    - display input and intermediate images, easy to check data sample
    - support display for convolutional layer, easy to see results after each layer
        <p align="left">
        <img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/getting_started/dog.png" height="300" width="300"/>
        </p>
	- support image-generating tasks to preview generated image
        <p align="left">
        <img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/getting_started/image-gan.png" height="300" width="300"/>
        </p>

3. Histogram: display of parameter distribution, easy to check distribution curves in each tensor,
show the trend of parameter distribution.

	- help users understand the training process and the underneath reason for the change from one parameter distribution to another
	- help users judge if the training is on the track. For example, if parameter change rate becomes close to 0 or grows rapidly,
	then exploding and vanishing gradients might happen
        <p align="left">
        <img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/getting_started/histogram.png" />
        </p>

4. Graph: visualize the model structure of deep learning networks.
    - Graph supports the preview of [ONNX](http://onnx.ai/) model. Since models of MXNet, Caffe2, PyTorch and CNTK can be converted to ONNX models easily,
    Visual DL can also support these models indirectly
    - easy to see wrong configuration of a network
    - help understand network structure
        <p align="left">
        <img src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/docs/getting_started/graph.png" height="250" width="400"/>
        </p>

### Purely Open Source
As a deep learning visualization tool, Visual DL support most deep learning frameworks. On the SDK perspective,
it is easy to integrate into Python and C++ projects. Through ONNX, Visual DL's Graph component can support
many popular frameworks such as PaddlePaddle, MXNet, PyTorch and  Caffe2.

Welcome everyone to comment and contribute to make Visual DL easier to use, with more features.
