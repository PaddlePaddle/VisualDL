/* eslint-disable no-console */

import config from '@visualdl/core/next.config';
import express from 'express';
import next from 'next';
import nextI18NextMiddleware from '@visualdl/i18n/middleware';
import path from 'path';
import {setConfig} from 'next/config';

const isDev = process.env.NODE_ENV === 'development';

const host = process.env.HOST || 'localhost';
const port = Number.parseInt(process.env.PORT || '', 10) || 8999;
const backend = process.env.BACKEND;
const delay = Number.parseInt(process.env.DELAY || '', 10);
const publicPath = process.env.PUBLIC_PATH || '/';

const server = express();

async function start() {
    setConfig(config);
    const app = next({dev: isDev, conf: config});
    const handle = app.getRequestHandler();

    await app.prepare();

    if (isDev) {
        const {default: webpack} = await import('webpack');
        const {default: webpackDevMiddleware} = await import('webpack-dev-middleware');
        const {default: webpackConfig} = await import('./webpack.config');

        const compiler = webpack(webpackConfig);
        server.use(
            webpackDevMiddleware(compiler, {
                publicPath
            })
        );
    }

    if (backend) {
        const {createProxyMiddleware} = await import('http-proxy-middleware');
        server.use(
            config.env.API_URL,
            createProxyMiddleware({
                target: backend,
                changeOrigin: true
            })
        );
    } else if (isDev) {
        const {default: mock} = await import('@visualdl/mock');
        server.use(config.env.API_URL, mock({delay: delay ? () => Math.random() * delay : 0}));
    } else {
        console.warn('Server is running in production mode but no backend address specified.');
    }

    if (publicPath !== '/') {
        server.get('/', (_req, res) => {
            res.redirect(publicPath);
        });
    }

    const {default: nextI18Next} = await import('@visualdl/core/utils/i18n');
    await nextI18Next.initPromise;
    server.use(nextI18NextMiddleware(nextI18Next));

    server.get(/\.wasm/, (_req, res, next) => {
        res.type('application/wasm');
        next();
    });

    server.get('*', (req, res) => handle(req, res));

    const s = server.listen(port, host, () => {
        process.send?.('ready');
        console.log(`> Ready on http://${host}:${port}`);
        process.on('SIGINT', () => {
            s.close((err: Error | undefined) => {
                if (err) {
                    throw err;
                }
                process.exit(0);
            });
        });
    });
}

if (require.main === module) {
    const core = require.resolve('@visualdl/core');
    // after webpack building, we dont need to chdir
    if ('string' === typeof core) {
        const cwd = process.cwd();
        const wd = path.dirname(core);
        process.chdir(wd);
        process.on('exit', () => process.chdir(cwd));
        process.on('uncaughtException', () => process.chdir(cwd));
        process.on('unhandledRejection', () => process.chdir(cwd));
    }
    start();
}

export default start;

export {server};
