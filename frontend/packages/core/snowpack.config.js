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
        baseUrl: process.env.SNOWPACK_PUBLIC_PATH || '/',
        clean: true
    },
    installOptions: {
        polyfillNode: true,
        namedExports: ['file-saver']
    }
};
