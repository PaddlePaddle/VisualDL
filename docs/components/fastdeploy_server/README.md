[**中文**](./README_CN.md)

# Use VisualDL for fastdeploy serving deployment visualization

### Introduction

VisualDL supports fastdeploy serving deployment visualization based on [FastDeploy project](https://github.com/PaddlePaddle/FastDeploy). It mainly provides the functions of loading and editing the model repository, service management and monitoring, and providing the client to test service. You can directly load a initial model repository in FastDeploy examples, and complete the download of model resources required and modification of the model configuration file on VisualDL. Then start the fastdeployserver to deploy a certain model repository, monitor the service log and metrics, and help you make quick test and verification of deployed services.

### Pre-requisite

In order to use this function, you need to install fastdeployserver in the environment. Fastdeployserver is a serving deployment tool of [FastDeploy project](https://github.com/PaddlePaddle/FastDeploy), you can directly use fastdeployserver by downloading the docker image of fastdeploy.

- CPU docker image
```bash
docker pull registry.baidubce.com/paddlepaddle/fastdeploy:1.0.2-cpu-only-21.10
```
- GPU docker image

```bash
docker pull registry.baidubce.com/paddlepaddle/fastdeploy:1.0.2-gpu-cuda11.4-trt8.4-21.10
```
You can enter a container using command
```bash
nvidia-docker run -it --net=host --name fd_serving -v `pwd`/:/FastDeploy registry.baidubce.com/paddlepaddle/fastdeploy:1.0.2-gpu-cuda11.4-trt8.4-21.10  bash
```

And install VisualDL in the container by
```python
python -m pip install visualdl
```

You can refer to the above command to obtain the image for use. For more information about fastdeploy serving deployment, please refer to the document [FastDeploy  Serving Deployment](https://github.com/PaddlePaddle/FastDeploy/blob/release/1.0.2 /serving/README_CN.md).

This article assumes that the user has started the fastdeploy docker image, has the fastdeployserver command in the environment, and installed visualdl>=2.5.0. Then visualdl can be used to manage the fastdeployserver services.

### Usage 

use command

```shell
visualdl --host 0.0.0.0 --port 8080
```
Then open `http://127.0.0.1:8080` in the browser (please replace it with the ip of the machine that starts visualdl if not localhost), and you can see the component tab of FastDeploy Server.

### Function Description

The FastDeploy Server component mainly provides the functions of model repository loading and editing, services management and monitoring.
The following uses the examples directory under the [FastDeploy project](https://github.com/PaddlePaddle/FastDeploy) as an example to describe the functions. You can first use the following commands to obtain the resources required by the example then open visualdl.
```bash
git clone https://github.com/PaddlePaddle/FastDeploy.git
cd FastDeploy/examples
visualdl --host 0.0.0.0 --port 8080
```
After entering the component tab of FastDeploy Server, you can

1.Model repository loading and editing

   - **model repository Loading**
   Click the "load model repository" button to select the model repository path, and the "root path" is where visualdl starts. If the selected path is not a valid model repository path, you will be warned and please re-select. Open the model repository ./vision/detection/paddledetection/serving/models
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211199367-18d36b58-cbe8-4d5f-994b-9d9317753f78.gif" width="100%"/>
   </p>


   - **model configuration editor**
   In the model repository, models can be divided into basic models and ensemble models. The ensemble model is composed of basic models, and represents a pipeline formed by multiple basic models. For example, three basic models "preprocess", "runtime", and "postprocess" can form an ensemble model. What is displayed in the canvas is the composition of the ensemble model, and the current ensemble model and all basic models are listed on the right panel.
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211194661-51ecb563-0095-48ce-8143-ed7123f5b03c.png" width="100%"/>
   </p>

   You can click the basic model on the right panel, or double-click the basic model on the canvas to open the configuration editor. Click the "ensemble configuration" button to open the configuration editor of the ensemble model. You can select the configuration file you want to view in the configuration editor.

   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211201905-89c3ab64-0dcc-472d-89cc-a83c79945aa5.gif" width="100%"/>
   </p>

   The current configuration editor provides functions for configuration modification and update, downloading model resources, and setting the startup configuration file of models when starting the service.


   a. Configuration modification update

   When the user selects a configuration file, the configuration editor will display the configuration information in the selected configuration file. Currently, the configuration editor mainly supports you to modify the configuration of three attributes: maxBatchSize, instanceGroup, and optimization. The meanings and values of these three attributes are described as follows.
   ```text
   maxBatchSize: The maximum batch size allowed in inference. Please enter a non-negative integer, such as 16
   instanceGroup: Set hardware resources the server uses and how many instances are deployed. It contains three configurable items, count represents the number of deployed instances, please enter a non-negative integer, such as 2. kind indicates the type of device used, and you can choose KIND_CPU to indicate the use of CPU or KIND_GPU to indicate the use of GPU. When KIND_GPU is selected, gpus indicates that the GPU card numbers need to be used, please enter multiple integers separated by commas (,), such as using cards 2 and 3, i.e. 2,3
   optimization: Set the configuration of execution acceleration, you can configure the acceleration configuration of cpu and gpu separately. It contains the name of the backend, such as onnxruntime, and parameters related to the backend. The first text is filled with the parameter name, such as cpu_threads, and the second text is filled with the parameter value, such as 4
   ```
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211202046-3ec7989b-9ceb-4c7a-b120-01780fb72df3.gif" width="100%"/>
   </p>

   When the "update" button is clicked, the content of the configuration file will be updated according to the user's modification, and the original configuration file will be backed up before the update. The backup configuration file is named as "{name}_vdlbackup_{time}. pbtxt", the backup configuration file is not allowed to be modified, which is used for configuration rollback.

   For a complete definition of the configuration file of a model repository, please refer to [proto definition](https://github.com/triton-inference-server/common/blob/main/protobuf/model_config.proto), document [Model Configuration introduction](https://github.com/PaddlePaddle/FastDeploy/blob/release/1.0.2/serving/docs/zh_CN/model_configuration.md) gives some brief explanation of the definition.

   b. Download model resources

   The versions property in configuration editor will list the resource files that exist in different versions of the current model. When you need to add or replace a pre-trained model under a certain version, you can click the version number to pop up the download box, select the name of the pre-trained model you want to add or replace, and the pre-trained model can be automatically downloaded as the model resources under version. Besides, model resource files are allowed to rename and delete.
<p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211198445-e276c9b2-78c3-4c35-82a6-4b85cd014e1e.gif" width="100%"/>
   </p>

   c. Set the startup configuration file of models

   When fastdeployserver serves a the model repository, the configuration file used is config.pbtxt in each model directory. When there are multiple configuration files in the model directory, you can select a configuration file to set as the startup configuration file, the content of the selected configuration file will overwrite config.pbtxt. Therefore, this operation is equivalent to configuration rollback, which can be used to load the data of a backup configuration file into config.pbtxt, or to just select a configuration file as the startup configuration file.
<p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211198515-96932d01-de59-44e5-ac76-e90b146c1aa8.gif" width="100%"/>
   </p>


2.services management

   VisualDL provides management and monitoring functions for services. It mainly includes the functions of starting service, monitoring service, closing service and testing service.

   a. Start the service

   Click the "launch server" button to start a fastdeployserver service, and the deployed model repository is the currently loaded one. You can configurate launch parameters of a service on the launch parameters configuration editor.
   The description of each launch parameter is as follows:
   ```text
   server-name: The service name specified by the user, which is used to name the deployed service for subsequent viewing. If not filled, the default service name is the process number pid of the service process
   model-repository: The model repository to be deployed, which is the currently loaded model repository.
   backend-config: Specify the backend configuration of service, the format is <backend_name>,<setting>=<value>, where backend_name is the backend name, such as python, tensorrt, etc., followed by the specific configurable items of the backend. The default value is python, shm-default-byte-size=10485760
   http-port: Specify the http service port of service, the default is 8000
   grpc-port: Specify the grpc service port of service, the default is 8001
   metrics-port: Specify the metrics query service port of service, the default is 8002
   gpus: Specify the number of gpus that can be used by the deployed service. If card 2 and card 3 are used, it is "2,3". If not filled, all available gpus will be used
   ```
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211198608-c40283b0-e2cb-4a02-ae8a-3f6a2d5baae4.gif" width="100%"/>
   </p>

   b. Monitoring service

   At present, the monitoring of the started service is mainly realized by providing the user with the output information of the  service, the metrics information, and the information of the deployed model repository. By default, the front-end will automatically update the monitored information every 10s, and you can also click the "update" button to manually update.
   - Log (the output log of the service, which can be used to obtain the startup and loading status of the service, exception information, etc.)
   - Metrics (obtain performance-related data by accessing the metric query service)
   - Model repository configuration (used to view the model repository information deployed by the service)

   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211198677-b14cab30-bf48-4f8d-a9a6-a97857217020.gif" width="100%"/>
   </p>

   c. Shutting down the service

   Click the close tab on the left or the "shutdown" button to manually shut down a service.
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211198748-c0628ed9-505a-4f7d-ae17-ecadf060b562.gif" width="100%"/>
   </p>

   d. Testing the service
   
   Click the "open client" button to open the client for quickly testing the service. The client is written based on gradio, and will automatically help you fill in basic information according to the launch parameters of the service. You can refer to [Use VisualDL as fastdeploy client for request visualization](../fastdeploy_client/README.md) to use.
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211198901-3e58fe9d-8667-4416-987a-200f9edeb05d.gif" width="100%"/>
   </p>
   