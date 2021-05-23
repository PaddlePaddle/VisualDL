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

/**
 * GET hparams/list
 *
 * request
 * {}
 */

const a = ['a', 'b', 'c', 'd'];
const b = [3, 2, 1, 4, 5];

export default () =>
    Array(5)
        .fill(undefined)
        .map((_, index) => ({
            name: `run${index}`,
            hparams: {
                lr: a[index % a.length],
                bsize: index * 0.5 + 0.5
            },
            metrics: {
                accuracy: b[index % b.length],
                loss: 100 - index * 0.2111111111111
            }
        }));
