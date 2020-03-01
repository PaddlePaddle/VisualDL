import path from 'path';
import express from 'express';
import next from 'next';
import {setConfig} from 'next/config';
import nextI18NextMiddleware from 'next-i18next/middleware';
import config from '../next.config';
import nextI18next from '../utils/i18n';

const isDev = process.env.NODE_ENV !== 'production';

setConfig(config);

const port = process.env.PORT || 8999;
const app = next({dev: isDev, conf: config});
const handle = app.getRequestHandler();

(async () => {
    await app.prepare();
    const server = express();

    if (isDev) {
        const {default: mock} = await import('../utils/mock');
        server.use(config.env.API_URL, mock({path: path.resolve(__dirname, '../mock')}));
    }

    await nextI18next.initPromise;
    server.use(nextI18NextMiddleware(nextI18next));

    server.get('*', (req, res) => handle(req, res));

    server.listen(port);
    console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
})();
