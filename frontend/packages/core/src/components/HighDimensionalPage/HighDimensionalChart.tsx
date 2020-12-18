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

import type {CalculateParams, CalculateResult, Reduction, Shape} from '~/resource/high-dimensional';
import React, {useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState} from 'react';
import ScatterChart, {ScatterChartRef} from '~/components/ScatterChart';

import ChartOperations from '~/components/HighDimensionalPage/ChartOperations';
import type {InfoData} from '~/worker/high-dimensional/calculate';
import type {WithStyled} from '~/utils/style';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import useWorker from '~/hooks/useWorker';

const Wrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
`;

const Toolbar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${rem(20)};

    > .info {
        color: var(--text-light-color);

        > .sep {
            display: inline-block;
            width: 1px;
            background-color: var(--border-color);
            margin: 0 1em;
            height: 1em;
            vertical-align: middle;
        }
    }
`;

const Chart = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-size: 0;
    * {
        outline: none;
    }
`;

type HighDimensionalChartProps = {
    vectors: Float32Array;
    labels: string[];
    shape: Shape;
    dim: number;
    is3D: boolean;
    reduction: Reduction;
    perplexity: number;
    learningRate: number;
    neighbors: number;
    focusedIndices?: number[];
    highlightIndices?: number[];
    onCalculate?: () => unknown;
    onCalculated?: (data: CalculateResult) => unknown;
    onError?: (e: Error) => unknown;
};

export type HighDimensionalChartRef = {
    pauseTSNE(): void;
    resumeTSNE(): void;
    rerunTSNE(): void;
    rerunUMAP(): void;
};

const HighDimensionalChart = React.forwardRef<HighDimensionalChartRef, HighDimensionalChartProps & WithStyled>(
    (
        {
            vectors,
            labels,
            shape,
            dim,
            is3D,
            reduction,
            perplexity,
            learningRate,
            neighbors,
            focusedIndices,
            highlightIndices,
            onCalculate,
            onCalculated,
            onError,
            className
        },
        ref
    ) => {
        const {t} = useTranslation(['high-dimensional', 'common']);

        const chartElement = useRef<HTMLDivElement>(null);
        const chart = useRef<ScatterChartRef>(null);

        const [width, setWidth] = useState(0);
        const [height, setHeight] = useState(0);

        useLayoutEffect(() => {
            const c = chartElement.current;
            if (c) {
                let animationId: number | null = null;
                const observer = new ResizeObserver(() => {
                    if (animationId != null) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                    animationId = requestAnimationFrame(() => {
                        const rect = c.getBoundingClientRect();
                        setWidth(rect.width);
                        setHeight(rect.height);
                    });
                });
                observer.observe(c);
                return () => observer.unobserve(c);
            }
        }, []);

        const params = useMemo<CalculateParams>(() => {
            const result = {
                input: vectors,
                dim,
                n: is3D ? 3 : 2
            };
            switch (reduction) {
                case 'pca':
                    return {
                        reduction,
                        params: {
                            ...result
                        }
                    };
                case 'tsne':
                    return {
                        reduction,
                        params: {
                            perplexity,
                            epsilon: learningRate,
                            ...result
                        }
                    };
                case 'umap':
                    return {
                        reduction,
                        params: {
                            neighbors,
                            ...result
                        }
                    };
                default:
                    return null as never;
            }
        }, [dim, is3D, learningRate, neighbors, perplexity, reduction, vectors]);
        const {data, error, worker} = useWorker<CalculateResult>('high-dimensional/calculate', params);

        const iterationId = useRef<number | null>(null);
        const iteration = useCallback(() => {
            worker?.emit<InfoData>('INFO', {type: 'step'});
        }, [worker]);
        const nextIteration = useCallback(() => {
            iterationId.current = requestAnimationFrame(iteration);
        }, [iteration]);
        const startIteration = useCallback(() => {
            if (reduction === 'tsne') {
                worker?.on('RESULT', nextIteration);
                iteration();
            }
        }, [reduction, worker, nextIteration, iteration]);
        const stopIteration = useCallback(() => {
            if (reduction === 'tsne') {
                if (iterationId.current) {
                    cancelAnimationFrame(iterationId.current);
                    iterationId.current = null;
                }
                worker?.off('RESULT', nextIteration);
            }
        }, [reduction, worker, nextIteration]);
        const restartIteration = useCallback(() => {
            if (reduction === 'tsne') {
                stopIteration();
                worker?.emit<InfoData>('INFO', {type: 'reset'});
                worker?.once('RESULT', () => startIteration());
            }
        }, [reduction, startIteration, stopIteration, worker]);
        useEffect(() => {
            if (reduction === 'tsne') {
                startIteration();
                return () => {
                    stopIteration();
                };
            }
        }, [reduction, startIteration, stopIteration]);

        useEffect(() => {
            if (reduction === 'tsne') {
                worker?.emit<InfoData>('INFO', {
                    type: 'params',
                    data: {
                        perplexity,
                        epsilon: learningRate
                    }
                });
            }
        }, [reduction, perplexity, learningRate, worker]);

        const rerunUMAP = useCallback(() => {
            if (reduction === 'umap') {
                worker?.emit('INFO');
            }
        }, [reduction, worker]);

        useEffect(() => {
            if (error) {
                onError?.(error);
            } else if (data) {
                onCalculated?.(data);
            } else {
                onCalculate?.();
            }
        }, [data, error, onCalculate, onCalculated, onError]);

        useImperativeHandle(ref, () => ({
            pauseTSNE: stopIteration,
            resumeTSNE: startIteration,
            rerunTSNE: restartIteration,
            rerunUMAP
        }));

        return (
            <Wrapper className={className}>
                <Toolbar>
                    <div className="info">
                        {t('high-dimensional:points')}
                        {t('common:colon')}
                        {shape[0]}
                        <span className="sep"></span>
                        {t('high-dimensional:data-dimension')}
                        {t('common:colon')}
                        {shape[1]}
                    </div>
                    <ChartOperations onReset={() => chart.current?.reset()} />
                </Toolbar>
                <Chart ref={chartElement}>
                    <ScatterChart
                        ref={chart}
                        width={width}
                        height={height}
                        data={data?.vectors ?? []}
                        labels={labels}
                        is3D={is3D}
                        rotate={reduction !== 'tsne'}
                        focusedIndices={focusedIndices}
                        highlightIndices={highlightIndices}
                    />
                </Chart>
            </Wrapper>
        );
    }
);

HighDimensionalChart.displayName = 'HighDimensionalChart';

export default HighDimensionalChart;
