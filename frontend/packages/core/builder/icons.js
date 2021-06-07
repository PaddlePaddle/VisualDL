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

const logger = new Logger('Icons');

const cwd = path.dirname(fileURLToPath(import.meta.url));
const iconsPath = path.resolve(cwd, '../dist/__snowpack__/link/packages/icons/components');
const reactPath = path.resolve(cwd, '../dist/__snowpack__/pkg/react.js');
const relativePath = path.relative(iconsPath, reactPath).replace(/\\\\/g, '/');

export default async function build() {
    logger.start();
    logger.process('building icons...');
    const files = await fs.readdir(iconsPath);
    const q = [];
    for (const file of files) {
        (function (f) {
            const filename = path.join(iconsPath, f);
            if (path.extname(filename) === '.js') {
                q.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            const content = await fs.readFile(filename, 'utf-8');
                            await fs.writeFile(
                                filename,
                                content.replace('import*as React from"react";', `import React from"${relativePath}";`)
                            );
                            resolve();
                        } catch {
                            reject();
                        }
                    })
                );
            }
        })(file);
    }
    try {
        await Promise.all(q);
        logger.end('Icons built.');
    } catch {
        logger.error('Some errors occurred when building icons.');
    }
}
