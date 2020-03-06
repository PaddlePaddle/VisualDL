import path from 'path';
import express from 'express';
import next from 'next';
import {setConfig} from 'next/config';
import {argv} from 'yargs';
import {nextI18NextMiddleware} from '../utils/i18next/middlewares';
import nextI18next from '../utils/i18n';
import config from '../next.config';

const isDev = process.env.NODE_ENV !== 'production';

setConfig(config);

const host = (argv.host as string) || process.env.HOST || 'localhost';
const port: string | number = Number.parseInt(argv.port as string, 10) || process.env.PORT || 8999;
const proxy = (argv.proxy as string) || process.env.PROXY;
const delay = Number.parseInt(argv.delay as string, 10);

const app = next({dev: isDev, conf: config});
const handle = app.getRequestHandler();

(async () => {
    await app.prepare();
    const server = express();

    if (proxy) {
        const {createProxyMiddleware} = await import('http-proxy-middleware');
        server.use(config.env.API_URL, createProxyMiddleware({target: proxy, changeOrigin: true}));
    } else if (isDev) {
        const {default: mock} = await import('../utils/mock');
        server.use(
            config.env.API_URL,
            mock({path: path.resolve(__dirname, '../mock'), delay: delay ? () => Math.random() * delay : 0})
        );
    }

    await nextI18next.initPromise;
    server.use(nextI18NextMiddleware(nextI18next));

    server.get('*', (req, res) => handle(req, res));

    server.listen(port);
    console.log(`> Ready on http://${host}:${port}`); // eslint-disable-line no-console
})();
