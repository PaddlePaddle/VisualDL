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

// cSpell:disable

export default {
    runs: ['train', 'test'],
    tags: [
        [
            'input_reshape/input/image/7',
            'input_reshape/input/image/4',
            'input_reshape/input/image/5',
            'hahaha/input/image/2',
            'hahaha/input/image/3',
            'hahaha/input/image/0',
            'ohehe/input/image/1',
            '😼/input/image/8',
            '😼/input/image/9'
        ],
        [
            'input_reshape/input/image/6',
            'input_reshape/input/image/7',
            'input_reshape/input/image/4',
            'input_reshape/input/image/5',
            'hahaha/input/image/2',
            'hahaha/input/image/3',
            'oheihei/input/image/0',
            'oheihei/input/image/1',
            '😼/input/image/8',
            '😼/input/image/9'
        ]
    ]
};
