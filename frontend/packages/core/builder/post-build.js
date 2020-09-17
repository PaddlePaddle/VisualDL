/* eslint-disable @typescript-eslint/no-var-requires */

require('dotenv').config();
require('./environment');

const path = require('path');
const pushCdn = require('./cdn');
const injectTemplate = require('./inject-template');
const injectEnv = require('./inject-env');

const dist = path.resolve(__dirname, '../dist');

async function main() {
    await injectTemplate();

    await injectEnv();

    if (process.env.CDN_VERSION) {
        await pushCdn(dist, {
            exclude: ['index.html', 'index.tpl.html', '__snowpack__/env.local.js']
        });
    }
}

main();
