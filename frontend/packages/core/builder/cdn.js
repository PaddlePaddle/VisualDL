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

// cspell:words baiducloud

import {BosClient} from '@baiducloud/sdk';
import Logger from './log.js';
import fs from 'fs/promises';
import mime from 'mime-types';
import path from 'path';

const logger = new Logger('CDN');

const bucket = 'visualdl-static';

async function getFiles(dir) {
    const result = [];
    try {
        const files = await fs.readdir(dir, {withFileTypes: true});
        for (const file of files) {
            if (file.isFile()) {
                const name = path.join(dir, file.name);
                result.push({
                    name,
                    mime: mime.contentType(path.extname(name)),
                    size: (await fs.stat(name)).size
                });
            } else if (file.isDirectory()) {
                result.push(...(await getFiles(path.join(dir, file.name))));
            }
        }
    } catch (e) {
        logger.error(e);
    }
    return result;
}

async function push(directory, options) {
    logger.start();

    const version = options?.version ?? 'latest';

    logger.process(`pushing to CDN with version "${version}"...`);

    if (!options?.ak || !options?.sk) {
        logger.error('No AK and SK specified!');
        process.exit(1);
    }

    let files = [];
    try {
        const stats = await fs.stat(directory);
        if (stats.isDirectory()) {
            files = (await getFiles(directory))
                .map(file => ({filename: path.relative(directory, file.name), ...file}))
                .filter(file => options?.exclude?.includes(file.filename) !== true);
        } else if (stats.isFile()) {
            files.push({
                filename: path.relative(path.basename(directory)),
                name: directory,
                mime: mime.contentType(path.extname(directory)),
                size: stats.size
            });
        } else {
            logger.error(`${directory} does not exist!`);
            process.exit(1);
        }
    } catch (e) {
        logger.error(e);
        process.exit(1);
    }

    const config = {
        endpoint: options?.endpoint ?? 'https://bos.bj.baidubce.com',
        credentials: {
            ak: options.ak,
            sk: options.sk
        }
    };
    const client = new BosClient(config);

    const q = [];
    for (const file of files) {
        (function (f) {
            q.push(
                new Promise((resolve, reject) => {
                    client
                        .putObjectFromFile(bucket, `assets/${version}/${f.filename}`, f.name, {
                            'Content-Length': f.size,
                            'Content-Type': `${f.mime}`
                        })
                        .then(() => {
                            logger.info([f.filename, f.mime, f.size].join(', '));
                            resolve();
                        })
                        .catch(error => {
                            logger.error(f + error + '');
                            reject();
                        });
                })
            );
        })(file);
    }
    try {
        await Promise.all(q);
        logger.end('CDN Pushed.');
    } catch {
        logger.error('Some errors occurred when pushing to CDN.');
    }
}

export default push;
