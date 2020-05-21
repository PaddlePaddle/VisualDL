/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    entry: path.resolve(__dirname, './index.ts'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: require.resolve('ts-loader')
            }
        ]
    },
    resolve: {
        extensions: ['.wasm', '.ts', '.mjs', '.js', '.json']
    },
    externals: (context, request, callback) => {
        if (request.indexOf(__dirname) === 0) {
            return callback();
        }
        if (/node_modules\/webpack\/buildin/.test(request)) {
            return callback();
        }
        if (/^\./.test(request)) {
            return callback();
        }
        if (/^@visualdl\/core/.test(request)) {
            return callback();
        }
        callback(null, 'commonjs ' + request);
    }
};
