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
