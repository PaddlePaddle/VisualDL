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

import 'isomorphic-fetch';

import {fileURLToPath} from 'url';
import path from 'path';

const cwd = path.dirname(fileURLToPath(import.meta.url));

const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
};

export default options => {
    return async (req, res) => {
        let method = req.path;
        const query = req.query;
        if (!method) {
            method = Array.isArray(query.method)
                ? query.method.join('/')
                : 'string' === typeof query.method
                ? query.method
                : '';
        } else {
            method = method.replace(/^\//, '');
        }

        if (!method) {
            res.status(404).json({
                status: 1,
                msg: 'Method does not exist'
            });
            return;
        }

        try {
            let {default: mock} = await import(path.resolve(options?.path || path.join(cwd, 'data'), method));

            if ('function' === typeof mock) {
                mock = await mock(req, res);
            }

            let delay = 0;
            if ('function' === typeof options?.delay) {
                delay = options.delay(method);
            } else if (options?.delay) {
                delay = options.delay;
            }

            if (delay) {
                await sleep(delay);
            }

            if (mock instanceof Response) {
                res.send(mock);
            } else if ('string' === typeof mock) {
                res.send(mock);
            } else {
                const result = JSON.parse(JSON.stringify(mock, null, 4));
                if (result && 'status' in result && 'data' in result) {
                    res.json(result);
                } else {
                    res.json({status: 0, msg: '', data: result});
                }
            }
        } catch (e) {
            res.status(500).json({
                status: 1,
                msg: e.message
            });
            // eslint-disable-next-line no-console
            console.error(e);
        }
    };
};
