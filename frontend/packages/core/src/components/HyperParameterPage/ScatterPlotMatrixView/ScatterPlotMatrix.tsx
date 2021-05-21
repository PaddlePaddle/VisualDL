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

import type {Indicator, IndicatorType, ViewData} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';

import ChartClass from './ScatterChart/ScatterChart';
import {ScaleMethod} from '~/resource/hyper-parameter';
import ScaleMethodSelect from '~/components/HyperParameterPage/ScaleMethodSelect';
import ScatterChart from './ScatterChart';
import type {WithStyled} from '~/utils/style';
import {rem} from '~/utils/style';
import styled from 'styled-components';

const CHART_SIZE = 150;

type ScatterPlotMatrixProps = ViewData & {
    colors: string[];
    onHover?: (index: number | null) => unknown;
    onSelect?: (index: number | null) => unknown;
};

const Container = styled.div`
    overflow-x: auto;
    /* this is not allowed, so we change our dropdown list popup direction to top */
    /* overflow-y: visible; */
    display: flex;
    flex-direction: column;
    --label-size: 1em;
    --chart-size: ${rem(CHART_SIZE + ChartClass.MARGIN_WITHOUT_LABEL * 2)};

    .row {
        display: flex;
        flex-direction: row;
    }

    .metrics {
        display: block;
        text-align: center;
        font-weight: 700;
        width: var(--label-size);
        height: var(--chart-size);
        line-height: var(--label-size);

        > span {
            display: inline-block;
            width: var(--chart-size);
            height: var(--label-size);
            transform: rotate(270deg) translate(calc(-1 * var(--chart-size)), 0);
            transform-origin: left top;
        }
    }

    .hparams {
        display: block;
        width: var(--chart-size);
        text-align: center;
        flex: none;

        > span {
            height: var(--label-size);
            line-height: var(--label-size);
        }
    }

    .metrics-hparams {
        width: calc(${rem(14)} + ${ChartClass.MARGIN_LEFT_WITH_LABEL - ChartClass.MARGIN_WITHOUT_LABEL}px);
    }

    .row-scale-method-selector {
        margin: ${rem(10)} 0 ${rem(10)} calc(${rem(10)} + var(--label-size));
        height: 1em;
    }

    .column-scale-method-selector {
        margin-top: ${rem(10)};
    }
`;

const ScatterPlotMatrix: FunctionComponent<ScatterPlotMatrixProps & WithStyled> = ({
    indicators,
    data,
    colors,
    onHover,
    onSelect
}) => {
    const options = useRef({colors});
    const metricsIndicators = useMemo(() => indicators.filter(i => i.group === 'metrics'), [indicators]);
    const hparamsIndicators = useMemo(() => indicators.filter(i => i.group === 'hparams'), [indicators]);

    const [hover, setHover] = useState<number | null>(null);
    const [select, setSelect] = useState<number | null>(null);
    const [brush, setBrush] = useState<number[] | null>(null);
    const [brushedChart, setBrushedChart] = useState<[number, number] | null>(null);

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
    const onBrush = useCallback((row: number, column: number, indexes: number[] | null) => {
        setBrush(indexes);
        setBrushedChart(indexes != null ? [row, column] : null);
    }, []);
    const getBrushValue = useCallback(
        (row: number, column: number) =>
            brushedChart && brushedChart[0] === row && brushedChart[1] === column ? undefined : brush,
        [brush, brushedChart]
    );

    const [scaleMethods, setScaleMethods] = useState<WeakMap<Indicator, ScaleMethod>>(new WeakMap());
    const metricsScaleMethods = useMemo(
        () =>
            metricsIndicators.map(indicator =>
                indicator.type === 'continuous' ? scaleMethods.get(indicator) ?? ScaleMethod.LINEAR : null
            ),
        [metricsIndicators, scaleMethods]
    );
    const hparamsScaleMethods = useMemo(
        () =>
            hparamsIndicators.map(indicator =>
                indicator.type === 'continuous' ? scaleMethods.get(indicator) ?? ScaleMethod.LINEAR : null
            ),
        [hparamsIndicators, scaleMethods]
    );

    const changeScaleMethod = useCallback(
        (indicator: Indicator, scaleMethod: ScaleMethod) => {
            setScaleMethods(m => {
                const n = new WeakMap();
                indicators.forEach(idi => {
                    if (m.has(idi)) {
                        n.set(idi, m.get(idi));
                    }
                });
                n.set(indicator, scaleMethod);
                return n;
            });
        },
        [indicators]
    );

    const chartData = useMemo(
        () =>
            metricsIndicators.map(mi =>
                hparamsIndicators.map(hi => ({
                    data: data.map(
                        row => [row[hi.group][hi.name], row[mi.group][mi.name]] as [string | number, string | number]
                    ),
                    type: [hi.type, mi.type] as [IndicatorType, IndicatorType]
                }))
            ),
        [data, hparamsIndicators, metricsIndicators]
    );

    const matrixData = useMemo(
        () =>
            chartData.map((row, ri) =>
                row.map((column, ci) => ({
                    data: column,
                    options: {
                        ...options.current,
                        labelVisible: [ri === chartData.length - 1, ci === 0] as [boolean, boolean]
                    },
                    scaleMethods: [hparamsScaleMethods[ci], metricsScaleMethods[ri]] as [
                        ScaleMethod | null,
                        ScaleMethod | null
                    ]
                }))
            ),
        [chartData, hparamsScaleMethods, metricsScaleMethods]
    );

    return (
        <Container>
            {matrixData.map((row, ri) => (
                <React.Fragment key={ri}>
                    <div className="row-scale-method-selector">
                        {metricsScaleMethods[ri] != null ? (
                            <ScaleMethodSelect
                                scaleMethod={metricsScaleMethods[ri] as ScaleMethod}
                                onChange={scaleMethod => changeScaleMethod(metricsIndicators[ri], scaleMethod)}
                            />
                        ) : null}
                    </div>
                    <div className="row">
                        <div className="metrics">
                            <span>{metricsIndicators[ri].name}</span>
                        </div>
                        {row.map((cell, ci) => (
                            <div className="cell" key={ci}>
                                <ScatterChart
                                    {...cell}
                                    colors={colors}
                                    hover={hover}
                                    select={select}
                                    brush={getBrushValue(ri, ci)}
                                    onHover={onhover}
                                    onSelect={onselect}
                                    onBrush={indexes => onBrush(ri, ci, indexes)}
                                />
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            ))}
            <div className="row">
                <span className="metrics-hparams"></span>
                {hparamsIndicators.map((hi, hii) => (
                    <div className="hparams" key={hii}>
                        <span>{hi.name}</span>
                        <div className="column-scale-method-selector">
                            {hparamsScaleMethods[hii] != null ? (
                                <ScaleMethodSelect
                                    direction="top"
                                    scaleMethod={hparamsScaleMethods[hii] as ScaleMethod}
                                    onChange={scaleMethod => changeScaleMethod(hparamsIndicators[hii], scaleMethod)}
                                />
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default ScatterPlotMatrix;
