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
import { autoType } from 'd3';

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

const ComparsionChart = React.forwardRef<LineChartRef, LineChartProps & WithStyled>(
    ({options, data, title, loading, zoom, className, onInit}, ref) => {
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

            let chartOptions: EChartOption = defaultsDeep(
                {
                    backgroundColor: '#fff', //背景颜色
                    color: ['#2adecf'],
                    textStyle: {
                        color: '#999' //侧边字体颜色
                    },
                    tooltip: {
                        trigger: 'item',
                        backgroundColor: `rgba(255, 255, 255, 0.9)`,
                        textStyle: {
                            color: '#000000',
                            fontSize: 14
                        }
                        // trigger: 'axis'
                        // axisPointer: {
                        //     type: 'shadow'
                        // }
                    },
                    legend: {
                        data: ['盘点数据总量', '稽核通过率'],
                        textStyle: {
                            color: '#999', //标题：对应图标字体颜色
                            fontSize: '16'
                        },
                        x: 'right'
                        // y: 'bottom'
                    },
                    grid: {
                        left: '6%',
                        right: '6%',
                        bottom: '12%',
                        top: '15%',
                        // containLabel: true
                    }, //折线柱状图位置
                    xAxis: [
                        {
                            data: [
                                '#_SingleProcessDataLoaderlter._next',
                                '#_SingleProcessDataLoaderlter._next2',
                                'Optimizer.step',
                                'Optimizer.step2',
                                'Optimizer.step2'
                            ], //横坐标数据

                            axisLine: {
                                show: true,
                                lineStyle: {
                                    color: '#ccc'
                                }
                            },
                            splitLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                interval: 0,
                                width: 100,
                                ellipsis: '...',
                                overflow: 'truncate'
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            // name: '盘点数据总量',
                            axisLabel: {},
                            splitLine: {
                                lineStyle: {
                                    // type: 'dashed'
                                    color: '#ededed'
                                }
                            },
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            }
                        },
                        {
                            type: 'value',
                            // name: '稽核通过率(%)  ',
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            splitLine: {
                                show: false
                            },
                            axisLabel: {}
                        }
                    ],
                    series: [
                        {
                            name: '盘点数据总量',
                            type: 'bar',
                            barGap: '3',
                            barWidth: '5%',
                            itemStyle: {
                                normal: {
                                    // barBorderRadius: [30, 30, 0, 0],
                                    color: '#00CC88' //柱状图颜色
                                }
                            },
                            data: [140, 110, 100, 100, 100, 150] //数据总量数据
                        },
                        {
                            name: '盘点数据总量2',
                            type: 'bar',
                            barGap: '3',
                            barWidth: '5%',
                            itemStyle: {
                                normal: {
                                    // barBorderRadius: [30, 30, 0, 0],
                                    color: '#2932E1' //柱状图颜色
                                }
                            },
                            data: [120, 130, 140, 140, 190] //数据总量数据
                        },
                        {
                            name: '稽核通过率',
                            type: 'line',
                            yAxisIndex: 1,
                            // symbol: 'circle', //折线图，节点形状
                            // symbolSize: 15, //折线图，节点圆圈大小
                            // itemStyle: {
                            //     normal: {
                            //         show:false,
                            //         color: 'white', //折线图点的颜色
                            //         barBorderRadius: [30, 30, 0, 0],
                            //         lineStyle: {
                            //             color: '#25C9FF' //折线颜色
                            //         }
                            //     }
                            // },
                            label: {
                                show: false,
                                position: 'top',
                                formatter: '{c} %',
                                color: '#333',
                                fontSize: '14'
                            },
                            data: [30, 110, 130, 130, 200] //稽核通过率数据
                        }
                    ]
                },
                options,
                theme,
                defaults
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

export default ComparsionChart;
