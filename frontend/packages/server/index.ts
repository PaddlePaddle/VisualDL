/* eslint-disable no-console */

import {config} from 'dotenv';
import express from 'express';
import {promises as fs} from 'fs';
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
            res.type('text/plain').status(200).send('OK!');
        });
    }

    require('@visualdl/core/builder/environment');
    // snowpack uses PUBLIC_URL & MODE in template
    // https://www.snowpack.dev/#environment-variables
    process.env.PUBLIC_URL = process.env.PUBLIC_PATH;
    process.env.MODE = process.env.NODE_ENV;

    const template = await fs.readFile(path.resolve(root, '../public/index.html'), {encoding: 'utf-8'});
    const rendered = template.replace(/%(.+?)%/g, (_matched, key) => process.env[key] ?? '');

    const {default: clientEnv} = await import('@visualdl/core/dist/__snowpack__/env');
    const serverEnv = Object.keys(clientEnv).reduce((m, key) => {
        if (process.env[key] != null) {
            m[key] = process.env[key];
        }
        return m;
    }, clientEnv);

    app.get(`${publicPath}/__snowpack__/env.js`, (_req, res) => {
        res.type('.js')
            .status(200)
            .send(`export default ${JSON.stringify(serverEnv)};`);
    });

    app.use(publicPath, express.static(root, {index: false}));

    app.get(/\.wasm/, (_req, res, next) => {
        res.type('application/wasm');
        next();
    });

    app.get('*', (_req, res) => {
        res.type('.html').status(200).send(rendered);
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
