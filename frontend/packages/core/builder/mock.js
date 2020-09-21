/* eslint-disable @typescript-eslint/no-var-requires */

const {middleware} = require('@visualdl/mock');
const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = {
    middleware: process.env.MOCK
        ? () => createProxyMiddleware({target: process.env.MOCK, changeOrigin: true})
        : middleware,
    pathname: '/api'
};
