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
import {color, colorAlt} from '~/utils/chart';
import type {EChartOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {formatTime} from '~/utils';
import {useTranslation} from 'react-i18next';
import {TorusGeometry} from 'three';

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

const Trainchart = React.forwardRef<LineChartRef, any>(
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
            const titles = ['0', '1', '2', '3'],
                v1s = [0, 132, 123, 111],
                v2s = [123, 15, 123, 122],
                v3s = [26, 234, 23, 111],
                v4s = [234, 67, 234, 23],
                v5s = [234, 89, 234, 64];

            let chartOptions: EChartOption = defaultsDeep({
                // dataZoom: {
                //     type: 'slider',
                //     show: true,
                //     xAxisIndex: [0],
                //     start: 1,
                //     end: 10

                // },
                color: color,
                tooltip: {
                    trigger: 'axis',
                    extraCssText:
                        'padding:15px;line-height:30px;width:auto;height:auto;background:rgba(0,0,0,0.75);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;',
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter: function (params: any) {
                        console.log('Trainchart', params);
                    }
                },
                legend: {
                    data: ['Kernel', 'Memcpy', 'Memset', 'Communication', 'Runtime'],
                    top: 0,
                    right: 0,
                    itemGap: 20,
                    textStyle: {
                        fontSize: 14,
                        color: '#666666',
                        padding: [0, 0, 0, 10]
                    },
                    itemWidth: 17,
                    itemHeight: 5
                },
                grid: {
                    left: '0%',
                    right: '3%',
                    bottom: '0%',
                    top: '15%',
                    containLabel: true
                },
                xAxis: [
                    {
                        name: '步',
                        nameLocation: 'end',
                        nameTextStyle: {
                            fontSize: 12,
                            color: '#999999'
                        },
                        type: 'category',
                        // data: ['安徽战区', '江苏战区', '湖北战区', '上海战区', '广东战区', '特许直营', '浙江战区', '北京战区', '特许加盟'],
                        // max: 6,
                        data: titles,
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
                        },
                        axisLabel: {
                            fontSize: 12,
                            color: '#666666'
                        }
                    }
                ],
                yAxis: {
                    name: '耗时',
                    nameTextStyle: {
                        fontSize: 12,
                        color: '#999999'
                    },
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            opacity: 0.3
                        }
                    },
                    axisLabel: {
                        fontSize: 12,
                        color: '#666666'
                    }
                },
                series: [
                    {
                        name: 'Kernel',
                        type: 'bar',
                        stack: '数据',
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle: {
                            color: '#00CC88',
                            opacity: 0.5
                        },
                        data: v1s
                    },
                    {
                        name: 'Memcpy',
                        type: 'bar',
                        stack: '数据',
                        itemStyle: {
                            color: '#FFB27F'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: v2s
                    },
                    {
                        name: 'Memset',
                        type: 'bar',
                        stack: '数据',
                        // barMinWidth: '50%',
                        itemStyle: {
                            opacity: 0.5,
                            color: '#066BFF'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: v3s
                    },
                    {
                        name: 'Communication',
                        type: 'bar',
                        stack: '数据',
                        // barMinWidth: '50%',
                        itemStyle: {
                            opacity: 0.5,
                            color: '#2932E1'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: v4s
                    },
                    {
                        name: 'Runtime',
                        type: 'bar',
                        stack: '数据',
                        // barMinWidth: '50%',
                        barCategoryGap: '0%',
                        itemStyle: {
                            opacity: 0.5,
                            color: '#25C9FF'
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

export default Trainchart;
