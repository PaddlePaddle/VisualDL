/* eslint-disable no-console */

import {config} from 'dotenv';
import express from 'express';
import path from 'path';
import resolve from 'enhanced-resolve';

config();

const isDev = process.env.NODE_ENV === 'development';
const isDemo = !!process.env.DEMO;

const host = process.env.HOST || 'localhost';
const port = Number.parseInt(process.env.PORT || '', 10) || 8999;
const backend = process.env.BACKEND;
const delay = Number.parseInt(process.env.DELAY || '', 10);
const publicPath = process.env.PUBLIC_PATH || '/';
const apiUrl = process.env.API_URL || `${process.env.PUBLIC_PATH || ''}/api`;
const pingUrl = process.env.PING_URL;

const root = path.dirname(resolve.sync(__dirname, '@visualdl/core'));

const app = express();

async function start() {
    if (backend) {
        const {createProxyMiddleware} = await import('http-proxy-middleware');
        app.use(
            apiUrl,
            createProxyMiddleware({
                target: backend,
                changeOrigin: true
            })
        );
    } else if (isDemo) {
        try {
            const {default: demo} = await import('@visualdl/demo');
            app.use(apiUrl, demo);
        } catch {
            console.warn('Demo is not installed. Please rebuild server.');
        }
    } else if (isDev) {
        const {middleware: mock} = await import('@visualdl/mock');
        app.use(apiUrl, mock({delay: delay ? () => Math.random() * delay : 0}));
    } else {
        console.warn('Server is running in production mode but no backend address specified.');
    }

    if (publicPath !== '/') {
        app.get('/', (_req, res) => {
            res.redirect(publicPath);
        });
    }

    if (pingUrl && pingUrl !== '/' && pingUrl !== publicPath && pingUrl.startsWith('/')) {
        app.get(pingUrl, (_req, res) => {
            res.type('text/plain');
            res.status(200).send('OK!');
        });
    }

    app.use(publicPath, express.static(root, {index: false}));

    app.get(/\.wasm/, (_req, res, next) => {
        res.type('application/wasm');
        next();
    });

    app.get('*', (_req, res) => {
        res.sendFile('index.html', {root});
    });

    const server = app.listen(port, host, () => {
        process.send?.('ready');
        console.log(`> Ready on http://${host}:${port}`);
        process.on('SIGINT', () => {
            server.close(err => {
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

export {app};
