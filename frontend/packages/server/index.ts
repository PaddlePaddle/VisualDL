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

/* eslint-disable no-console */

import {config} from 'dotenv';
import express from 'express';
import {fileURLToPath} from 'url';
import {promises as fs} from 'fs';
import path from 'path';
import resolve from 'enhanced-resolve';

const cwd = path.dirname(fileURLToPath(import.meta.url));

config();

process.env.SERVER = '1';
const isDev = process.env.NODE_ENV === 'development';
const isDemo = !!process.env.DEMO;

const host = process.env.HOST || 'localhost';
const port = Number.parseInt(process.env.PORT || '', 10) || 8999;
const backend = process.env.BACKEND;
const delay = Number.parseInt(process.env.DELAY || '', 10);
const pingUrl = process.env.PING_URL;

const root = path.dirname(resolve.sync(cwd, '@visualdl/core') || '');

const app = express();

async function parseTemplate() {
    const template = await fs.readFile(path.resolve(root, 'dist/index.tpl.html'), {encoding: 'utf-8'});
    return template.replace(/%(.+?)%/g, (_matched, key) => process.env[key] ?? '');
}

async function extendEnv() {
    const env = await import('@visualdl/core/dist/__snowpack__/env.local.js');
    return Object.keys(env).reduce((m, key) => {
        if (process.env[key] != null) {
            m[key] = process.env[key];
        }
        return m;
    }, Object.assign({}, env));
}

async function start() {
    const template = await parseTemplate();
    const snowpackEnv = await extendEnv();

    const baseUri = snowpackEnv.SNOWPACK_PUBLIC_BASE_URI ?? '';
    const apiUrl = snowpackEnv.SNOWPACK_PUBLIC_API_URL;

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
        const {default: mock} = await import('@visualdl/mock/middleware.js');
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
            .send(
                `export const ${Object.entries(snowpackEnv)
                    .map(
                        ([key, value]) =>
                            `${key}=${'string' === typeof value ? `"${value.replace(/"/g, '\\"')}"` : value}`
                    )
                    .join(',')};`
            );
    });

    app.use(baseUri || '/', express.static(path.resolve(root, 'dist'), {index: false}));

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

start();
