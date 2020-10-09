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

# VisualDL FrontEnd

English | [简体中文](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/README_cn.md)

## Usage

> nodejs ≥ 12 and npm ≥ 6 are required.

```bash
npm install -g @visualdl/cli
# or
yarn global add @visualdl/cli
```

Then you can start VisualDL server by

```bash
visualdl start --backend="http://127.0.0.1:8040"
```

To stop VisualDL server, just type

```bash
visualdl stop
```

For more usage infomation, please type

```bash
visualdl -h
```

## Development

```bash
npm install && npm run bootstrap
# or
yarn
```

> Notice: if you have yarn installed globally, you don't need to bootstrap because yarn workspace will do it for you.

## Packages

[core](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/core/README.md)
[server](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/server/README.md)
[netron](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/netron/README.md)
[cli](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/cli/README.md)
[wasm](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/wasm/README.md)
[mock](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/packages/mock/README.md)

## Build & Deploy

> nodejs ≥ 14 and npm ≥ 6 are required.

> We only support building on Linux/MacOS now.

Run:

```bash
yarn build
```

You will get `server.tar.gz` and `serverless.tar.gz` in `output` directory.

### Server deployment

> nodejs ≥ 12 and npm ≥ 6 are required.

Extract `server.tar.gz` to wherever you want.
`cd` into the directory and run:

```bash
npm install --production
```

Then use:

```bash
npm start
```

to start a production server.

### Serverless deployment

Extract `serverless.tar.gz` to your `webroot`.
Just start your web server and enjoy.

### Browser Compatibility

VisualDL supports the latest version of [Google Chrome](https://www.google.com/chrome/) and [Mozilla Firefox](https://www.mozilla.org/). [Microsoft Edge](https://www.microsoft.com/edge) and [Apple Safari](https://www.apple.com/safari/) may work too but are not tested.

## Learn More

This project is based on following projects:

- [React](https://reactjs.org/)
- [ECharts](https://echarts.apache.org/)
- [Snowpack](https://www.snowpack.dev/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [Netron](https://github.com/lutzroeder/netron)

## Author
<table><tr><td align="center"><a href="https://github.com/PeterPanZH"><img src="https://avatars0.githubusercontent.com/u/3366499?s=460&v=4" width="120px;" alt="PeterPanZH"/><br /><sub><b>PeterPanZH</b></sub></a></td><td align="center"><a href="https://github.com/Niandalu"><img src="https://avatars1.githubusercontent.com/u/6406875?s=460&v=4" width="120px;" alt="Niandalu"/><br /><sub><b>Niandalu</b></sub></a></td></tr></table>

## License

[Apache-2.0](https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE)
