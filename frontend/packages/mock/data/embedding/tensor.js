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

import iris from '../../assets/embedding/tensor/iris_tensors.bytes';
import word2vec from '../../assets/embedding/tensor/word2vec_10000_200d_tensors.bytes';

const tensors = {
    'Word2Vec 10K': word2vec,
    Iris: iris
};

export default async req => {
    const tensor = tensors[req.query.name + ''];
    if (!tensor) {
        return new Response(new ArrayBuffer(0), {status: 404});
    }
    const result = await fetch(tensor);
    return new Response(await result.arrayBuffer(), {
        headers: {
            'Content-Type': 'application/octet-stream'
        }
    });
};
