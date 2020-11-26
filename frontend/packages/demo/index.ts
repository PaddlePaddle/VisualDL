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

import {Request, Response} from 'express';

import IO from './builder/io';
import meta from './data/meta.json';
import path from 'path';

function notFound(res: Response) {
    res.status(404).send({
        status: 1,
        msg: 'Not found'
    });
}

export default async (req: Request, res: Response) => {
    const method = req.path;

    if (!method) {
        return notFound(res);
    }

    const data = meta.find(item =>
        IO.isSameUri(item, {uri: method, query: req.query as Record<string, string | string[]>})
    );

    if (!data) {
        return notFound(res);
    }

    res.sendFile(path.join(__dirname, 'data/data', data.uri, data.filename), {
        headers: data.headers
    });
};
