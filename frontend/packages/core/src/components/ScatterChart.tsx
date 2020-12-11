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

import Chart, {ScatterChartOptions as ChartOptions} from '~/resource/ScatterChart';
import React, {useEffect, useImperativeHandle, useRef} from 'react';

import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';
import {themes} from '~/utils/theme';
import useTheme from '~/hooks/useTheme';

const Canvas = styled.canvas<{dark?: boolean}>`
    filter: ${props =>
        props.dark ? 'invert(99%) sepia(7%) saturate(5670%) hue-rotate(204deg) brightness(96%) contrast(79%)' : ''};
`;

export type ScatterChartProps = {
    width: number;
    height: number;
    data: [number, number, number][];
    is3D: boolean;
    rotate?: boolean;
};

export type ScatterChartRef = {
    reset(): void;
};

const ScatterChart = React.forwardRef<ScatterChartRef, ScatterChartProps & WithStyled>(
    ({width, height, data, is3D, rotate, className}, ref) => {
        const theme = useTheme();

        const canvas = useRef<HTMLCanvasElement>(null);
        const chart = useRef<Chart | null>(null);
        const options = useRef<ChartOptions>({width, height, is3D, background: themes.light.backgroundColor});

        useEffect(() => {
            if (canvas.current) {
                chart.current = new Chart(canvas.current, options.current);
            }
        }, []);

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
            chart.current?.setData(data);
        }, [data]);

        useEffect(() => {
            chart.current?.setSize(width, height);
        }, [width, height]);

        useImperativeHandle(ref, () => ({
            reset: () => {
                chart.current?.reset();
            }
        }));

        return <Canvas className={className} ref={canvas} dark={theme === 'dark'} />;
    }
);

ScatterChart.displayName = 'ScatterChart';

export default ScatterChart;
