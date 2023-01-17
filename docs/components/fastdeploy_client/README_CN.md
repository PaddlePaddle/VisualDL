[**English**](./README.md)

# 使用fastdeploy client进行可视化请求服务

### 概述

FastDeploy服务的客户端组件主要用于快速的访问基于[FastDeploy项目](https://github.com/PaddlePaddle/FastDeploy)开启的fastdeployserver服务，帮助用户进行预测请求和结果的可视化，对部署的服务进行快速验证。该页面基于gradio进行开发。
 <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211204267-8e044f32-1008-46a7-828a-d7c27ac5754a.gif" width="100%"/>
  </p>

### 使用方式

使用命令

```shell
visualdl --host 0.0.0.0 --port 8080
```
接着在浏览器打开`http://127.0.0.1:8080`（如果浏览器和启动visualdl的机器不同，请替换为启动visualdl机器的ip），即可以看到FastDeploy Client的功能选项卡。

### 功能说明

FastDeploy服务的客户端页面主要分四部分，第一部分为fastdeployserver服务的参数设置区，包括http服务的ip, 端口号，性能服务的端口号，要请求推理服务的模型名称和版本号。第二部分为模型的输入和输出区，帮助用户对预测请求和返回结果进行可视化。第三部分为服务的性能统计区，用于展示服务当前的性能指标。第四部分用来显示各个操作的执行状态。

 <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211206389-9932d606-ea71-4f05-87eb-dcc21c5eeec9.png" width="100%"/>
  </p>

- fastdeployserver服务的参数设置区
  
  设置需要请求的服务器的ip地址和端口信息，以及要执行推理的模型名称和版本号。后续的请求都会发往所设置的地址。


- 模型的输入和输出区

  当前提供两种访问服务的方式，第一种是"组件形式"，这种方式会通过服务器直接获取模型的输入和输出，并且通过gradio的组件来进行表示，每个输入和输出变量配有一个文本组件和一个图像组件，用户根据变量的实际类型来选择对应组件进行使用，比如变量是图像数据则用图像组件输入，是文本则用文本组件进行输入。返回的数据也会通过组件进行可视化呈现。由于不同任务可视化的解析操作不同，因此上方提供了任务类型的选择，当不指定任务类型的时候，输出变量只用文本组件进行显示，显示服务器返回的原始数据。当指定了任务类型，将会对返回的数据进行解析，并且使用图像组件来可视化呈现出来。
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211207902-4717011d-8ae2-4105-9508-ab164896f177.gif" width="100%"/>
  </p>
  

  第二种是"原始形式"，这种方式相当于一个原始的http客户端，输入框中输入http请求的原始负载，输出框中显示服务器返回的原始负载。使用这种方式，输入和输出的构造格式对用户完全不透明，因此不建议使用，除非组件形式没法成功实现请求。
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211208731-381222bb-8fbe-45fa-bf78-4a3e2c7f6f04.gif" width="100%"/>
  </p>

  
- 服务的性能统计区

  用来显示通过fastdeployserver性能服务的端口请求回来的性能指标信息，包括各个模型响应请求的执行统计、延迟统计，以及环境中计算设备的利用率。
  
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/211208071-e772ed55-9a3d-4a21-9bca-3d80f444ca64.gif" width="100%"/>
  </p>
- 执行状态显示区

  显示在客户端界面执行的所有操作的情况，当用户点击"获取模型输入输出"、"提交请求"和"更新统计数据"按钮的时候，如果发生异常，执行状态显示区会给出异常发生的原因，如果执行成功也会有相应提醒，以便用户知道执行情况。
