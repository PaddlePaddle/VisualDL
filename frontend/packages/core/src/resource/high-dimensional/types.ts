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

export type Dimension = '2d' | '3d';
export type Reduction = 'pca' | 'tsne' | 'umap';

export type Vectors = [number, number, number][];

export type VectorResult = {
    dimension: number;
    count: number;
    vectors: Float32Array;
};

export type MetadataResult = {
    dimension: number;
    labels: string[];
    metadata: string[][];
};

export type ParseFromStringParams = {
    vectors: string;
    metadata: string;
};

export type ParseFromBlobParams = {
    shape: [number, number];
    vectors: Blob;
    metadata: string;
};

export type ParseParams =
    | {
          from: 'blob';
          params: ParseFromBlobParams;
      }
    | {
          from: 'string';
          params: ParseFromStringParams;
      }
    | null;

export type ParseResult = {
    dimension: number;
    vectors: Float32Array;
    labels: string[];
    metadata: string[][];
};

export type PcaParams = {
    input: number[];
    dim: number;
    n: number;
};

export type PCAResult = {
    vectors: Vectors;
    variance: number[];
};

export type TSNEParams = {
    input: Float32Array;
    dim: number;
    n: number;
    perplexity?: number;
    epsilon?: number;
};

export type TSNEResult = {
    vectors: Vectors;
    step: number;
};

export type UMAPParams = {
    input: Float32Array;
    dim: number;
    n: number;
    neighbors: number;
};

export type UMAPResult = {
    vectors: Vectors;
    epoch: number;
    nEpochs: number;
};
