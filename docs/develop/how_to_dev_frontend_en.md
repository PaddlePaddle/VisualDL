# Frontend Guide

VisualDL has three components.
1. The Python/C++ SDK that logs the data during training.
1. The single page client side app that visualized training data.
1. The server (powered on Flask) that reads the logs data and delivers it to the client side app for displaying graphs (scalars/histograms) and embeddings.

This article will go over the basic web-app architecture and development guide.

## TL;DR
If you are not interested in the details of mumbo jumbo and want to start development as soon as possible, please run the following commands.

To clone the repo and to prepare the environment
```bash
git clone git@github.com:PaddlePaddle/VisualDL.git
cd VisualDL
# Install all the requirements, we recommend you to setup a virtual environment to keep it clean.
pip install -r requirements.txt
# Set up the node dependencies and the VisualDL SDK
./scripts/setup_dev_env.sh
```
To run the dev server and start coding
```bash
./scripts/start_dev_server.sh --logdir=<LOG_DIR>
```
The script will run a dev server at `http://0.0.0.0:8040`. Open a browser and navigate to `http://0.0.0.0:8040/` to see it

## Web App Architecture

The VisualDL Web app uses multiple frameworks to help manage the project. They are

1. webpack: To manage all assets
1. npm: To manage dependencies
1. Vue: Javascript Component framework
1. ECharts: To pilot charts

## Webpack
webpack is a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser.

For a long time, web developers need to worry about backward compatibility or how to support different versions of browsers.
webpack can help to transpile the Javascript files to the version where a browser can take. The developers don't need to implement version specific code anymore.
It can also help to minify and uglify Javascript files. In a nutshell, webpack helps to manage all of your assets (.js, .css, .gif, .sass, etc) so you don't have to.

To learn more about [webpack](https://webpack.js.org/).

## npm package
npm is the package manager for JavaScript and is a great tool to manage multiple dependencies. To confirm that you have npm installed. Please run this command
``` bash
npm -v
```
If your environment does not have npm already, please [download npm](https://www.npmjs.com/get-npm).

The basic packaging information is stored in `package.json`. It specifies build scripts and dependencies for each environment.
npm reads `package.json` to build different package according to the packaging script.
If you are not familiar with npm, please refer to the [npm documentation](https://docs.npmjs.com/) for more detail.

Install the necessary dependencies by running
```bash
# Navigate to the web-app folder
cd VisualDL/frontend
npm install
```

This command will go through `package.json` and install the dependencies in the local node_modules folder.

## Vue

Vue is a JavaScript component framework that helps the developer to implement web component in MVVM architecture pattern.

Vue allows you to define a self-contained view model in a .vue file and attach view model objects to DOM objects.

To learn more about [Vue](https://vuejs.org/)

## ECharts

We use ECharts javascript library to render our charts and graphs. ECharts is a leading open source charting library that supports numerous data visualization.

To learn more about ECharts framework, please visit [ECharts](https://ecomfe.github.io/echarts-doc/public/en/index.html).
