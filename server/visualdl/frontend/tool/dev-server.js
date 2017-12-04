process.env.NODE_ENV = 'dev';
let devPort = 8999;
let opn = require('opn');
let express = require('express');
let webpack = require('webpack');
let proxyMiddleware = require('http-proxy-middleware');
let webpackConfig = require('./webpack.dev.config');
let autoresponse = require('autoresponse');
let path = require('path');

let port = devPort;
let autoOpenBrowser = false;

let app = express();
let compiler = webpack(webpackConfig);

let devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    disableHostCheck: true,
    quiet: false,
    noInfo: false,
    stats: {
        colors: true
    },
    headers: {'Access-Control-Allow-Origin': '*'}
});

let hotMiddleware = require('webpack-hot-middleware')(compiler, {
    heartbeat: 2000
});
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        hotMiddleware.publish({
            action: 'reload'
        });
        cb();
    });
});

var context = [
    '/example',
];
var proxypath = '';

var options = {
    target: proxypath,
    changeOrigin: true,
};
if (context.length) {
   // app.use(proxyMiddleware(context, options));
    app.use('/example', proxyMiddleware({
        target: 'www.baidu.com',
        changeOrigin: true,
    }));
}
app.use(autoresponse({
    logLevel: 'debug',
    root: path.dirname(__dirname),
    rules: [
        {
            match: '/example/:id',
            method: ['get']
        }
    ],
    post: {
        match: function (reqPathName) {
            return !/\.(html|js|map)$/.test(reqPathName) && /^\/(api)(.*)/.test(reqPathName);
        }
    },
    delete: {
        match: function () {
            return true;
        }
    },
    get: {
        match: function (reqPathName) {
            return !/\.(html|js|map)$/.test(reqPathName) && /^\/(api)(.*)/.test(reqPathName);
        }
    }

}));

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

let uri = 'http://localhost:' + port;

let _resolve;
let readyPromise = new Promise(resolve => {
    _resolve = resolve;
});

console.log('> Starting dev server...');
devMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n');
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        opn(uri);
    }

    _resolve();
});

let server = app.listen(port);

module.exports = {
    ready: readyPromise,
    close() {
        server.close();
    }
};
