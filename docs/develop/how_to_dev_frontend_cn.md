# 前端指南

VisualDL有三个功能模块.
1. 在训练过程中用来记录日志数据的 Python/C++ SDK。
1. 用来可视化训练数据的客户端单页面应用。
1. 后端 Flask 服务器，用来读取日志数据并提供给前端应用，以便前端可以展示各类图标，如柱状图，嵌入图等等.

这篇文档用来介绍前端的架构，以及指导用户自行开发。

## 长话短说
如果您不关心细节，而是想马上开始开发，请运行以下命令。

克隆代码库以及准备开发环境
```bash
git clone git@github.com:PaddlePaddle/VisualDL.git
cd VisualDL
# Install all the requirements, we recommend you to setup a virtual environment to keep it clean.
pip install -r requirements.txt
# Set up the node dependencies and the VisualDL SDK
./scripts/setup_dev_env.sh
```
运行开发服务器，开始码代码喽~
```bash
./scripts/start_dev_server.sh --logdir=<LOG_DIR>
```
这个脚本会在 `http://0.0.0.0:8040` 启动一个开发服务器。打开浏览器，来到 `http://0.0.0.0:8040/`，您就可以发现开发版的 VisualDL 啦~


## 前端网络应用架构

VisualDL 前端网络应用使用多个框架来管理项目。这些框架包括：

1. webpack: 管理所有组件
1. npm: 管理依赖性
1. Vue: 流行的Javascript组件框架
1. ECharts: 专业的数据可视化库

## Webpack
webpack 是一个模块打包框架. 它主要的工作是把前端JavaScript文件带包在一起，提供给浏览器。

很长一段时间，网络开发者不得不关心如何向后兼容以及如何支持不同的浏览器。Webpack可以把JavaScript代码同步编译到不同的版本，以便适应不同的浏览器。
网络开发者不必再担心为了特定的浏览器而订制特定的代码版本。
它也可以 '最小化' 和 '丑化' JavaScript文件。一句话，webpack可以帮助管理你的所有资料（.js, .css, .gif, .sass, etc）.

更多Webpack内容请参考[这里](https://webpack.js.org/).

## npm package
npm 是一个JavaScript的代码包管理器。而且是一个很优秀的管理多种依赖性的工具。请运行以下命令来确保您已经安装了 npm

``` bash
npm -v
```
如果您的环境没有npm，请在 [这里](https://www.npmjs.com/get-npm) 下载.

基本的包裹信息在  `package.json`中。它用来定义构造脚本的依赖关系。
npm 读取 `package.json` 来根据打包脚本构造不同的包裹。
如果您对 npm 还不熟，请看 [这里](https://docs.npmjs.com/)。

运行如下命令来安装所需的依赖库
```bash
# Navigate to the web-app folder
cd VisualDL/frontend
npm install
```

这个命令会逐行检查`package.json`并且安装相应的依赖库到本地的 `node_modules` 文件夹里

## Vue

Vue 是一个很潮的 JavaScript 框架。可以帮助开发者用 MVM 架构模式 开发网络组件。

Vue 允许开发者自己定义视图模型并保存在 .vue 文件里。然后把视图模型绑定到 DOM 对象上。

更多内容参见 [这里](https://vuejs.org/)

## ECharts

我们使用一个国内流行的 ECharts 来显示图表和图像。 ECharts 是领先的开源前端数据可视化库。它支持多种多样的数据可视化需求。

更多关于 [ECharts](https://ecomfe.github.io/echarts-doc/public/en/index.html)的信息。
