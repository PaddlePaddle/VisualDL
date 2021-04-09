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

import type {
    LabelColor,
    LabelMetadata,
    MetadataResult,
    ParseFromBlobParams,
    ParseFromStringParams,
    ParseResult,
    Shape,
    VectorResult
} from './types';

import {LabelType} from './types';
import {safeSplit} from '~/utils';
import uniq from 'lodash/uniq';

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

// Fisher-Yates (aka Knuth) Shuffle
function shuffleIndices(length: number) {
    const indices = Array.from<number>({length}).map((_, i) => i);
    let currentIndex = length;
    while (currentIndex) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        const temporaryValue = indices[currentIndex];
        indices[currentIndex] = indices[randomIndex];
        indices[randomIndex] = temporaryValue;
    }
    return indices;
}

function shuffle(data: ParseResult, maxCount?: number, maxDimension?: number): ParseResult {
    const {
        count: originalCount,
        dimension: originalDimension,
        vectors: originalVectors,
        metadata: originalMetadata
    } = data;
    const count = maxCount ? Math.min(originalCount, maxCount) : originalCount;
    const dimension = maxDimension ? Math.min(originalDimension, maxDimension) : originalDimension;
    const shuffledIndices = shuffleIndices(originalCount);
    const shuffledDimensionIndices = shuffleIndices(originalDimension);
    const vectors = new Float32Array(count * dimension);
    const metadata: string[][] = [];
    for (let c = 0; c < count; c++) {
        const offset = shuffledIndices[c] * originalDimension;
        if (dimension < originalDimension) {
            for (let i = 0; i < dimension; i++) {
                vectors[c + i] = originalVectors[offset + shuffledDimensionIndices[i]];
            }
        } else {
            vectors.set(originalVectors.subarray(offset, offset + dimension), c * dimension);
        }
        metadata.push(originalMetadata[shuffledIndices[c]]);
    }
    return {
        ...data,
        count,
        dimension,
        vectors,
        metadata
    };
}

function rowOfMatrix<T>(matrix: T[][], row: number): T[] {
    return matrix.map(m => m[row]);
}

function transposeMatrix<T>(matrix: T[][]): T[][] {
    if (!matrix.length) {
        return [];
    }
    const result: T[][] = [];
    const dimension = matrix[0].length;
    for (let i = 0; i < dimension; i++) {
        result.push(rowOfMatrix(matrix, i));
    }
    return result;
}

function getLabelColor(labels: string[]): LabelColor {
    const values = labels.map(Number.parseFloat);
    const type = values.every(Number.isFinite) ? LabelType.Value : LabelType.Category;
    switch (type) {
        case LabelType.Value: {
            return {
                type,
                minValue: Math.min(...values),
                maxValue: Math.max(...values)
            };
        }
        case LabelType.Category: {
            return {
                type,
                categories: uniq(labels)
            };
        }
        default:
            return null as never;
    }
}

function parseVectors(str: string): VectorResult {
    if (!str) {
        throw new ParserError('Tenser file is empty', ParserError.CODES.TENSER_EMPTY);
    }
    const rawShape: Shape = [0, 0];
    let vectors = split(str, Number.parseFloat);
    rawShape[0] = vectors.length;
    const dimension = Math.min(...vectors.map(vector => vector.length));
    rawShape[1] = dimension;
    vectors = alignItems(vectors, dimension, 0);
    return {
        rawShape,
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
    metadata = alignItems(metadata, dimension, '');
    let labels: LabelMetadata[] = [];
    if (dimension > 1) {
        // metadata is larger then 1
        const labelNames = metadata.shift() ?? [];
        labels = labelNames.map((label, i) => ({
            label,
            ...getLabelColor(rowOfMatrix(metadata, i))
        }));
    } else {
        labels = [
            {
                label: DEFAULT_METADATA_FIELD,
                ...getLabelColor(rowOfMatrix(metadata, 0))
            }
        ];
    }
    return {
        dimension,
        labels,
        metadata
    };
}

function genMetadataAndLabels(metadata: string, count: number): Pick<MetadataResult, 'labels' | 'metadata'> {
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
        labels: [
            {
                label: INDEX_METADATA_FIELD,
                type: LabelType.Null
            }
        ],
        metadata: Array.from({length: count}, (_, i) => [`${i}`])
    };
}

export function parseFromString({vectors: v, metadata: m, maxCount, maxDimension}: ParseFromStringParams): ParseResult {
    const result: ParseResult = {
        rawShape: [0, 0],
        count: 0,
        dimension: 0,
        vectors: new Float32Array(),
        labels: [],
        metadata: []
    };
    if (v) {
        Object.assign(result, parseVectors(v));
        Object.assign(result, genMetadataAndLabels(m, result.count));
    }
    const {metadata, ...others} = shuffle(result, maxCount, maxDimension);
    return {
        ...others,
        metadata: transposeMatrix(metadata)
    };
}

export async function parseFromBlob({
    shape,
    vectors: v,
    metadata: m,
    maxCount,
    maxDimension
}: ParseFromBlobParams): Promise<ParseResult> {
    const [count, dimension] = shape;
    const vectors = new Float32Array(await v.arrayBuffer());
    if (count * dimension !== vectors.length) {
        throw new ParserError('Size of tensor does not match.', ParserError.CODES.SHAPE_MISMATCH);
    }
    const {metadata, ...others} = shuffle(
        {
            rawShape: shape,
            count,
            dimension,
            vectors,
            ...genMetadataAndLabels(m, count)
        },
        maxCount,
        maxDimension
    );
    return {
        ...others,
        metadata: transposeMatrix(metadata)
    };
}
