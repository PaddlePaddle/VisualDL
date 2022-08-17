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

import * as chart from '~/utils/chart';

import React, {useEffect, useImperativeHandle} from 'react';
import {WithStyled, primaryColor} from '~/utils/style';
import useECharts, {Options, Wrapper, useChartTheme} from '~/hooks/useECharts';

import type {EChartsOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';

type BarChartProps = {
    options?: EChartsOption;
    title?: string;
    direction?: 'vertical' | 'horizontal';
    categories?: string[];
    data?: any;
    loading?: boolean;
    onInit?: Options['onInit'];
};

export type BarChartRef = {
    saveAsImage(): void;
};

const BarChart = React.forwardRef<BarChartRef, BarChartProps & WithStyled>(
    ({options, categories, direction, data, title, loading, className, onInit}, ref) => {
        const {
            ref: echartRef,
            echart,
            wrapper,
            saveAsImage
        } = useECharts<HTMLDivElement>({
            loading: !!loading,
            autoFit: true,
            onInit
        });

        const theme = useChartTheme();

        useImperativeHandle(ref, () => ({
            saveAsImage: () => {
                saveAsImage(title);
            }
        }));

        useEffect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {color, colorAlt, series, ...defaults} = chart;

            const isHorizontal = direction === 'horizontal';
            const valueAxis = {
                type: 'value'
            };
            const categoryAxis = {
                type: 'category',
                data: categories,
                axisLabel: {
                    formatter: null
                }
            };
            const seriesData = data?.map((item: any, index: number) =>
                defaultsDeep(
                    item,
                    {
                        itemStyle: {
                            color: color[index % color.length]
                        }
                    },
                    series
                )
            );
            const chartOptions: EChartsOption = defaultsDeep(
                {
                    title: {
                        text: title ?? ''
                    },
                    xAxis: isHorizontal ? valueAxis : categoryAxis,
                    yAxis: isHorizontal ? categoryAxis : valueAxis,
                    series: seriesData
                },
                options,
                theme,
                defaults
            );
            echart?.setOption(chartOptions, {notMerge: true});
        }, [options, data, title, theme, echart, direction, categories]);

        return (
            <Wrapper ref={wrapper} className={className}>
                {!echart && (
                    <div className="loading">
                        <GridLoader color={primaryColor} size="10px" />
                    </div>
                )}
                <div className="echarts" ref={echartRef}></div>
            </Wrapper>
        );
    }
);

export default BarChart;
