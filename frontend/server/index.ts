/**
 * server index
 * @file index.ts
 * @author PeterPan
 */

import path from 'path';
import {promises as fs} from 'fs';
import {config as dotenv} from 'dotenv';
import Koa from 'koa';
import koaStatic from 'koa-static';
import Router from '@koa/router';
import yaml from 'js-yaml';
import {Nuxt, Builder} from 'nuxt';
import consola from 'consola';
import config from '../nuxt.config';

dotenv();

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Context extends Koa.DefaultContext {}
interface State extends Koa.DefaultState {
    ctx: Koa.ParameterizedContext<State, Context>;
}

const app = new Koa<State, Context>();
config.dev = app.env !== 'production';

if (config.dev) {
    const router = new Router();
    router.get('/locales/:lang', async ctx => {
        try {
            const filename = path.resolve(__dirname, '../locales/', `${ctx.params.lang}.yml`);
            const stat = await fs.stat(filename);
            if (stat.isFile()) {
                ctx.response.body = yaml.safeLoad(await fs.readFile(filename, 'utf-8'));
                ctx.response.type = 'text/vnd.yaml';
            } else {
                throw new Error('locale file not found!');
            }
        } catch (e) {
            ctx.response.body = e.message;
            ctx.response.status = 404;
        }
    });
    app.use(router.routes()).use(router.allowedMethods());
}

app.use(koaStatic(path.resolve(__dirname, '../static')));

async function start(): Promise<void> {
    // Instantiate nuxt.js
    const nuxt = new Nuxt(config);

    const {host = process.env.HOST || '127.0.0.1', port = process.env.PORT || 8999} = nuxt.options.server;

    await nuxt.ready();
    // Build in development
    if (config.dev) {
        const builder = new Builder(nuxt);
        await builder.build();
    }

    app.use(ctx => {
        ctx.status = 200; // koa defaults to 404 when it sees that status is unset
        ctx.respond = false; // Bypass Koa's built-in response handling
        ctx.state.ctx = ctx; // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
        nuxt.render(ctx.req, ctx.res);
    });

    const server = app.listen({port, host});

    server.on('listening', () => {
        consola.ready({
            message: `Server listening on http://${host}:${port}`,
            badge: true
        });
        process.send?.('ready');

        process.on('SIGINT', () => {
            server.close();
        });
    });

    server.on('close', () => process.exit(0));
}

start();
