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

import numeric from 'numeric';

export default (input: Float32Array, dim: number, nComponents: number) => {
    const n = input.length / dim;
    const vectors: number[][] = [];
    for (let i = 0; i < n; i++) {
        vectors.push(Array.from(input.subarray(i * dim, i * dim + dim)));
    }
    const {dot, transpose, svd: numericSvd, div} = numeric;
    const scalar = dot(transpose(vectors), vectors);
    const sigma = div(scalar as number[][], n);
    const svd = numericSvd(sigma);
    const variances: number[] = svd.S;
    let totalVariance = 0;
    for (let i = 0; i < variances.length; i++) {
        totalVariance += variances[i];
    }
    for (let i = 0; i < variances.length; i++) {
        variances[i] /= totalVariance;
    }
    const U: number[][] = svd.U;
    const pcaVectors = vectors.map(vector => {
        const newV = new Float32Array(nComponents);
        for (let newDim = 0; newDim < nComponents; newDim++) {
            let dot = 0;
            for (let oldDim = 0; oldDim < vector.length; oldDim++) {
                dot += vector[oldDim] * U[oldDim][newDim];
            }
            newV[newDim] = dot;
        }
        return Array.from(newV);
    });
    const variance = variances.slice(0, nComponents);
    return {
        vectors: pcaVectors,
        variance,
        totalVariance: variance.reduce((s, c) => s + c, 0)
    };
};
