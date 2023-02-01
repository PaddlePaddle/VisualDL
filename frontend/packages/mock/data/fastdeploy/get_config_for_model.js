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

export default {
    name: 'postprocess',
    config_filenames: 'config_vdlbackup_2023-01',
    input: [
        {
            name: 'POST_INPUT_0',
            dataType: 'TYPE_FP32',
            dims: ['-1', '-1', '-1']
        },
        {
            name: 'POST_INPUT_1',
            dataType: 'TYPE_STRING',
            dims: ['-1']
        }
    ],
    output: [
        {
            name: 'POST_OUTPUT',
            dataType: 'TYPE_STRING',
            dims: ['-1']
        }
    ],
    instanceGroup: [
        {
            count: 1,
            kind: 'KIND_CPU'
        }
    ],
    backend: 'python',
    versions: [
        {
            title: '1',
            key: '1',
            children: [
                {
                    title: '__pycache__',
                    key: '__pycache__'
                },
                {
                    title: 'model.py',
                    key: 'model.py'
                }
            ]
        }
    ]
};
