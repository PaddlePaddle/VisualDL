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

import React, {useEffect, useImperativeHandle, useRef} from 'react';

import type Chart from './ScatterChart';
import type {ScatterChartOptions as ChartOptions} from './ScatterChart';
import LabelChart from './Labels';
import type {Point3D} from './types';
import PointChart from './Points';
import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';
import {themes} from '~/utils/theme';
import useTheme from '~/hooks/useTheme';

const Wrapper = styled.div<{dark?: boolean}>`
    position: relative;
    filter: ${props =>
        props.dark ? 'invert(99%) sepia(7%) saturate(5670%) hue-rotate(204deg) brightness(96%) contrast(79%)' : ''};
`;

export type ScatterChartProps = {
    width: number;
    height: number;
    data: Point3D[];
    labels: string[];
    is3D: boolean;
    rotate?: boolean;
    focusedIndices?: number[];
    highlightIndices?: number[];
    type: 'points' | 'labels';
};

export type ScatterChartRef = {
    reset(): void;
};

const ScatterChart = React.forwardRef<ScatterChartRef, ScatterChartProps & WithStyled>(
    ({width, height, data, labels, is3D, rotate, focusedIndices, highlightIndices, type, className}, ref) => {
        const theme = useTheme();

        const element = useRef<HTMLDivElement>(null);
        const chart = useRef<Chart | null>(null);
        const options = useRef<ChartOptions>({width, height, is3D, background: themes.light.backgroundColor});

        useEffect(() => {
            if (element.current) {
                if (type === 'points') {
                    chart.current = new PointChart(element.current, options.current);
                } else if (type === 'labels') {
                    chart.current = new LabelChart(element.current, options.current);
                } else {
                    chart.current = null;
                }
                return () => {
                    chart.current?.dispose();
                };
            }
        }, [type]);

        useEffect(() => {
            chart.current?.setDimension(is3D);
            if (is3D) {
                if (rotate) {
                    chart.current?.startRotate();
                } else {
                    chart.current?.stopRotate();
                }
            }
        }, [is3D, rotate]);

        useEffect(() => {
            chart.current?.setData(data, labels);
        }, [data, labels, type]);

        useEffect(() => {
            chart.current?.setFocusedPointIndices(focusedIndices ?? []);
        }, [focusedIndices]);

        useEffect(() => {
            chart.current?.setHighLightIndices(highlightIndices ?? []);
        }, [highlightIndices]);

        useEffect(() => {
            chart.current?.setSize(width, height);
        }, [width, height, type]);

        useImperativeHandle(ref, () => ({
            reset: () => {
                chart.current?.reset();
            }
        }));

        return <Wrapper className={className} ref={element} dark={theme === 'dark'} />;
    }
);

ScatterChart.displayName = 'ScatterChart';

export default ScatterChart;
