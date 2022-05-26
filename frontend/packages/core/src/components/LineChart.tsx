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

import type {EChartOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {formatTime} from '~/utils';
import {useTranslation} from 'react-i18next';

type LineChartProps = {
    options?: EChartOption;
    title?: string;
    data?: Partial<NonNullable<EChartOption<EChartOption.SeriesLine>['series']>>;
    loading?: boolean;
    zoom?: boolean;
    onInit?: Options['onInit'];
};

export enum XAxisType {
    value = 'value',
    log = 'log',
    time = 'time'
}

export enum YAxisType {
    value = 'value',
    log = 'log'
}

export type LineChartRef = {
    restore(): void;
    saveAsImage(): void;
};

const LineChart = React.forwardRef<LineChartRef, LineChartProps & WithStyled>(
    ({options, data, title, loading, zoom, className, onInit}, ref) => {
        console.log('LineChartData', data);
        const {i18n} = useTranslation();

        const {
            ref: echartRef,
            echart,
            wrapper,
            saveAsImage
        } = useECharts<HTMLDivElement>({
            loading: !!loading,
            zoom,
            autoFit: true,
            onInit
        });

        const theme = useChartTheme();

        useImperativeHandle(ref, () => ({
            restore: () => {
                echart?.dispatchAction({
                    type: 'restore'
                });
            },
            saveAsImage: () => {
                saveAsImage(title);
            }
        }));

        useEffect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {color, colorAlt, series, ...defaults} = chart;
            // chart chart.ts 文件中默认的一些东西，
            console.log('series, data', series, data);
            
            let chartOptions: EChartOption = defaultsDeep(
                {
                    title: {
                        text: title ?? ''
                    },
                    xAxis: {
                        // 是否显示分隔线
                        splitLine: {
                            show: false
                        },
                        splitNumber: 5
                    },
                    yAxis: {
                        // 是否显示分隔线
                        splitNumber: 4
                    },
                    series: data?.map((item, index) =>
                        defaultsDeep(
                            {
                                // show symbol if there is only one point  showSymbol控制数据点隐藏或者显示
                                showSymbol: (item?.data?.length ?? 0) <= 1,
                                type: 'line'
                            },
                            item,
                            {
                                lineStyle: { // 线条样式
                                    color: color[index % color.length],
                                    width: 1.5
                                }
                            },
                            series
                        )
                    )
                },
                options,
                theme,
                defaults
            );
            console.log(
                'chartOptions', chartOptions
            );
            
            if ((chartOptions?.xAxis as EChartOption.XAxis).type === 'time') {
                chartOptions = defaultsDeep(
                    {
                        xAxis: {
                            axisLabel: {
                                formatter: (value: number) => formatTime(value, i18n.language, 'LTS')
                            }
                        }
                    },
                    chartOptions
                );
            }
            if ((chartOptions?.yAxis as EChartOption.YAxis).type === 'time') {
                chartOptions = defaultsDeep(
                    {
                        yAxis: {
                            axisLabel: {
                                formatter: (value: number) => formatTime(value, i18n.language, 'LTS')
                            }
                        }
                    },
                    chartOptions
                );
            }
            echart?.setOption(chartOptions, {notMerge: true});
        }, [options, data, title, theme, i18n.language, echart]);

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

export default LineChart;
