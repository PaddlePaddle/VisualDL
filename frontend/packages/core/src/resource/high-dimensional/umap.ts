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

import {UMAP} from 'umap-js';

export default (
    nComponents: number,
    nNeighbors: number,
    input: Float32Array,
    dim: number,
    epochCallback?: (epoch: number, nEpochs: number) => unknown
) => {
    if (input.length === 0) {
        return;
    }
    const umap = new UMAP({nComponents, nNeighbors});
    const X = [];
    for (let i = 0; i < input.length; i += dim) {
        X.push(Array.from(input.slice(i, i + dim)));
    }
    const nEpochs = umap.initializeFit(X);
    for (let i = 0; i < nEpochs; i++) {
        epochCallback?.(i, nEpochs);
        umap.step();
    }
    return {
        embedding: umap.getEmbedding(),
        nEpochs
    };
};
