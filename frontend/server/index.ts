#!/usr/bin/env node

/* eslint-disable no-console */

import path from 'path';
import express from 'express';
import next from 'next';
import {setConfig} from 'next/config';
import {nextI18NextMiddleware} from '../utils/i18next/middlewares';
import nextI18next from '../utils/i18n';
import config from '../next.config';

const isDev = process.env.NODE_ENV !== 'production';

setConfig(config);

const host = process.env.HOST || 'localhost';
const port = Number.parseInt(process.env.PORT, 10) || 8999;
const backend = process.env.BACKEND;
const delay = Number.parseInt(process.env.DELAY, 10);

const server = express();
const app = next({dev: isDev, conf: config});
const handle = app.getRequestHandler();

async function start() {
    await app.prepare();

    if (backend) {
        const {createProxyMiddleware} = await import('http-proxy-middleware');
        server.use(config.env.API_URL, createProxyMiddleware({target: backend, changeOrigin: true}));
    } else if (isDev) {
        const {default: mock} = await import('../utils/mock');
        server.use(
            config.env.API_URL,
            mock({path: path.resolve(__dirname, '../mock'), delay: delay ? () => Math.random() * delay : 0})
        );
    }

    await nextI18next.initPromise;
    server.use(nextI18NextMiddleware(nextI18next));

    server.get(/\.wasm/, (_req, res, next) => {
        res.type('application/wasm');
        next();
    });

    server.get('*', (req, res) => handle(req, res));

    const s = server.listen(port, host, () => {
        process.send?.('ready');
        console.log(`> Ready on http://${host}:${port}`);
        process.on('SIGINT', () => {
            s.close((err: Error) => {
                if (err) {
                    throw err;
                }
                process.exit(0);
            });
        });
    });
}

if (require.main === module) {
    start();
}

export default start;

export {server, app};
