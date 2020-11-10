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

import React, {FunctionComponent, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import ScatterChart, {ScatterChartRef} from '~/components/ScatterChart';

import ChartOperations from '~/components/HighDimensionalPage/ChartOperations';
import type {PcaResult} from '~/resource/high-dimensional';
import type {WithStyled} from '~/utils/style';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import useWebAssembly from '~/hooks/useWebAssembly';

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
    metadata: string[][];
    dim: number;
    is3D: boolean;
    onCalculate?: () => unknown;
    onCalculated?: (data: PcaResult) => unknown;
    onError?: (e: Error) => unknown;
};

const HighDimensionalChart: FunctionComponent<HighDimensionalChartProps & WithStyled> = ({
    vectors,
    // metadata,
    dim,
    is3D,
    onCalculate,
    onCalculated,
    onError,
    className
}) => {
    const {t} = useTranslation(['high-dimensional', 'common']);

    const chartElement = useRef<HTMLDivElement>(null);
    const chart = useRef<ScatterChartRef>(null);

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const points = useMemo(() => Math.floor(vectors.length / dim), [vectors, dim]);

    useLayoutEffect(() => {
        const c = chartElement.current;
        if (c) {
            const observer = new ResizeObserver(() => {
                const rect = c.getBoundingClientRect();
                setWidth(rect.width);
                setHeight(rect.height);
            });
            observer.observe(c);
            return () => observer.unobserve(c);
        }
    }, []);

    const params = useMemo(() => [Array.from(vectors), dim, 3] as const, [vectors, dim]);
    const {data, error} = useWebAssembly<PcaResult>('high_dimensional_pca', params);
    useEffect(() => {
        if (error) {
            onError?.(error);
        } else if (data) {
            onCalculated?.(data);
        } else {
            onCalculate?.();
        }
    }, [data, error, onCalculate, onCalculated, onError]);

    return (
        <Wrapper className={className}>
            <Toolbar>
                <div className="info">
                    {t('high-dimensional:points')}
                    {t('common:colon')}
                    {points}
                    <span className="sep"></span>
                    {t('high-dimensional:data-dimension')}
                    {t('common:colon')}
                    {dim}
                </div>
                <ChartOperations onReset={() => chart.current?.reset()} />
            </Toolbar>
            <Chart ref={chartElement}>
                <ScatterChart ref={chart} width={width} height={height} data={data?.vectors ?? []} is3D={is3D} />
            </Chart>
        </Wrapper>
    );
};

export default HighDimensionalChart;
