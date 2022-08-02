[**中文**](./README_CN.md)


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
<a href="javascript:void(0)"><img src="https://img.shields.io/badge/QQ_Group-1045783368-52B6EF?style=social&logo=tencent-qq&logoColor=000&logoWidth=20" alt="QQ Group" /></a>
</p>


## Introduction

VisualDL, a visualization analysis tool of PaddlePaddle, provides a variety of charts to show the trends of parameters, and visualizes model structures, data samples, histograms of tensors, PR curves , ROC curves and high-dimensional data distributions. It enables users to understand the training process and the model structure more clearly and intuitively so as to optimize models efficiently.

VisualDL provides various visualization functions, including **tracking metrics in real-time, visualizing the model structure, displaying the data sample, visualizing the relationship between hyperparameters and model metrics, presenting the changes of distributions of tensors, showing the pr curves, projecting high-dimensional data to a lower dimensional space, visualize the model and more.** Additionally, VisualDL provides VDL.service, which enables developers easily to save, track and share visualization results of experiments. For specific guidelines of each function, please refer to  [**VisualDL User Guide**](./docs/components/README.md). For up-to-date experience, please feel free to try our [**Online Demo**](https://www.paddlepaddle.org.cn/paddle/visualdl/demo). Currently, VisualDL iterates rapidly and new functions will be continuously added.

Browsers supported by VisualDL are:

- Google Chrome ≥ 79
- Firefox ≥ 67
- Microsoft Edge ≥ 79
- Safari ≥ 11.1

VisualDL natively supports the use of Python. Developers can retrieve plentiful visualization results by simply adding a few lines of Python code into the model before training.



## Contents

* [Key Highlights](#Key-Highlights)
* [Installation](#Installation)
* [Usage Guideline](#Usage-Guideline)
* [Function Preview](#Function-Preview)
* [Frequently Asked Questions](#Frequently-Asked-Questions)
* [Contribution](#Contribution)
* [More Details](#More-Details)
* [Technical Communication](#Technical-Communication)



## Key Highlights

### Easy to Use

The high-level design of API makes it easy to use. Only one click can initiate the visualization of model structures.


### Various Functions

The function contains the visualization of training parameters, data samples, graph structures, histograms of tensors, PR curves and high-dimensional data distributions.

### High Compatibility

VisualDL provides the visualization of the mainstream model structures such as Paddle, ONNX, Caffe, widely supporting visual analysis for diverse users.

### Fully Support

By Integrating into PaddlePaddle and related modules, VisualDL allows developers to use different components without obstructions, and thus to have the best experience in the PaddlePaddle ecosystem.

## Installation


### Install by PiP

```shell
python -m pip install visualdl -i https://mirror.baidu.com/pypi/simple
```

### Install by Code

```
git clone https://github.com/PaddlePaddle/VisualDL.git
cd VisualDL

python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```

Please note that Python 2 is no longer maintained officially since January 1, 2020. VisualDL now only supports Python 3 in order to ensure the usability of codes.


## Usage Guideline

VisualDL stores the data, parameters and other information of the training process in a log file. Users can launch the panel to observe the visualization results.

### 1. Log

The Python SDK is provided at the back end of VisualDL, and a logger can be customized through LogWriter. The interface description is shown as follows:

```python
class LogWriter(logdir=None,
                max_queue=10,
                flush_secs=120,
                filename_suffix='',
                **kwargs)
```

#### Interface Parameters

| parameters      | type    | meaning                                                      |
| --------------- | ------- | ------------------------------------------------------------ |
| logdir          | string  | The path location of log file. VisualDL will create a log file under this path to record information generated by the training process. If not specified, the path will be  `runs/${CURRENT_TIME}`as default. |
| max_queue       | int     | The maximum capacity of the data generated before recording in a log file. Default value is 10. If the capacity is reached, the data are immediately written into the log file. |
| flush_secs      | int     | The maximum cache time of the data generated before recording in a log file. Default value is 120. When this time is reached, the data are immediately written to the log file. (When the log message queue reaches the maximum cache time or maximum capacity, it will be written to the log file immediately)|
| filename_suffix | string  | Add a suffix to the default log file name.                   |
| display_name    | string  | This parameter is displayed in the location of `Select Data Stream` in the panel. If not set, the default name is `logdir`.(When `logdir` is too long or needed to be hidden). |
| file_name    | string  | Set the name of the log file. If the file_name already exists, setting the file_name will be new records in the same log file, which will continue to be used. Note that the name should include 'vdlrecords'. |
<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/103187556-b9714280-48ff-11eb-9052-008e02a21199.png" width="100%"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/103187552-b4ac8e80-48ff-11eb-998a-57d5a1bc7ee6.png" width="100%"/>
</p>


#### Example

Create a log file and record scalar values:

```python
from visualdl import LogWriter

# create a log file under `./log/scalar_test/train`
with LogWriter(logdir="./log/scalar_test/train") as writer:
    # use `add_scalar` to record scalar values
    writer.add_scalar(tag="acc", step=1, value=0.5678)
    writer.add_scalar(tag="acc", step=2, value=0.6878)
    writer.add_scalar(tag="acc", step=3, value=0.9878)
# you can also use the following method without using context manager `with`:
"""
writer = LogWriter(logdir="./log/scalar_test/train")

writer.add_scalar(tag="acc", step=1, value=0.5678)
writer.add_scalar(tag="acc", step=2, value=0.6878)
writer.add_scalar(tag="acc", step=3, value=0.9878)

writer.close()
"""
```

### 2. Launch Panel

In the above example, the log has recorded three sets of scalar values. Developers can view the visualization results of the log file through launching the visualDL panel. There are two ways to launch the log file:

#### Launch by Command Line

Use the command line to launch the VisualDL panel：

```python
visualdl --logdir <dir_1, dir_2, ... , dir_n> --model <model_file> --host <host> --port <port> --cache-timeout <cache_timeout> --language <language> --public-path <public_path> --api-only
```

Parameter details:

| parameters      | meaning                                                      |
| --------------- | ------------------------------------------------------------ |
| --logdir        | Set one or more directories of the log. All the logs in the paths or subdirectories will be displayed on the VisualDL Board indepentently. |
| --model         | Set a path to the model file (not a directory). VisualDL will visualize the model file in Graph page. PaddlePaddle、ONNX、Keras、Core ML、Caffe and other model formats are supported. Please refer to [Graph - Functional Instructions](./docs/components/README.md#functional-instructions-2). |
| --host          | Specify IP address. The default value is `127.0.0.1`. Specify it as `0.0.0.0` or public IP address so that other machines can visit VisualDL Board.       |
| --port          | Set the port. The default value is `8040`.                   |
| --cache-timeout | Cache time of the backend. During the cache time, the front end requests the same URL multiple times, and then the returned data are obtained from the cache. The default cache time is 20 seconds. |
| --language      | The language of the VisualDL panel. Language can be specified as 'en' or 'zh', and the default is the language used by the browser. |
| --public-path   | The URL path of the VisualDL panel. The default path is '/app', meaning that the access address is 'http://&lt;host&gt;:&lt;port&gt;/app'. |
| --api-only      | Decide whether or not to provide only API. If this parameter is set, VisualDL will only provides API service without displaying the web page, and the API address is 'http://&lt;host&gt;:&lt;port&gt;/&lt;public_path&gt;/api'. Additionally, If the public_path parameter is not specified, the default address is 'http://&lt;host&gt;:&lt;port&gt;/api'. |

To visualize the log file generated in the previous step, developers can launch the panel through the command:

```
visualdl --logdir ./log
```

#### Launch in Python Script


Developers can start the VisualDL panel in Python script as follows:

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

Please note: since all parameters are indefinite except `logdir`, developers should specify parameter names when using them.

The interface parameters are as follows:

| parameters    | type                                               | meaning                                                      |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| logdir        | string or list[string_1, string_2, ... , string_n] | Set one or more directories of the log. All the logs in the paths or subdirectories will be displayed on the VisualDL Board indepentently.|
| model         | string                                             | Set a path to the model file (not a directory). VisualDL will visualize the model file in Graph page. |
| host          | string                                             | Specify IP address. The default value is `127.0.0.1`. Specify it as `0.0.0.0` or public IP address so that other machines can visit VisualDL Board.       |
| port          | int                                                | Set the port. The default value is `8040`.                   |
| cache_timeout | int                                                | Cache time of the backend. During the cache time, the front end requests the same URL multiple times, and then the returned data are obtained from the cache. The default cache time is 20 seconds. |
| language      | string                                             | The language of the VisualDL panel. Language can be specified as 'en' or 'zh', and the default is the language used by the browser. |
| public_path   | string                                             | The URL path of the VisualDL panel. The default path is '/app', meaning that the access address is 'http://&lt;host&gt;:&lt;port&gt;/app'. |
| api_only      | boolean                                            | Decide whether or not to provide only API. If this parameter is set, VisualDL will only provides API service without displaying the web page, and the API address is 'http://&lt;host&gt;:&lt;port&gt;/&lt;public_path&gt;/api'. Additionally, If the parameter public_path is not specified, the default address is 'http://&lt;host&gt;:&lt;port&gt;/api'. |
| open_browser  | boolean                                            | Whether or not to open the browser. If this parameter is set as True, the browser will be opened automatically and VisualDL panel will be launched at the same time. If parameter api_only is specified as True,  parameter open_browser can be ignored. |

To visualize the log file generated in the previous step, developers can launch the panel through the command:

```python
from visualdl.server import app

app.run(logdir="./log")
```

After launching the panel by one of the above methods, developers can see the visualization results on the browser shown as blow:

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90868674-ba321f00-e3c9-11ea-83c1-f03c6dd19187.png" width="70%"/>
</p>

### 3. Read data in log files using LogReader

VisualDL also provides `LogReader` interface to read any data from log files.

```python
class LogReader(file_path='')
```
#### Interface Parameters
| parameters | type   | meaning                              |
| ---------- | ------ | ------------------------------------ |
| file_path  | string | File path of the log file. Required. |
#### Example
If there is a log file named `vdlrecords.1605533348.log` in the directory of `./log`, we can retrieve the data under the 'loss' tag in the scalar by:
```python
from visualdl import LogReader
reader = LogReader(file_path='./vdlrecords.1605533348.log')
data = reader.get_data('scalar', 'loss')
print(data)
```
The result will be a list shown as below：
```python
...
id: 5
tag: "Metrics/Training(Step): loss"
timestamp: 1605533356039
value: 3.1297709941864014
...
```

For more information of `LogReader`, please refer to [LogReader](./docs/io/LogReader.md).


## Function Preview

### Scalar

**Scalar** makes use of various charts to display how the parameters, such as accuracy, loss and learning rate, changes during the training process. In this case, developers can observe not only the single but also the multiple groups of parameters in order to understand the training process and thus speed up the process of model tuning.

#### Dynamic Display

After the launch of VisualDL Board, the LogReader will continuously record the data to display in the front-end. Hence, the changes of parameters can be visualized in real-time, as shown below:

<p align="center">
  <img src="https://visualdl.bj.bcebos.com/images/dynamic_display.gif" width="60%"/>
</p>



#### Comparison of Multiple Experiments

Developers can compare multiple experiments by specifying and uploading the path of each experiment at the same time so as to visualize the same parameters in the same chart.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48054808/90869567-fdd95880-e3ca-11ea-9855-6c97ad5c8ae7.gif" width="100%"/>
</p>



### Image

**Image** provides real-time visualizations of the image data during the training process, allowing developers to observe the changes of images at different training stages and  to deeply understand the effects of the training process.

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/90869677-22353500-e3cb-11ea-9830-2334bdd8e52e.gif" width="55%"/>
</p>


### Audio

**Audio** aims to allow developers to listen to the audio data in real-time during the training process, helping developers to monitor the process of speech recognition and text-to-speech.

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/90869771-47c23e80-e3cb-11ea-8b2a-a38b6c33d64b.png" width="85%"/>
</p>


### Text
**Text** visualizes the text output of NLP models within any stage, aiding developers to compare the changes of outputs so as to deeply understand the training process and simply evaluate the performance of the model.

<p align="center">
<img src="https://user-images.githubusercontent.com/28444161/106248340-cdd09400-624b-11eb-8ea9-5a07a239c365.png" width="85%"/>
</p>


### Graph

**Graph** enables developers to visualize model structures by only one click. Moreover, **Graph** allows developers to explore model attributes, node information, node input and output. aiding them analyze model structures quickly and understand the direction of data flow easily. Additionally, Graph supports the visualization of dynamic and static model graph respectively.

- dynamic graph

<p align="center">
<img src="https://user-images.githubusercontent.com/22424850/175811841-64b44d99-7d48-4fe9-a679-01156d15af74.gif" width="85%"/>
</p>

- static graph

<p align="center">
<img src="https://user-images.githubusercontent.com/22424850/175811795-1fd21737-06f0-42fc-bea3-ef7a17216fc9.gif" width="85%"/>
</p>


### Histogram

**Histogram** displays how the trend of tensor (weight, bias, gradient, etc.) changes during the training process in the form of histogram. Developers can adjust the model structures accurately by having an in-depth understanding of the effect of each layer.

- Offset Mode

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/90870121-bd2e0f00-e3cb-11ea-89cf-6622cb607b89.png" width="85%"/>
</p>



- Overlay Mode

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/90870194-cfa84880-e3cb-11ea-8a66-bebcad267a10.png" width="85%"/>
</p>

### PR Curve

**PR Curve** displays the precision and recall values under different thresholds, helping developers to find the best threshold efficiently.

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/103274647-1ef72900-49fd-11eb-9284-2a5b63bdf2e3.png" width="85%"/>
</p>

### ROC Curve

**ROC Curve** shows the performance of a classification model at all classification thresholds; the larger the area under the curve, the better the model performs, aiding developers in evaluating the model performance and choosing an appropriate threshold.

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/103344081-8928d000-4ac8-11eb-84d0-28f249886172.gif" width="85%"/>
</p>


### High Dimensional

**High Dimensional** provides three approaches--T-SNE, PCA and UMAP--to do the dimensionality reduction, allowing developers to have an in-depth analysis of the relationship between high-dimensional data and to optimize algorithms based on the analysis.

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/103188111-1b32ac00-4902-11eb-914e-c2368bdb8373.gif" width="85%"/>
</p>


### Hyper Parameters

**Hyper Parameters** visualize the relationship between hyperparameters and model metrics (such as accuracy and loss) in a rich view, helping you identify the best hyperparameters in an efficient way.

<p align="center">
<img src="https://user-images.githubusercontent.com/28444161/119247155-e9c0c280-bbb9-11eb-8175-58a9c7657a9c.gif" width="85%"/>
</p>

### Model Visual
The data distribution and key statistical information of each layer of the model network are visualized from multiple angles with rich views, which is convenient to quickly understand the rationality of the current model network design and realize the rapid positioning of model anomalies.

<p align="center">
<img src="https://user-images.githubusercontent.com/95737959/147730782-5e659c39-26f4-4766-b657-6e530f33cf47.gif" width="85%"/>
</p>

The steps to use this function are as follows:

#### 1、Random sampling of the network node data
Use the paddle1.8.5 versions which support to random sample of the network node data: http://gitlab.baidu.com/paddle-distributed/wheel/blob/master/release_1.8/paddle_whl_release_1.8.5_20210902.whl


```python
join_save_params = []
for param in join_model._train_program.list_vars():
    if param.persistable:
        if "_generat" not in param.name:
            join_save_params.append(param.name)
        if "fc_" in param.name or "conv_" in param.name:
            join_save_params.append(param.name + "@GRAD")
    elif "RENAME" not in param.name:
        if "fc_" in param.name or "dropout_4.tmp_0" in param.name or "concat_" in param.name:
            join_save_params.append(param.name)
        if "sequence_pool_" in param.name and "tmp_1" not in param.name:
            join_save_params.append(param.name) 
 
join_program._fleet_opt["dump_prob"] = 0.2
join_program._fleet_opt["dump_fields"] = ["slot1", "slot2"]
join_program._fleet_opt["dump_param"] = join_save_params
join_program._fleet_opt["dump_fields_path"] = config.output_path + "/random_dump/join/" + config.start_day + "/" + "delta-%s" % pass_index

#If there are multiple stages(like join\update) and each stage needs to dump, set its own dump_fields_path
update_model._train_program._fleet_opt["dump_fields_path"] = "%s/random_dump/update/%s/%s" % (config.output_path, day.data_day, '_'.join(datas))
```
Here is a full runnable demo reference: https://github.com/TsLu/PaddleDemo/blob/main/randump/random_dump.py
The format of random dump data is as follows: https://github.com/TsLu/PaddleDemo/blob/main/randump/random_dump/join/20211125/delta-1/part-000-00009

```python
#sample key \t neuron name:number of neuron nodes:output value of each neuron \t ...
dcefve		concat_0.tmp_0:2:1:1	sequence_pool_6.tmp_0@GRAD:16:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0	sequence_pool_3.tmp_0@GRAD:12:0:0:0:0:0:0:0:0:0:0:0:0	sequence_pool_1.tmp_0@GRAD:12:0:0:0:0:0:0:0:0:0:0:0:0	concat_0.tmp_0:2:1:1	user_emb:140:0.0983945:-0.402422:-0.304479:0.48722:-0.423722:0.49905:-0.36198:-0.141344:0.164492:0.203659:-0.166241:0.371955:-0.338783:-0.39251:0.158664:-0.133492:0.200509:-0.23503:-0.149515:-0.247849:0.0900903:-0.250218:-0.29327:-0.449013:-0.289186:-0.296609:0.36998:0.309947:0.468418:0.0150231:0.178822:-0.0795117:-0.108979:0.494221:-0.442487:-0.286313:0.391469:-0.39494:-0.162585:-0.158422:-0.182274:0.431848:-0.268552:-0.28416:0.333334:0.360513:0.318403:-0.364475:0.439969:-0.246897:0.0332158:0.358267:-0.0748573:-0.435962:-0.302861:-0.388489:0.271488:0.0127385:-0.0989884:-0.271535:-0.254238:-0.33684:0.389732:-0.222312:-0.20576:-0.253779:-0.166874:-0.19071:0.25096:0.105208:0.487118:-0.334612:-0.0503092:-0.473779:0.193285:0.0745487:-0.45893:-0.024402:0.0913379:-0.0261859:-0.0188701:0.120137:0.116529:-0.0141518:-0.119165:-0.198176:-0.159524:-0.378288:-0.341906:-0.128065:0.166849:-0.0154788:-0.177214:-0.287362:-0.239857:-0.136312:0.107463:0.356079:0.278596:0.117707:-0.162731:-0.198466:-0.175281:-0.00143227:-0.13731:-0.074105:-0.123823:-0.0376647:-0.11276:-0.0496815:-0.172825:-0.429263:0.0284473:0.182517:0.26848:-0.215857:0.349042:-0.373334:-0.218745:-0.0499232:0.155349:-0.123708:0.478668:-0.214383:0.494542:0.0422934:-0.452487:-0.014959:-0.0854984:-0.094967:-0.150888:0.483285:-0.365631:-0.366048:-0.47845:-0.282711:0.25745:0.367952:0.388146:0.188527
```

#### 2、Using model visual to process sampled neuron datas
The data processing interface is used to process the neuron datas:
```python
from visualdl.thirdparty.process_data import ModelAnalysis
params = {
        "hadoop_bin": "/home/work/hadoop/bin/hadoop",
        "ugi": "**",
        "debug_input": "afs://***/random_dump/join/20211015",
        # "debug_input": "/home/work/testuser/visualdl/data/random_dump/join/20211028", #local dump data
        "delta_num": "8",
        "join_pbtxt": "/home/work/test_download/train/join_main_program.pbtxt",
        "update_pbtxt": "/home/work/test_download/train/update_main_program.pbtxt"
}
model_analysis = ModelAnalysis(params)
model_analysis()
```
Parameter details:
| parameter            | meaning                                                         |
| --------------- | ------------------------------------------------------------ |
| hadoop_bin      | If the data of the sampled datas stored on AFS, you need to specify the hadoop path. If it is a local path, you do not need to set|
| ugi             | If the data of the sampled datas stored on AFS, you need to specify the hadoop ugi. If it is a local path, you do not need to set |
| debug_input     | The data storage path of the sampled network datas, fill in the AFS path or local path |
| delta_num       | Number of trained batches |
| join_pbtxt      | Model trained join network, only local path |
| update_pbtxt    | Model trained update network, only local path, If not has this stage, you don't have to fill it in |
| data_dir        | The local folder path which is used to store the processed intermediate data |


#### 3、Check the network node data using visualdl
##### Use the command line to launch the VisualDL panel：
```python
visualdl --logdir <dir_1, dir_2, ... , dir_n> --data_dir <data_dir> --host <host> --port <port> --cache-timeout <cache_timeout> --language <language> --public-path <public_path> --api-only
```
Parameter details:
| parameter            | meaning                                                         |
| --------------- | ------------------------------------------------------------ |
| --logdir      | Set one or more directories of the log. All the logs in the paths or subdirectories will be displayed on the VisualDL Board indepentently. |
| --data_dir      | The local folder path which is used to store the processed intermediate data，same whith the step2 |
| --host          | Specify IP address. The default value is 127.0.0.1. Specify it as 0.0.0.0 or public IP address so that other machines can visit VisualDL Board.|
| --port          | Set the port. The default value is 8040.                                     |
| --cache-timeout | Cache time of the backend. During the cache time, the front end requests the same URL multiple times, and then the returned data are obtained from the cache. The default cache time is 20 seconds. |
| --language      | The language of the VisualDL panel. Language can be specified as 'en' or 'zh', and the default is the language used by the browser.   |
| --public-path   | The URL path of the VisualDL panel. The default path is '/app', meaning that the access address is 'http://<host>:<port>/app'.|
| --api-only      | Decide whether or not to provide only API. If this parameter is set, VisualDL will only provides API service without displaying the web page, and the API address is 'http://<host>:<port>/<public_path>/api'. Additionally, If the public_path parameter is not specified, the default address is 'http://<host>:<port>/api'. |

##### Launch in Python Script
Developers can start the VisualDL panel in Python script as follows:

```python
visualdl.server.app.run(logdir,
                        data_dir="datapath",
                        host="127.0.0.1",
                        port=8080,
                        cache_timeout=20,
                        language=None,
                        public_path=None,
                        api_only=False,
                        open_browser=False)
```

### VDL.service

**VDL.service** enables developers to easily save, track and share visualization results with anyone for free.

<p align="center">
<img src=https://user-images.githubusercontent.com/48054808/93731055-fbeafb00-fbfd-11ea-80f4-bbfd08a0fc35.png width="85%"/>
</p>

## Frequently Asked Questions

If you are confronted with some problems when using VisualDL, please refer to [our FAQs](./docs/faq.md).

## Contribution

VisualDL, in which Graph is powered by [Netron](https://github.com/lutzroeder/netron) and [AntV G6](https://github.com/antvis/G6), is an open source project supported by [PaddlePaddle](https://www.paddlepaddle.org/) and [ECharts](https://echarts.apache.org/).

Developers are warmly welcomed to use, comment and contribute.

## More Details

For more details related to the use of VisualDL, please refer to [**VisualDL User Guide**](./docs/components/README.md)。

## Technical Communication

Welcome to join the official QQ group 1045783368 to communicate with PaddlePaddle team and other developers.

<p align="center">
<img src="https://user-images.githubusercontent.com/48054808/82522691-c2758680-9b5c-11ea-9aee-fca994aba175.png" width="20%"/>
</p>

