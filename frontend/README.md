<p align="center">
    <img align="center" style="width:480px" width="480" src="https://raw.githubusercontent.com/PaddlePaddle/VisualDL/develop/frontend/public/images/logo-visualdl.svg?sanitize=true" />
</p>
<br />

<p align="center">
    <a href="https://travis-ci.org/PaddlePaddle/VisualDL"><img src="https://img.shields.io/travis/PaddlePaddle/VisualDL?style=flat-square" alt="Build Status" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL"><img src="https://img.shields.io/github/languages/top/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub top language" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style: prettier" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL"><img src="https://img.shields.io/github/languages/code-size/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub code size in bytes" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE"><img src="https://img.shields.io/github/license/PaddlePaddle/VisualDL?style=flat-square" alt="License" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/issues"><img src="https://img.shields.io/github/issues/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub issues" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/graphs/contributors"><img src="https://img.shields.io/github/contributors/PaddlePaddle/VisualDL?style=flat-square" alt="GitHub Contributors" /></a>
    <a href="https://github.com/PaddlePaddle/VisualDL/stargazers"><img src="https://img.shields.io/github/stars/PaddlePaddle/VisualDL?style=social" alt="GitHub stars" /></a>
</p>

# VisualDL FrontEnd

English | [简体中文](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/README_cn.md)

**🚧UNDER CONSTRUCTION🚧**

**🚧SOME FEATURE MAY NOT WORK PROPERLY🚧**

**🚧PULL REQUESTS WELCOMED🚧**

## Development

> nodejs ≥ 10 and npm ≥ 6 are required.

First, install all dependencies:

```bash
npm install
# or
yarn
```

Then you can start the development server:

```bash
yarn dev
```

Now open [http://localhost:8999](http://localhost:8999) with your browser.

You can change the port with `PORT` environment variable:

```bash
PORT=3000 yarn dev
```

## Build & Deploy

```bash
./scripts/build.sh

yarn start

# we are working on deployment now, please wait
```

### Browser Compatibility

VisualDL supports the latest version of [Google Chrome](https://www.google.com/chrome/) and [Mozilla Firefox](https://www.mozilla.org/). [Microsoft Edge](https://www.microsoft.com/edge) and [Apple Safari](https://www.apple.com/safari/) may work too but are not tested.

## Learn More

This project is based on following projects:

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [ECharts](https://echarts.apache.org/)

## Author
<table><tr><td align="center"><a href="https://github.com/PeterPanZH"><img src="https://avatars0.githubusercontent.com/u/3366499?s=460&v=4" width="120px;" alt="PeterPanZH"/><br /><sub><b>PeterPanZH</b></sub></a></td><td align="center"><a href="https://github.com/Niandalu"><img src="https://avatars1.githubusercontent.com/u/6406875?s=460&v=4" width="120px;" alt="Niandalu"/><br /><sub><b>Niandalu</b></sub></a></td></tr></table>

## License

[Apache-2.0](https://github.com/PaddlePaddle/VisualDL/blob/develop/LICENSE)
