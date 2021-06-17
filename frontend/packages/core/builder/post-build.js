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

import Logger from './log.js';
import buildIcons from './icons.js';
import {config} from 'dotenv';
import {fileURLToPath} from 'url';
import injectEnv from './inject-env.js';
import injectTemplate from './inject-template.js';
import path from 'path';
import pushCdn from './cdn.js';

const logger = new Logger('Post Build');

config();
const cwd = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(cwd, '../dist');

async function main() {
    logger.info('Post-build Start');

    await injectTemplate();

    await injectEnv();

    await buildIcons();

    if (process.env.CDN_VERSION) {
        await pushCdn(dist, {
            version: process.env.CDN_VERSION,
            endpoint: process.env.BOS_ENDPOINT,
            ak: process.env.BOS_AK,
            sk: process.env.BOS_SK,
            exclude: ['index.html', 'index.tpl.html', '__snowpack__/env.local.js']
        });
    }

    logger.complete('▶ Post-build Complete!');
}

main();
