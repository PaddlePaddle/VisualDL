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

import type {UMAPParams, UMAPResult} from '~/resource/high-dimensional';

import {UMAP} from '~/resource/high-dimensional';
import {WorkerSelf} from '~/worker';

const workerSelf = new WorkerSelf();
workerSelf.emit('INITIALIZED');
workerSelf.on<UMAPParams>('RUN', data => {
    const result = UMAP(data.n, data.neighbors, data.input, data.dim);
    if (result) {
        workerSelf.emit<UMAPResult>('RESULT', {
            vectors: result.embedding as [number, number, number][],
            epoch: result.nEpochs,
            nEpochs: result.nEpochs
        });
    }
});
workerSelf.on('INFO', () => {
    workerSelf.emit('INITIALIZED');
});
