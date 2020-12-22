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

import type {MetadataResult, ParseFromBlobParams, ParseFromStringParams, ParseResult, VectorResult} from './types';

import {safeSplit} from '~/utils';

const INDEX_METADATA_FIELD = '__index__';
const DEFAULT_METADATA_FIELD = '__metadata__';

const PARSER_ERROR_CODES = {
    NUMBER_MISMATCH: Symbol('NUMBER_MISMATCH'),
    TENSER_EMPTY: Symbol('TENSER_EMPTY'),
    METADATA_EMPTY: Symbol('METADATA_EMPTY'),
    SHAPE_MISMATCH: Symbol('SHAPE_MISMATCH')
} as const;

type ParserErrorCode = string | number | symbol;

export class ParserError extends Error {
    static CODES = PARSER_ERROR_CODES;

    readonly code: ParserErrorCode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly data: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message: string | undefined, code: ParserErrorCode, data?: any) {
        super(message);
        this.code = code;
        this.data = data;
    }
}

function split<T = string>(str: string, handler?: (item: string) => T): T[][] {
    return safeSplit(str, '\n')
        .map(r => safeSplit(r, '\t').map(n => (handler ? handler(n) : n) as T))
        .filter(r => r.length);
}

function alignItems<T>(data: T[][], dimension: number, defaultValue: T): T[][] {
    return data.map(row => {
        const length = row.length;
        if (length > dimension) {
            return row.slice(0, dimension);
        }
        if (length < dimension) {
            return [...row, ...Array.from<T>({length: dimension - length}).fill(defaultValue)];
        }
        return row;
    });
}

function parseVectors(str: string, maxCount?: number, maxDimension?: number): VectorResult {
    if (!str) {
        throw new ParserError('Tenser file is empty', ParserError.CODES.TENSER_EMPTY);
    }
    let vectors = split(str, Number.parseFloat);
    // TODO: random sampling
    if (maxCount) {
        vectors = vectors.slice(0, maxCount);
    }
    let dimension = Math.min(...vectors.map(vector => vector.length));
    if (maxDimension) {
        dimension = Math.min(dimension, maxDimension);
    }
    vectors = alignItems(vectors, dimension, 0);
    return {
        dimension,
        count: vectors.length,
        vectors: new Float32Array(vectors.flat())
    };
}

function parseMetadata(str: string): MetadataResult {
    if (!str) {
        throw new ParserError('Metadata file is empty', ParserError.CODES.METADATA_EMPTY);
    }
    let metadata = split(str);
    // dimension is larger then 0
    const dimension = metadata[0].length;
    let labels = [DEFAULT_METADATA_FIELD];
    metadata = alignItems(metadata, dimension, '');
    if (dimension > 1) {
        // metadata is larger then 1
        labels = metadata.shift() as string[];
    }
    return {
        dimension,
        labels,
        metadata
    };
}

function genMetadataAndLabels(metadata: string, count: number) {
    if (metadata) {
        const data = parseMetadata(metadata);
        const metadataCount = data.metadata.length;
        if (count !== metadataCount) {
            throw new ParserError(
                `Number of tensors (${count}) do not match the number of lines in metadata (${metadataCount}).`,
                ParserError.CODES.NUMBER_MISMATCH,
                {
                    vectors: count,
                    metadata: metadataCount
                }
            );
        }
        return {
            labels: data.labels,
            metadata: data.metadata
        };
    }
    return {
        labels: [INDEX_METADATA_FIELD],
        metadata: Array.from({length: count}, (_, i) => [`${i}`])
    };
}

export function parseFromString({vectors: v, metadata: m, maxCount, maxDimension}: ParseFromStringParams): ParseResult {
    const result: ParseResult = {
        count: 0,
        dimension: 0,
        vectors: new Float32Array(),
        labels: [],
        metadata: []
    };
    if (v) {
        const {dimension, vectors, count} = parseVectors(v, maxCount, maxDimension);
        result.dimension = dimension;
        result.vectors = vectors;
        const metadataAndLabels = genMetadataAndLabels(m, count);
        metadataAndLabels.metadata = metadataAndLabels.metadata.slice(0, count);
        Object.assign(result, metadataAndLabels);
    }
    return result;
}

export async function parseFromBlob({
    shape,
    vectors: v,
    metadata: m,
    maxCount,
    maxDimension
}: ParseFromBlobParams): Promise<ParseResult> {
    // TODO: random sampling
    const [originalCount, originalDimension] = shape;
    const originalVectors = new Float32Array(await v.arrayBuffer());
    if (originalCount * originalDimension !== originalVectors.length) {
        throw new ParserError('Size of tensor does not match.', ParserError.CODES.SHAPE_MISMATCH);
    }
    const count = maxCount ? Math.min(originalCount, maxCount) : originalCount;
    const dimension = maxDimension ? Math.min(originalDimension, maxDimension) : originalDimension;
    const vectors = new Float32Array(count * dimension);
    for (let c = 0; c < count; c++) {
        const offset = c * originalDimension;
        vectors.set(originalVectors.subarray(offset, offset + dimension), c * dimension);
    }
    const metadataAndLabels = genMetadataAndLabels(m, originalCount);
    metadataAndLabels.metadata = metadataAndLabels.metadata.slice(0, count);
    return {
        count,
        dimension,
        vectors,
        ...metadataAndLabels
    };
}
