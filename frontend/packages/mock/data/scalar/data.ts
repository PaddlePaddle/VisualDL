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

export default (req: Request, res: Response) => {
    const {run, tag, type} = req.query;
    switch (type) {
        case 'tsv':
            res.setHeader('Content-Type', 'text/tab-separated-values');
            break;
        case 'csv':
            res.setHeader('Content-Type', 'text/comma-separated-values');
            break;
    }
    return `scalar\n${run}\n${tag}\n${type}`;
};
