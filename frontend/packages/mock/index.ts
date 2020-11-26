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

import express from 'express';
import middleware from './middleware';

const host = process.env.HOST || 'localhost';
const port = Number.parseInt(process.env.PORT || '', 10) || 8998;
const apiUrl = process.env.API_URL || '/api';

export interface Options {
    host?: string;
    port?: number;
    apiUrl?: string;
}

const server = express();

async function start(options?: Options) {
    const config = Object.assign({host, port, apiUrl}, options);

    server.use(config.apiUrl, middleware());

    const s = server.listen(config.port, config.host, () => {
        process.send?.('ready');
        console.log(`> Ready on http://${config.host}:${config.port}${config.apiUrl}`);
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
    start();
}

export {start, middleware};
