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

const audios = ['1.mp3', '2.wav', '3.mp3', '4.wav', '5.wav', '6.mp3', '7.wav'];

export default async (req: Request, res: Response) => {
    const index = (+req.query.index ?? 0) % audios.length;
    const file = path.resolve(__dirname, '../../assets/audio', audios[index]);
    const result = await fs.readFile(file);
    const contentType = mime.contentType(audios[index]);
    if (contentType) {
        res.setHeader('Content-Type', contentType);
    }
    return result;
};
