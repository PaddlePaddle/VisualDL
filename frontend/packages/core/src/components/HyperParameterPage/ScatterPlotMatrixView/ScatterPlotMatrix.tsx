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

// cspell:words onhover

import type {IndicatorType, ViewData} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';

import ChartClass from './ScatterChart/ScatterChart';
import ScatterChart from './ScatterChart';
import {rem} from '~/utils/style';
import styled from 'styled-components';

type ScatterPlotMatrixProps = ViewData & {
    colors: string[];
    onHover?: (index: number | null) => unknown;
    onSelect?: (index: number | null) => unknown;
};

const Container = styled.div`
    display: flex;
    flex-direction: column;

    .row {
        display: flex;
        flex-direction: row;
        font-size: ${rem(12)};
    }

    .metrics {
        display: inline-block;
        writing-mode: vertical-rl;
        text-align: center;
        font-weight: 700;
        width: ${rem(14)};
        line-height: ${rem(14)};
    }

    .hparams {
        display: inline-block;
        width: ${150 + ChartClass.MARGIN_WITHOUT_LABEL * 2}px;
        text-align: center;
    }

    .metrics.hparams {
        width: calc(${rem(14)} + ${ChartClass.MARGIN_LEFT_WITH_LABEL - ChartClass.MARGIN_WITHOUT_LABEL}px);
    }

    .hover-dots circle {
        cursor: pointer;
    }
`;

const ScatterPlotMatrix: FunctionComponent<ScatterPlotMatrixProps> = ({
    indicators,
    data,
    colors,
    onHover,
    onSelect
}) => {
    const metricsIndicators = useMemo(() => indicators.filter(i => i.group === 'metrics'), [indicators]);
    const hparamsIndicators = useMemo(() => indicators.filter(i => i.group === 'hparams'), [indicators]);

    const [hover, setHover] = useState<number | null>(null);
    const [select, setSelect] = useState<number | null>(null);

    const onhover = useCallback(
        (index: number | null) => {
            setHover(index);
            onHover?.(index);
        },
        [onHover]
    );
    const onselect = useCallback(
        (index: number | null) => {
            setSelect(index);
            onSelect?.(index);
        },
        [onSelect]
    );

    const chartData = useMemo(
        () =>
            metricsIndicators.map((mi, mii) =>
                hparamsIndicators.map((hi, hii) => ({
                    data: {
                        data: data.map((row, i) => ({
                            data: [row[hi.group][hi.name], row[mi.group][mi.name]] as [
                                string | number,
                                string | number
                            ],
                            color: colors[i] ?? '#000'
                        })),
                        type: [hi.type, mi.type] as [IndicatorType, IndicatorType]
                    },
                    options: {
                        xLabelVisible: mii === metricsIndicators.length - 1,
                        yLabelVisible: hii === 0
                    }
                }))
            ),
        [colors, data, hparamsIndicators, metricsIndicators]
    );

    return (
        <Container>
            {chartData.map((row, ri) => (
                <div className="row" key={ri}>
                    <span className="metrics">{metricsIndicators[ri].name}</span>
                    {row.map((cell, ci) => (
                        <div className="cell" key={ci}>
                            <ScatterChart
                                {...cell}
                                hover={hover}
                                select={select}
                                onHover={onhover}
                                onSelect={onselect}
                            />
                        </div>
                    ))}
                </div>
            ))}
            <div className="row">
                <span className="metrics hparams"></span>
                {hparamsIndicators.map((hi, hii) => (
                    <span className="hparams" key={hii}>
                        {hi.name}
                    </span>
                ))}
            </div>
        </Container>
    );
};

export default ScatterPlotMatrix;
