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
            'input_reshape/input/text/7',
            'input_reshape/input/text/4',
            'input_reshape/input/text/5',
            'hahaha/input/text/2',
            'hahaha/input/text/3',
            'hahaha/input/text/0',
            'ohehe/input/text/1',
            '😼/input/text/8',
            '😼/input/text/9'
        ],
        [
            'input_reshape/input/text/6',
            'input_reshape/input/text/7',
            'input_reshape/input/text/4',
            'input_reshape/input/text/5',
            'hahaha/input/text/2',
            'hahaha/input/text/3',
            'oheihei/input/text/0',
            'oheihei/input/text/1',
            '😼/input/text/8',
            '😼/input/text/9'
        ]
    ]
};
