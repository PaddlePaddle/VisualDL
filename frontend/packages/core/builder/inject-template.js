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

import {SNOWPACK_PUBLIC_BASE_URI, SNOWPACK_PUBLIC_PATH} from './env.js';

import Logger from './log.js';
import {fileURLToPath} from 'url';
import fs from 'fs/promises';
import {minify} from 'html-minifier';
import path from 'path';

const logger = new Logger('Inject template');

const cwd = path.dirname(fileURLToPath(import.meta.url));

const dist = path.resolve(cwd, '../dist');
const input = path.join(dist, 'index.html');
const output = path.join(dist, 'index.tpl.html');

function envProviderTemplate(baseUri) {
    return `
        <script type="module">
            import * as env from '${baseUri}/__snowpack__/env.local.js'; window.__snowpack_env__ = env;
        </script>
    `;
}

const ENV_PROVIDER = envProviderTemplate(SNOWPACK_PUBLIC_BASE_URI);
const ENV_TEMPLATE_PROVIDER = envProviderTemplate('%BASE_URI%');

function injectProvider(content, provider) {
    const scriptPos = content.indexOf('<script ');
    return content.slice(0, scriptPos) + provider + content.slice(scriptPos);
}

function prependPublicPath(content, publicPath) {
    return content.replace(/\b(src|href)=(['"]?)([^'"\s>]*)/gi, (_matched, attr, quote, url) => {
        if (/^\/(_dist_|__snowpack__|web_modules|favicon.ico)\b/.test(url)) {
            url = publicPath + url;
        }
        return attr + '=' + quote + url;
    });
}

async function writeMinified(file, content) {
    await fs.writeFile(
        file,
        minify(content, {
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            sortAttributes: true,
            sortClassName: true
        }),
        'utf-8'
    );
}

export default async () => {
    logger.start();
    logger.process('injecting env to index.html...');
    const index = await fs.readFile(input, 'utf-8');
    const indexWithPublicPath = prependPublicPath(index, SNOWPACK_PUBLIC_PATH);
    const injected = injectProvider(indexWithPublicPath, ENV_PROVIDER);
    logger.process('minifying index.html...');
    await writeMinified(input, injected);
    logger.process('injecting env to index.tpl.html...');
    const template = prependPublicPath(index, '%PUBLIC_URL%');
    const injectedTemplate = injectProvider(template, ENV_TEMPLATE_PROVIDER);
    logger.process('minifying index.tpl.html...');
    await writeMinified(output, injectedTemplate);
    logger.end('Template injected.');
};
