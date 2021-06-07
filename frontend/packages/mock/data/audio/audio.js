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

import audio1 from '../../assets/audio/1.mp3';
import audio2 from '../../assets/audio/2.wav';
import audio3 from '../../assets/audio/3.mp3';
import audio4 from '../../assets/audio/4.wav';
import audio5 from '../../assets/audio/5.wav';
import audio6 from '../../assets/audio/6.mp3';
import audio7 from '../../assets/audio/7.wav';
import mime from 'mime-types';

const audios = [audio1, audio2, audio3, audio4, audio5, audio6, audio7];

export default async req => {
    const index = +(req.query.index ?? 0) % audios.length;
    const result = await fetch(audios[index]);
    const response = new Response(await result.arrayBuffer());
    const contentType = mime.contentType(audios[index]);
    if (contentType) {
        response.headers.set('Content-Type', contentType);
    }
    return response;
};
