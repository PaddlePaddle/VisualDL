<p align="center">
    <a href="https://github.com/PaddlePaddle/VisualDL"><img align="center" style="width:480px" width="480" src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/frontend/packages/core/public/images/logo-visualdl.svg?sanitize=true" alt="VisualDL" /></a>
</p>
<br />

<p align="center">
    <a href="https://actions-badge.atrox.dev/PaddlePaddle/VisualDL/goto?ref=develop"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FPaddlePaddle%2FVisualDL%2Fbadge%3Fref%3Ddevelop&style=flat-square" alt="Build Status" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL"><img src="https://img.shields.io/github/languages/top/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub top language" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style: prettier" /></a>
    <a href="https://lerna.js.org/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square" alt="lerna"></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE"><img src="https://img.shields.io/github/license/PaddlePaddle/VisualDL?style=flat-square" alt="License" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/graphs/contributors"><img src="https://img.shields.io/github/contributors/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub Contributors" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/stargazers"><img src="https://img.shields.io/github/stars/PaddlePaddle/VisualDL?style=social" alt="GitHub stars" /></a>
</p>

# VisualDL 前端

[English](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/README.md) | 简体中文

## 使用

> 要求 nodejs ≥ 12 并且 npm ≥ 6

```bash
npm install -g @visualdl/cli
# or
yarn global add @visualdl/cli
```

之后可以启动 VisualDL 服务：

```bash
visualdl start --backend="http://127.0.0.1:8040"
```

要停止 VisualDL 服务：

```bash
visualdl stop
```

更多详情：

```bash
visualdl -h
```

## 开发

```bash
npm install && npm run bootstrap
# or
yarn
```

> 注意：如果你全局安装了 yarn，你不需要运行 bootstrap。因为 yarn 会帮你完成这一步。

## Packages

[core](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/core/README.md)
[server](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/server/README.md)
[netron](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/netron/README.md)
[cli](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/cli/README.md)
[wasm](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/wasm/README.md)
[mock](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/mock/README.md)

## 编译和部署

> 要求 nodejs ≥ 14 并且 npm ≥ 6

> 目前仅支持 Linux/MacOS 上编译。

运行：

```bash
yarn build
```

你会在 `output` 文件夹中得到 `server.tar.gz` 和 `serverless.tar.gz`。

### Server 部署

> 要求 nodejs ≥ 12 并且 npm ≥ 6

解压 `server.tar.gz` 到任何地方。
`cd` 到那个文件夹然后运行：

```bash
npm install --production
```

然后使用：

```bash
npm start
```

来启动生产服务。

### Serverless 部署

解压 `serverless.tar.gz` 到你的 `webroot` 中。
之后即可启动你的 Web 服务器并享受了。

### 浏览器兼容性

VisualDL 支持最新版本的 [Google Chrome](https://www.google.com/chrome/) 和 [Mozilla Firefox](https://www.mozilla.org/) 。 [Microsoft Edge](https://www.microsoft.com/edge) 和 [Apple Safari](https://www.apple.com/safari/) 也许可以工作但是并未经过测试。

## 了解更多

本项目基于以下项目：

- [React](https://reactjs.org/)
- [ECharts](https://echarts.apache.org/)
- [Snowpack](https://www.snowpack.dev/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [Netron](https://github.com/lutzroeder/netron)

## 作者
<table><tr><td align="center"><a href="https://github.com/PeterPanZH"><img src="https://avatars0.githubusercontent.com/u/3366499?s=460&v=4" width="120px;" alt="PeterPanZH"/><br /><sub><b>PeterPanZH</b></sub></a></td><td align="center"><a href="https://github.com/Niandalu"><img src="https://avatars1.githubusercontent.com/u/6406875?s=460&v=4" width="120px;" alt="Niandalu"/><br /><sub><b>Niandalu</b></sub></a></td></tr></table>

## 许可证

[Apache-2.0](https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE)
