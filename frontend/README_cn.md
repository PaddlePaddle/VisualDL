<p align="center">
    <a href="https://github.com/PaddlePaddle/VisualDL"><img align="center" style="width:480px" width="480" src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/frontend/public/images/logo-visualdl.svg?sanitize=true" alt="VisualDL" /></a>
</p>
<br />

<p align="center">
    <a href="https://www.npmjs.com/package/visualdl"><img src="https://img.shields.io/npm/v/visualdl?style=flat-square" alt="NPM Version" /></a>
    <a href="https://travis-ci.org/PaddlePaddle/VisualDL"><img src="https://img.shields.io/travis/PaddlePaddle/VisualDL?style=flat-square" alt="Build Status" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL"><img src="https://img.shields.io/github/languages/top/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub top language" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style: prettier" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE"><img src="https://img.shields.io/github/license/PaddlePaddle/VisualDL?style=flat-square" alt="License" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/issues"><img src="https://img.shields.io/github/issues/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub issues" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/graphs/contributors"><img src="https://img.shields.io/github/contributors/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub Contributors" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/stargazers"><img src="https://img.shields.io/github/stars/PaddlePaddle/VisualDL?style=social" alt="GitHub stars" /></a>
</p>

# VisualDL 前端

[English](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/README.md) | 简体中文

**🚧开发中🚧**

**🚧某些功能可能不能正常工作🚧**

**🚧欢迎 Pull Request🚧**

## 开发

> 要求 nodejs ≥ 10 并且 npm ≥ 6

首先，安装所有依赖：

```bash
npm install
# 或者
yarn
```

之后可以启动开发服务：

```bash
yarn dev
```

现在可以用浏览器打开 [http://localhost:8999](http://localhost:8999) 。

你可以使用 `PORT` 环境变量更改服务的端口：

```bash
PORT=3000 yarn dev
```

### WebAssembly

在开发环境中，WebAssembly 默认是**禁用**的。

如果你希望开发 wasm 功能，你必须安装 [Rust](https://www.rust-lang.org/) 和 [Cargo](https://doc.rust-lang.org/cargo/)。

使用 [rustup](https://rustup.rs/) 来安装它们。

然后安装 [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) 来将 rust 代码编译成 wasm 可执行文件。

当环境准备好后，使用下面的命令启动开发环境：

```bash
yarn dev:wasm
```

## 编译和部署

```bash
./scripts/build.sh

yarn start

# 我们正在开发部署功能，请耐心等待
```

### 浏览器兼容性

VisualDL 支持最新版本的 [Google Chrome](https://www.google.com/chrome/) 和 [Mozilla Firefox](https://www.mozilla.org/) 。 [Microsoft Edge](https://www.microsoft.com/edge) 和 [Apple Safari](https://www.apple.com/safari/) 也许可以工作但是并未经过测试。

## 了解更多

本项目基于以下项目：

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [ECharts](https://echarts.apache.org/)

## 作者
<table><tr><td align="center"><a href="https://github.com/PeterPanZH"><img src="https://avatars0.githubusercontent.com/u/3366499?s=460&v=4" width="120px;" alt="PeterPanZH"/><br /><sub><b>PeterPanZH</b></sub></a></td><td align="center"><a href="https://github.com/Niandalu"><img src="https://avatars1.githubusercontent.com/u/6406875?s=460&v=4" width="120px;" alt="Niandalu"/><br /><sub><b>Niandalu</b></sub></a></td></tr></table>

## 许可证

[Apache-2.0](https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE)
