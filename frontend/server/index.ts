import express from 'express';
import next from 'next';
import {setConfig} from 'next/config';
import nextI18NextMiddleware from 'next-i18next/middleware';
import conf from '../next.config';
import nextI18next from '../i18n';

setConfig(conf);

const port = process.env.PORT || 8999;
const app = next({dev: process.env.NODE_ENV !== 'production', conf});
const handle = app.getRequestHandler();

(async () => {
    await app.prepare();
    const server = express();

    await nextI18next.initPromise;
    server.use(nextI18NextMiddleware(nextI18next));

    server.get('*', (req, res) => handle(req, res));

    server.listen(port);
    console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
})();
