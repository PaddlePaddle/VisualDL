# 使用fastdeploy client进行可视化请求服务

### 概述

FastDeploy服务的客户端组件主要用于快速的访问基于[FastDeploy项目](https://github.com/PaddlePaddle/FastDeploy)开启的fastdeployserver服务，帮助用户进行预测请求和结果的可视化，对部署的服务进行快速验证。该页面基于gradio组件进行开发。

### 使用方式

使用命令

```shell
visualdl --host 0.0.0.0 --port 8080
```
接着在浏览器打开`http://127.0.0.1:8080`（如果浏览器和启动visualdl的机器不同，请替换为启动visualdl机器的ip），即可以看到FastDeploy Client的功能选项卡。

### 功能说明

FastDeploy服务的客户端页面主要分三部分，第一部分为fastdeployserver服务的参数设置区，包括http服务的ip, 端口号，性能服务的端口号，要请求推理服务的模型名称和版本号。第二部分为模型的输入和输出区，帮助用户对预测请求和返回结果进行可视化。第三部分为服务的性能统计区，用于展示服务当前的性能指标。

- fastdeployserver服务的参数设置区

- 模型的输入和输出区
  
- 服务的性能统计区
