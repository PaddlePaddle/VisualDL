import path from 'path';
import express from 'express';
import next from 'next';
import {setConfig} from 'next/config';
import config from '../next.config';

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

    server.get('*', (req, res) => handle(req, res));

    server.listen(port);
    console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
})();
