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

const StackColumnChart = React.forwardRef<LineChartRef, any>(
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
            const titles = ['安徽', '江苏', '湖北', '上海', '广东', '特许', '浙江', '北京'],
                v1s = [122, 132, 234, 556, 223, 145, 135, 234],
                v2s = [123, 67, 236, 89, 234, 456, 123, 100],
                v3s = [23, 234, 45, 123, 345, 345, 677, 123],
                v4s = [234, 67, 38, 164, 122, 344, 90, 236],
                v5s = [234, 89, 321, 45, 190, 198, 234, 89];
            let chartOptions: EChartOption = defaultsDeep({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data: ['社区型', '商务型', '商业型', '交通枢纽', '特殊渠道'],
                    bottom: 20,
                    textStyle: {
                        fontSize: 9,
                        color: '#333'
                    },
                    itemWidth: 10,
                    itemHeight: 10
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    top: 20,
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        // data: ['安徽战区', '江苏战区', '湖北战区', '上海战区', '广东战区', '特许直营', '浙江战区', '北京战区', '特许加盟'],
                        data: titles,
                        axisLabel: {
                            fontSize: 10,
                            color: '#333'
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#ccc'
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitArea: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        }
                    }
                ],
                yAxis: {
                    type: 'value',
                    axisLine: {show: false},
                    axisTick: {
                        show: false
                    },
                    splitArea: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        fontSize: 10,
                        color: '#333'
                    }
                },
                series: [
                    {
                        name: '社区型',
                        type: 'bar',
                        barMaxWidth: 38,
                        stack: '数据',
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle: {
                            color: '#4572c4'
                        },
                        data: v1s
                    },
                    {
                        name: '商务型',
                        type: 'bar',
                        stack: '数据',
                        barMaxWidth: 38,
                        itemStyle: {
                            color: '#eb7d31'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: v2s
                    },
                    {
                        name: '商业型',
                        type: 'bar',
                        stack: '数据',
                        barMaxWidth: 38,
                        itemStyle: {
                            color: '#a5a5a5'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: v3s
                    },
                    {
                        name: '交通枢纽',
                        type: 'bar',
                        stack: '数据',
                        barMaxWidth: 38,
                        itemStyle: {
                            color: '#fcbe00'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: v4s
                    },
                    {
                        name: '特殊渠道',
                        type: 'bar',
                        stack: '数据',
                        barMaxWidth: 38,
                        itemStyle: {
                            color: '#5a9bd4'
                        },
                        data: v5s,
                        emphasis: {
                            focus: 'series'
                        }
                    }
                ]
            });
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

export default StackColumnChart;
