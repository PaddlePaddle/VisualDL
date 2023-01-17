[**English**](./README.md)

# 使用VisualDL进行Serving可视化部署

### 概述

VisualDL支持基于[FastDeploy项目](https://github.com/PaddlePaddle/FastDeploy)使用fastdeployserver进行serving可视化部署。主要提供模型库载入和编辑、服务管理监控、以及提供客户端快速测试服务的功能。使用VisualDL可以直接载入一个比较初始的模型库，并完成模型库所需模型资源的下载、模型配置文件的数据修改，开启fastdeployserver服务化部署某个模型库，监控服务的状态和指标，并对已经部署的服务进行快速的测试验证。

### 前置条件

为了使用该功能，用户需要在环境里安装fastdeployserver。fastdeployserver作为[FastDeploy项目](https://github.com/PaddlePaddle/FastDeploy)的服务化部署工具，可以通过下载fastdeploy的docker镜像来直接使用fastdeployserver。

- CPU镜像
```bash
docker pull registry.baidubce.com/paddlepaddle/fastdeploy:1.0.2-cpu-only-21.10
```
- GPU镜像
```bash
docker pull registry.baidubce.com/paddlepaddle/fastdeploy:1.0.2-gpu-cuda11.4-trt8.4-21.10
```

使用如下命令可以进入容器

```bash
nvidia-docker run -it --net=host --name fd_serving -v `pwd`/:/FastDeploy registry.baidubce.com/paddlepaddle/fastdeploy:1.0.2-gpu-cuda11.4-trt8.4-21.10  bash
```
在容器中使用如下命令可以安装VisualDL
```python
python -m pip install visualdl
```

可以参考上述命令来获取镜像进行使用，关于镜像和服务化部署的更多说明，可以参考文档[FastDeploy 服务化部署](https://github.com/PaddlePaddle/FastDeploy/blob/release/1.0.2/serving/README_CN.md)。

本文假定用户已经启动了fastdeploy的镜像，环境中拥有了fastdeployserver命令，并且安装了visualdl>=2.5.0，以便能够正常使用VisualDL对fastdeployserver服务化部署进行管理。

### 使用方式

使用命令

```shell
visualdl --host 0.0.0.0 --port 8080
```
接着在浏览器打开`http://127.0.0.1:8080`（如果浏览器和启动visualdl的机器不同，请替换为启动visualdl机器的ip），即可以看到FastDeployServer的功能选项卡。

### 功能说明

VisualDL的FastDeployServer组件用来支持serving可视化部署，主要提供模型库载入和编辑、服务管理监控这两方面的功能。
下面以[FastDeploy项目](https://github.com/PaddlePaddle/FastDeploy)下的examples目录为示例进行功能说明，可以先通过下列命令来获取示例所需要的资源并开启visualdl。
```bash
git clone https://github.com/PaddlePaddle/FastDeploy.git
cd FastDeploy/examples
visualdl --host 0.0.0.0 --port 8080
```
进入FastDeployServer的功能选项卡后，

1.模型库载入和编辑

  -  **模型库载入**

  点击"载入模型库"按钮选择模型库路径，可选路径的"根路径"为visualdl启动时所在的路径。如果所选择的路径不是一个有效的模型库路径，则会进行提醒。打开模型库./vision/detection/paddledetection/serving/models
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211199367-18d36b58-cbe8-4d5f-994b-9d9317753f78.gif" width="100%"/>
  </p>
  

  - **模型配置编辑**

  在模型库中，模型可以分为基础模型和ensemble模型。ensemble模型由基础模型构成，表示多个基础模型形成的pipeline，如三个基础模型"preprocess","runtime","postprocess"可以构成一个ensemble模型。在画布中显示的即是ensemble模型的构成，右边列举了当前的ensemble模型和所有的基础模型。
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211194661-51ecb563-0095-48ce-8143-ed7123f5b03c.png" width="100%"/>
  </p>

  用户可以通过单击右侧的基础模型列表，或者是双击图上的基础模型来打开对应模型的配置界面。点击"ensemble配置"按钮可以打开ensemble模型的配置界面。进入配置页面后可以选择需要查看的配置文件。

  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211201905-89c3ab64-0dcc-472d-89cc-a83c79945aa5.gif" width="100%"/>
  </p>
  
  当前配置页面提供配置修改更新、下载模型资源、以及设置启动服务时的模型配置文件的功能。


  a. 配置修改更新

  当用户选择某个配置文件的时候，配置界面将会展示所选配置文件里的配置信息。目前配置界面主要支持用户修改maxBatchSize、instanceGroup以及optimization三个属性的配置，这三个属性的含义和可修改值的说明如下。
  ```text
  maxBatchSize: 设置模型推理时候，允许的最大batch size。请输入非负整数，如16
  instanceGroup: 设置服务器使用哪种硬件资源，分别部署多少个模型推理实例。其中包含三个可设置的项，count表示部署的模型实例个数，请输入非负整数，如2。kind表示使用的设备类型，可以选择KIND_CPU表示使用CPU或者KIND_GPU表示使用GPU。当选择KIND_GPU时，gpus表示需要使用GPU卡编号，请输入多个用逗号（,)分割的整数，如使用2号和3号卡，即输入2,3
  optimization: 设置执行加速的配置，可以分别配置cpu和gpu的加速配置。其中包含后端的名字name, 如onnxruntime，以及和该后端相关的参数配置，如添加一组参数的设置, 第一个框填参数名，如cpu_threads, 第二个框填参数值，如4
  ```
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211202046-3ec7989b-9ceb-4c7a-b120-01780fb72df3.gif" width="100%"/>
  </p>
  
  当点击更新按钮时，会根据用户的修改对配置文件的内容进行更新，并且在更新之前会对原有配置文件进行备份，备份的配置文件命名方式为"所选配置文件名_vdlbackup_时间.pbtxt"，备份的配置文件不允许进行修改，主要是用于配置的回滚操作。
  
  关于模型库的配置文件的完整定义可以参考[proto定义](https://github.com/triton-inference-server/common/blob/main/protobuf/model_config.proto)，文档[Model Configuration介绍](https://github.com/PaddlePaddle/FastDeploy/blob/release/1.0.2/serving/docs/zh_CN/model_configuration.md)对定义进行了一些简要说明。

  b. 下载模型资源

  模型配置框的versions属性，将会列出当前模型所拥有的不同版本目录下存在的资源文件。当需要新增或者替换某个版本下的预训练模型时候，可以点击版本号，弹出预训练模型的下载框，选择希望新增或者替换的预训练模型名，即可以自动下载预训练模型作为该版本下的模型资源。此外，模型资源文件允许进行重命名和删除。
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211198445-e276c9b2-78c3-4c35-82a6-4b85cd014e1e.gif" width="100%"/>
  </p>

  c. 设置启动服务时的模型配置文件

  当使用fastdeployserver服务化部署模型库时候，所用到的配置文件是每个模型目录下的config.pbtxt，当模型目录下有多个提前准备好的配置文件时候，可以通过选择某个配置文件设置为启动配置文件，就会将所选择的配置文件的内容覆盖config.pbtxt。因此，这一操作相当于是配置回滚，可以用于将某个备份的配置文件的数据载入到config.pbtxt，也可以用于选定某一个配置文件作为服务载入模型时所用到的配置文件。
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211198515-96932d01-de59-44e5-ac76-e90b146c1aa8.gif" width="100%"/>
  </p>
  

2.服务管理监控

  VisualDL提供了对服务的管理监控功能。主要包括启动服务、监控服务、关闭服务、测试服务四个方面的功能。

  a. 启动服务

  点击启动服务按钮，将会启动一个fastdeployserver服务，所启动的模型库即为当前载入的模型。在配置启动参数界面可以填写服务的启动参数。
  各个启动参数的说明如下：
  ```text
  server-name: 用户指定的服务名称，用于给启动的服务命名，方便后续查看。如果没有填，默认服务名称为所启动服务进程的进程号pid
  model-repository: 要部署的模型库，即为当前载入的模型库。
  backend-config: 指定服务的后端配置，格式为<backend_name>,<setting>=<value>，其中backend_name为后端名称，如python、tensorrt等，后面接该后端的具体可配置项，提供的默认值为python,shm-default-byte-size=10485760
  http-port: 指定服务的http服务端口，默认为8000
  grpc-port: 指定服务的grpc服务端口，默认为8001
  metrics-port: 指定服务的性能查询服务端口，默认为8002
  gpus: 指定部署的服务能够使用的gpu号，如使用卡2和卡3，即为"2,3"，如果没有填，则会使用全部可获得的gpu

  ```
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211198608-c40283b0-e2cb-4a02-ae8a-3f6a2d5baae4.gif" width="100%"/>
  </p>

  b. 监控服务

  目前主要通过提供给用户服务的输出信息、性能信息、以及所启动的模型库信息，来实现对所启动服务的监控。前端默认每10s会自动更新一下所监控的信息，用户也可以点击"更新数据"按钮进行手动更新。
  - 日志（服务的输出信息，可用于获取服务的启动和加载情况，异常信息等）
  - 性能（通过访问服务的性能查询服务，获取性能相关数据）
  - 模型库配置（用于查看服务所部署的模型库信息）

  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211198677-b14cab30-bf48-4f8d-a9a6-a97857217020.gif" width="100%"/>
  </p>

  c. 关闭服务

  点击左侧的关闭标签或者"关闭服务"按钮，可以手动关停某个服务。
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211198748-c0628ed9-505a-4f7d-ae17-ecadf060b562.gif" width="100%"/>
  </p>

  d. 测试服务

  点击"打开客户端"按钮，会打开快速测试服务的客户端界面。该界面基于gradio编写，并且会自动根据服务启动的参数，帮助用户填好基本的信息，用户可以参考 [使用fastdeploy client进行可视化请求服务](../fastdeploy_client/README_CN.md)进行使用。
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211198901-3e58fe9d-8667-4416-987a-200f9edeb05d.gif" width="100%"/>
  </p>

   
   












  