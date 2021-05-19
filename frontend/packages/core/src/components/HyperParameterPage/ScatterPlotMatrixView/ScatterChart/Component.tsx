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

import type {IndicatorType, ScaleMethod} from '~/resource/hyper-parameter';
import type {Options, Point} from './ScatterChart';
import React, {FunctionComponent, useEffect, useRef} from 'react';

import Chart from './ScatterChart';
import styled from 'styled-components';

const Container = styled.div`
    svg {
        .x-axis,
        .y-axis {
            color: var(--hyper-parameter-graph-axis-color);
        }

        .x-grid,
        .y-grid {
            color: var(--hyper-parameter-graph-grid-color);
        }

        .x-label,
        .y-label {
            color: var(--text-lighter-color);
        }

        .dots {
            pointer-events: none;

            .disabled {
                fill: var(--hyper-parameter-graph-disabled-data-color);
            }
        }

        .hover-dots circle {
            cursor: pointer;

            &.disabled {
                cursor: default;
                pointer-events: none;
            }
        }

        .grid-brush .selection {
            fill: var(--hyper-parameter-graph-brush-color);
            fill-opacity: 0.4;
        }
    }
`;

export interface Data {
    type: [IndicatorType, IndicatorType];
    data: Point[];
}

interface ScatterChartProps {
    data: Data;
    colors?: string[];
    scaleMethods?: [ScaleMethod | null, ScaleMethod | null];
    options?: Options;
    hover?: number | null;
    select?: number | null;
    brush?: number[] | null;
    onHover?: (index: number | null) => unknown;
    onSelect?: (index: number | null) => unknown;
    onBrush?: (indexes: number[] | null) => unknown;
}

const ScatterChart: FunctionComponent<ScatterChartProps> = ({
    data,
    colors,
    scaleMethods,
    options,
    hover,
    select,
    brush,
    onHover,
    onSelect,
    onBrush
}) => {
    const optionsRef = useRef(options);
    const chart = useRef<Chart>();
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (container.current) {
            chart.current = new Chart(container.current, optionsRef.current);
            return () => {
                chart.current?.dispose();
            };
        }
    }, []);

    useEffect(() => {
        chart.current?.render(data.data, data.type);
    }, [data]);

    useEffect(() => {
        chart.current?.setColors(colors ?? []);
    }, [colors]);

    useEffect(() => {
        if (scaleMethods) {
            chart.current?.setScaleMethod(scaleMethods);
        }
    }, [scaleMethods]);

    useEffect(() => {
        if (hover !== undefined) {
            chart.current?.hover(hover);
        }
    }, [hover]);
    useEffect(() => {
        if (select !== undefined) {
            chart.current?.select(select);
        }
    }, [select]);
    useEffect(() => {
        if (brush !== undefined) {
            chart.current?.focus(brush);
        }
    }, [brush]);

    useEffect(() => {
        if (onHover) {
            chart.current?.on('hover', onHover);
            return () => {
                chart.current?.off('hover', onHover);
            };
        }
    }, [onHover]);
    useEffect(() => {
        if (onSelect) {
            chart.current?.on('select', onSelect);
            return () => {
                chart.current?.off('select', onSelect);
            };
        }
    }, [onSelect]);
    useEffect(() => {
        if (onBrush) {
            chart.current?.on('brush', onBrush);
            return () => {
                chart.current?.off('brush', onBrush);
            };
        }
    }, [onBrush]);

    return <Container ref={container}></Container>;
};

export default ScatterChart;
