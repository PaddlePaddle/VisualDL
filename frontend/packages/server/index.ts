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
const pingUrl = process.env.PING_URL;

const root = path.dirname(resolve.sync(__dirname, '@visualdl/core'));

const app = express();

async function parseTemplate() {
    const template = await fs.readFile(path.resolve(root, 'index.tpl.html'), {encoding: 'utf-8'});
    return template.replace(/%(.+?)%/g, (_matched, key) => process.env[key] ?? '');
}

async function extendEnv() {
    const content = await fs.readFile(path.resolve(root, '__snowpack__/env.local.js'), {encoding: 'utf-8'});
    const match = content.match(/export default\s*({.*})/);
    const env = JSON.parse(match[1]);
    return Object.keys(env).reduce((m, key) => {
        if (process.env[key] != null) {
            m[key] = process.env[key];
        }
        return m;
    }, env);
}

async function start() {
    require('@visualdl/core/builder/environment');

    // snowpack uses PUBLIC_URL & MODE in template
    // https://www.snowpack.dev/#environment-variables
    process.env.MODE = process.env.NODE_ENV;
    if (process.env.PUBLIC_PATH != null) {
        process.env.PUBLIC_URL = process.env.PUBLIC_PATH;
    }

    const baseUri = process.env.SNOWPACK_PUBLIC_BASE_URI;
    const apiUrl = process.env.SNOWPACK_PUBLIC_API_URL;

    const template = await parseTemplate();
    const env = await extendEnv();

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

    if (baseUri !== '') {
        app.get('/', (_req, res) => {
            res.redirect(baseUri);
        });
    }

    if (pingUrl && pingUrl !== '/' && pingUrl !== baseUri && pingUrl.startsWith('/')) {
        app.get(pingUrl, (_req, res) => {
            res.type('text/plain').status(200).send('OK!');
        });
    }

    app.get(`${baseUri}/__snowpack__/env.local.js`, (_req, res) => {
        res.type('.js')
            .status(200)
            .send(`export default ${JSON.stringify(env)};`);
    });

    app.use(baseUri || '/', express.static(root, {index: false}));

    app.get(/\.wasm/, (_req, res, next) => {
        res.type('application/wasm');
        next();
    });

    app.get('*', (_req, res) => {
        res.type('.html').status(200).send(template);
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
