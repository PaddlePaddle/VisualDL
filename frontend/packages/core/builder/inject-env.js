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
import {fileURLToPath} from 'url';
import fs from 'fs/promises';
import path from 'path';

const logger = new Logger('Inject env');

const cwd = path.dirname(fileURLToPath(import.meta.url));
const dest = path.resolve(cwd, '../dist/__snowpack__');
const envFile = path.join(dest, 'env.js');

async function envInjectTemplate(env) {
    return `const env = globalThis.__snowpack_env__ || {}; export const ${Object.keys(env)
        .map(key => `${key}=env["${key}"]`)
        .join(',')};`;
}

export default async () => {
    logger.start();
    const env = await import(envFile);
    const envInject = await envInjectTemplate(env);
    logger.process('renaming env.js to env.local.js...');
    await fs.rename(envFile, path.join(dest, 'env.local.js'));
    logger.process('regenerating env.js...');
    await fs.writeFile(envFile, envInject, 'utf-8');
    logger.end('Env injected.');
};
