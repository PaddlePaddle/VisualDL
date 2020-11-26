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
import mime from 'mime-types';
import path from 'path';

const images = ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.gif', '6.gif', '7.gif', '8.jpeg'];

export default async (req: Request, res: Response) => {
    const index = (+req.query.index ?? 0) % images.length;
    const file = path.resolve(__dirname, '../../assets/image', images[index]);
    const result = await fs.readFile(file);
    const contentType = mime.contentType(images[index]);
    if (contentType) {
        res.setHeader('Content-Type', contentType);
    }
    return result;
};
