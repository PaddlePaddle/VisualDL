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

import image1 from '../../assets/image/1.jpeg';
import image2 from '../../assets/image/2.jpeg';
import image3 from '../../assets/image/3.jpeg';
import image4 from '../../assets/image/4.jpeg';
import image5 from '../../assets/image/5.gif';
import image6 from '../../assets/image/6.gif';
import image7 from '../../assets/image/7.gif';
import image8 from '../../assets/image/8.jpeg';
import image9 from '../../assets/image/test_image_matrix.png';

import mime from 'mime-types';

const images = [image1, image2, image3, image4, image5, image6, image7, image8,image9];

export default async req => {
    const index = +(req.query.index ?? 0) % images.length;
    const result = await fetch(images[index]);
    const response = new Response(await result.arrayBuffer());
    const contentType = mime.contentType(images[index]);
    if (contentType) {
        response.headers.set('Content-Type', contentType);
    }
    return response;
};
