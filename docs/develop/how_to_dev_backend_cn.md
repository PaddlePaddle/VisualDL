# 后台指南

VisualDL有三个功能模块.
1. 在训练过程中用来记录日志数据的 Python/C++ SDK。
1. 用来可视化训练数据的客户端单页面应用。
1. 后端 Flask 服务器，用来读取日志数据并提供给前端应用，以便前端可以展示各类图标，如柱状图，嵌入图等等.

这篇文档用来介绍 后端/SDK 的架构，以及指导用户自行开发。

关于前端的架构和开发指南，请看 [这里](https://github.com/PaddlePaddle/VisualDL/blob/develop/docs/how_to_dev_frontend_cn.md)


## 代码结构

所有后端和 SDK 的逻辑都在 visualdl 子文件夹里面

```
├── build
├── build.sh
├── CMakeLists.txt
├── frontend
├── visualdl
    ├── logic    - API for C++ SDK, information maintainer
    ├── python   - API for Python SDK
    ├── server   - Flask server, provides front end APIs for read data
    ├── storage  - Data structure and protobuf
    └── utils    - Helper function and classes
```

## 开发

任何在 ```server``` 文件夹里代码的改动，都可以通过运行以下命令

```
python visualdl/server/visualDL --logdir={LOG_DIR} --port=8080
```
来重启 Flask 服务器

需要注意的是如果你通过 `pip install wheel` 来安装 visualDL, 请确认重置 PYTHONPATH，以便是的上述命令可以运行。

任何在 ```logic```, ```python```, ```storage```, ```utils``` 中的代码修改，都需要重新 build core.so 或 SDK 来确保生效。

要么运行 VisualDL/build.sh 脚本来重新安装所有组件，要么安装特定的目标组件如下：

```
mkdir {VisualDL_ROOT}/build
cd build
cmake ..
make {TARGET MODULE}
```


## 测试

任何关于 SDK API 或其他核心组件的修改都必须提供相应的测试案例。


在 {VisualDL_ROOT}/CMakeList.txt 中，我们有一个测试文件清单

```
add_executable(vl_test
        ${PROJECT_SOURCE_DIR}/visualdl/test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/logic/sdk_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/logic/histogram_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/storage/storage_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/storage/test_binary_record.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/test_concurrency.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/test_image.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/concurrency.h
        ${PROJECT_SOURCE_DIR}/visualdl/utils/filesystem.h
        )
```

在相应被修改的代码文件处添加测试用例或者新的测试文件。你可以制作 vl_test 目标或者运行 vl_test 可执行文件来运行所有测试案例。

```
mkdir {VisualDL_ROOT}/build
cd build
cmake ..
make vl_test
./vl_test
```

## 后端 / SDK 架构

### 服务器

- 采用轻量级 Flask 框架来搭建服务器并提供以下两种服务
  - 搭建主程序来支持前端应用
  - 提供一系列 HTTP 访问点，通过返回的 JSON 来和前端沟通
- ```visualDL``` : 主程序入口
  - 定义了服务器参数
  - 给前端提供 API 和 路由匹配
- ```lib.py``` : 调用库函数的入口
  - 读取并缓存日志数据
  - 把数据变成 JSON
  - 重试机制
- ```graph.py``` 和 ```onnx```
  - graph.py 定义了读取和解析 ONNX 模型文件的逻辑
  - 给前端提供具有结点和边信息的图模型JSON
  - ONNX 文件夹包含从 ONNX 代码库移植来的 ONNX Protobuf 接口


### 逻辑和 SDK

#### Python SDK
- ```pybind.cc``` : 为 C++ 创建 Python 接口
- ```storage.py``` : Python SDK 的 ```LogReader``` 和 ```LogWriter``` API，对应于 pybind

#### C++ SDK
- ```sdk.h```
  - 定义了 ```LogReader``` 和 ```LogWriter``` 的 C++ SDK 的API
  - 定义了诸如```Scalar```, ```Histogram```, ```Image``` 的功能模块以及它们相应的 ```Reader```
- ```sdk.cc``` : 实现了 ```Reader``` 以便使用 ```Storage``` 层来完成读和写

#### 信息容器
- 目前我们仅仅处理写操作时的同步逻辑

#### 存储
- 定义日志数据的格式如下：
  - ```Storage``` : 主数据存储地， 包含不同模式，比如 "train" 或 "test", 包含多个 ```Tablet```
  - ```Tablet``` : 把同一个数据类型用 ```tag``` 打包. 一个面板只代表一个数据类型，比如 ‘数值’， ‘柱状图’， ‘图像’。 可以包含多个 ```Record```。 比如，一个面板可以表达在 ‘数值’ 图像中的一条线。
  - ```Record``` : 最小单位，代表任何功能模块中的任何数据结构。
- 处理和磁盘之间的 序列化/去序列化 传输
- ```storage.proto```: 用来定义确切 读/写 接口的 protobuf 文件。
