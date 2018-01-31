'use strict';
process.env.NODE_ENV = 'dev';
let devPort = 8999;
let opn = require('opn');
let express = require('express');
let webpack = require('webpack');
let proxyMiddleware = require('http-proxy-middleware');
let webpackConfig = require('./webpack.dev.config');
let autoresponse = require('autoresponse');
let syncRequest = require('sync-request');
let path = require('path');
let args = require('yargs').argv;

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

if (args.backend) {
    console.log("Using backend server at: " + args.backend)
    var backendServerMiddleware = function(req, res, next) {
        if (req.path.startsWith('/data/')) {
            var url = args.backend + req.originalUrl;
            var syncResponse = syncRequest(req.method, url);
            res.status = syncResponse.status;
            res.end(syncResponse.body);
        } else {
            next();
        }
    };

    app.use(backendServerMiddleware);
} else {
    console.log("Using mock backend server");
    // autoresponse
    let AutoresponseMatchs = ['data'];
    let matchsReg = new RegExp(AutoresponseMatchs.join('\|'));
    let excludeReg = /\.(html|js|map)$/;
    let isAutoresponseRequest = (path) => {
        return !excludeReg.test(path) && matchsReg.test(path);
    }

    app.use(autoresponse({
        logLevel: 'debug',
        root: path.dirname(__dirname),
        rules: [
            {
                match: isAutoresponseRequest,
                method: ['get', 'post', , 'delete']
            }
        ]
    }));
}

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
