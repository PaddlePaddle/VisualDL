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

import iris from '../../assets/embedding/metadata/metadata-edited.tsv';
import word2vec from '../../assets/embedding/metadata/word2vec_10000_200d_labels.tsv';

const metadatas = {
    'Word2Vec 10K': word2vec,
    Iris: iris
};

export default async req => {
    const metadata = metadatas[req.query.name + ''];
    if (!metadata) {
        return new Response('', {status: 404});
    }
    const result = await fetch(metadata);
    return new Response(await result.text(), {
        headers: {
            'Content-Type': 'text/tab-separated-values'
        }
    });
};
