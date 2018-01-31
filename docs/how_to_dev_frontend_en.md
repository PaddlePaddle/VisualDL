# VisualDL Web App Develop

VisualDL has two major components. One is the Python/C++ SDK that logs the matrix during training,
the other is the web-app that display visualized training data.

The web-app reads the extract data and draw scalars graph or histograms graphs.
The web-app is where VisualDL transforms the code data into graphs so users can visualize the training progress and make a better network design evaluation.

This article will go over the basic web-app architecture and development steps.

## Web App Overview
The VisualDL web-app home page is constructed by three major Javascript files
1. manifest.js: The manifest configures basic settings  
1. vendor.js: The vendor.js stores all the 3rd party libraries.
1. index.js: The index.js contains all the graph algorithms. All navigations, setting panels are implemented here.
It finds the 'root' DOM in the index.html and attaches the web-app to it.

The graph algorithms are defined in the `.san` files. san is a flexible JavaScript component framework. To draw the graphs we use ECharts's framework. It can pilot charts and graphs with just a few lines of code.
To learn more about ECharts's framework, please visit [ECharts](https://ecomfe.github.io/echarts-doc/public/en/index.html).

## npm package
The VisualDL uses npm to manage the JavaScript files. npm is the package manager for JavaScript and is a great tool to manage multiple dependencies. To confirm that you have npm installed. Please run this command
``` bash
npm -v
```
If your environment does not have npm already, please [download npm](https://www.npmjs.com/get-npm).

The basic packaging information is stored in `package.json`. It specifies build scripts and dependencies for each environment.
npm reads `package.json` to build different package according to the packaging script.

Here is a snippet of the package.json
```
{
  "name": "VisualDL",
  "version": "1.0.0",
  "description": "Visualization toolkit for deep learning",
  "scripts": {
    "release": "cross-env NODE_ENV=production node ./tool/build.js",
    "build": "cross-env NODE_ENV=dev node ./tool/build.js",
    "dev": "cross-env NODE_ENV=dev node tool/dev-server.js",
    "lint": "./node_modules/fecs/bin/fecs --rule"
  },
  "engines": {
    "node": ">= 6.4.0"
  },
  "dependencies": {
    "axios": "^0.16.1",
    "csshint": "^0.3.3"
    ...
    ...
    ...
  }
}
```


## Development Flow
The VisualDL is an open source project. Everyone is welcome to contribute to the project. To get start the process, please refer to [Contribute Code](contribute_code_en.md) to set up the environment.

1. Create Development Server

    Once the setup up is complete. You may create a local development server to test new features or bug fixes.

    To create a development server, please run the following commands.

    ```bash
    # Navigate to the web-app folder
    cd VisualDL/frontend
    # Use npm to run the dev script
    npm run dev
    ```

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

    This means a development server is ready and is accessible at `http://localhost:8999`. Open a browser and navigate to `http://localhost:8999` to access the VisualDL in development mode.
    The development server will listen to any change made to the San or Javascript and update the changes in real time. We recommend doing web-app development under this mode to save time and resources.

1. Prepare for Production

    Once the implementation is complete. We need to run a final test by packaging all the Javascript files and minify them. Please run the following command.

    ```bash
    # Package all the needed info and update the manifest.js, vendor.js and index.js
    npm run build
    ```

    The webpack will now append all the Javascript files and minify them. This process is to test if the files are properly packaged.
    If there is no error, You may now check-in the modified files.

    **Note:** There is no need to check-in the generated files.
    During the production process, the Travis-CI will generate new packaged files and overwrite the previously generated files. Avoid checking in the generated files can keep the repo commit history clean.
