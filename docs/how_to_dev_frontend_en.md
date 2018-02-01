# VisualDL Web app Develop

VisualDL has two three components.
1. The Python/C++ SDK that logs the data during training.
1. The single page client side app that visualized training data.
1. The server(powered on Flask) that parses the saved data and delivers to the client side app for display.

The server provided the needed data and pass to the client side to draw scalars or histograms. The users can visualize the training progress and make a better network architecture evaluation.

This article will go over the basic web-app architecture and development steps.

## npm package
The VisualDL uses npm to manage the JavaScript files. npm is the package manager for JavaScript and is a great tool to manage multiple dependencies. To confirm that you have npm installed. Please run this command
``` bash
npm -v
```
If your environment does not have npm already, please [download npm](https://www.npmjs.com/get-npm).

The basic packaging information is stored in `package.json`. It specifies build scripts and dependencies for each environment.
npm reads `package.json` to build different package according to the packaging script.
If you are not familiar with npm, please refer to the [npm documentation](https://docs.npmjs.com/) for more detail.

Here is a list of the dependencies used in the VisualDL.
```
"axios": "^0.16.1",
"csshint": "^0.3.3",
"d3-format": "^1.2.1",
"echarts": "^3.8.5",
"file-saver": "^1.3.3",
"htmlcs": "^0.4.1",
"lesslint": "^1.0.2",
"lodash": "^4.17.4",
"normalize.css": "^6.0.0",
"qs": "^6.5.1",
"san": "3.2.3",
"san-mui": "^1.0.4",
"san-router": "^1.1.1",
"san-store": "^1.0.1",
"san-update": "^2.1.0",
"xlsx": "^0.11.3"
```

## Development Flow
The VisualDL is an open source project.
Everyone is welcome to contribute to the project.
To get start the process, please refer to [Contribute Code](contribute_code_en.md) to set up the environment.

####Run The Client Side App In Development

Once the environment setup up is complete. You may run a development client side app to test new features or bug fixes.

To do so, please run the following commands.

```bash
# Navigate to the web-app folder
cd VisualDL/frontend
# Use npm to run the dev script
npm run dev
```

**Note** This client side app can only read the static mock data. In production, there needs to be a server to serve the data to generate scalars or histograms.

You should see the follow lines
```bash
> VisualDL@1.0.0 dev /Users/YOUR_WORK_PLACE/VisualDL/frontend
> cross-env NODE_ENV=dev node tool/dev-server.js

2018-01-30 18:53:36 [INFO] enable autoresponse middleware...
2018-01-30 18:53:37 [INFO] export global mock helper variable mock
> Starting dev server...
webpack: wait until bundle finished:
...
...
...
webpack: Compiled successfully.
> Listening at http://localhost:8999
```

This means a client side app is ready and is accessible at `http://localhost:8999`.
Open a browser and navigate to `http://localhost:8999` to access the client side app in development mode.
The client side app will listen to any change made to the San files or Javascript files and update the changes in real time.
We recommend doing web app development under this mode to save time and resources.

The graph algorithms are defined in the `.san` files. san is a flexible JavaScript component framework. To draw the graphs we use ECharts's framework. It can pilot charts and graphs with just a few lines of code.
To learn more about ECharts's framework, please visit [ECharts](https://ecomfe.github.io/echarts-doc/public/en/index.html).

####Prepare for Production

To build the final package for the production.
Please run the following command.

```bash
# Package all the needed info and update the manifest.js, vendor.js and index.js
npm run release
```

The webpack will now append all the Javascript files and minify them.
This will create a `dist` folder under `frontend` folder.
Built files are meant to be served over an HTTP server.

**Note:** There is no need to check-in the generated files.
During the production process, the package manager will generate new packaged files. Avoid checking in the generated files can keep the repo commit history clean.
