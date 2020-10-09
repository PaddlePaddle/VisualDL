/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

require('./builder/environment');
const mock = require('./builder/mock');
const icons = require('./builder/icons');
const netron = require('./builder/netron');
const wasm = require('./builder/wasm');

const port = Number.parseInt(process.env.PORT || 3000, 10);
const devServer = {
    port: port + 1,
    host: '127.0.0.1'
};

module.exports = {
    extends: '@snowpack/app-scripts-react',
    plugins: [
        '@snowpack/plugin-dotenv',
        [
            '@snowpack/plugin-optimize',
            {
                minifyHTML: false, // we will do it later in post-build
                preloadModules: true,
                target: ['chrome63', 'firefox67', 'safari11.1', 'edge79'] // browsers support es module
            }
        ],
        [
            '@snowpack/plugin-run-script',
            {
                cmd: 'node builder/icons.js && node builder/netron.js && node builder/wasm.js',
                watch: `node builder/dev-server.js --port ${devServer.port} --host ${devServer.host}`,
                output: 'dashboard'
            }
        ]
    ],
    install: ['@visualdl/wasm'],
    alias: {
        '~': './src'
    },
    proxy: {
        ...[mock.pathname, icons.pathname, netron.pathname, wasm.pathname].reduce((m, pathname) => {
            m[
                process.env.SNOWPACK_PUBLIC_BASE_URI + pathname
            ] = `http://${devServer.host}:${devServer.port}${pathname}`;
            return m;
        }, {})
    },
    devOptions: {
        out: 'dist',
        hostname: process.env.HOST || 'localhost',
        port
    },
    buildOptions: {
        baseUrl: '/', // set it in post-build
        clean: true
    },
    installOptions: {
        polyfillNode: true,
        namedExports: ['file-saver']
    }
};
