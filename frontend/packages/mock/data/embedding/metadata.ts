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

import fs from 'fs/promises';
import path from 'path';

const metadatas = {
    'Word2Vec 10K': 'word2vec_10000_200d_labels.tsv',
    Iris: 'metadata-edited.tsv'
};

export default async (req: Request, res: Response) => {
    const metadata = metadatas[req.query.name + ''];
    res.setHeader('Content-Type', 'text/tab-separated-values');
    if (!metadata) {
        res.status(404);
        return '';
    }
    const file = path.resolve(__dirname, '../../assets/embedding/metadata', metadata);
    const result = await fs.readFile(file);
    return result.toString('utf-8');
};
