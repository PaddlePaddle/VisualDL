# VisualDL Web app Develop

VisualDL has two three components.
1. The Python/C++ SDK that logs the data during training.
1. The single page client side app that visualized training data.
1. The server (powered on Flask) that reads the logs data and delivers it to the client side app for displaying graphs (scalars/histograms) and embeddings.

The server provided the needed data and pass to the client side to draw scalars or histograms. The users can visualize the training progress and make a better network architecture evaluation.

This article will go over the basic web-app architecture and development guide.

## TL;DR
If you are not interested in the details of mobo jumbo and want to start development as soon as possible,
please run the following commands.

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
1. San: Javascript Component framework
1. ECharts: To pilot charts

## Webpack
webpack is a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser.

webpack is like a gospel to the web developers. For a long time, web developers need to worry about backward compatibility or how to support different versions of browsers.
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

## San

San is a JavaScript component framework that helps the developer to implement web component in MVVM architecture pattern.

San allows you to define a self-content view model in a .san file and attach view model objects to DOM objects.
By doing so, the view layer is much cleaner and easier to implement.
View layer only needs to specify the layout of the page.

To learn more about [san](https://github.com/ecomfe/san)

## ECharts

To draw the graphs we use ECharts's framework. It can pilot charts and graphs with just a few lines of code.
You can create a custom graph according to your needs. VisualDL's histogram is an example of a custom chart.

To learn more about ECharts framework, please visit [ECharts](https://ecomfe.github.io/echarts-doc/public/en/index.html).
