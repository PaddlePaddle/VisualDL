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
import {primaryColor} from '~/utils/style';
import useECharts, {Options, Wrapper, useChartTheme} from '~/hooks/useECharts';

import type {EChartsOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {useTranslation} from 'react-i18next';

type StackChartProps = {
    options?: EChartsOption;
    title?: string;
    data?: any;
    loading?: boolean;
    zoom?: boolean;
    onInit?: Options['onInit'];
    isWorkerName?: boolean;
    className?: string;
    units?: string;
    istotal?: boolean;
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

const StackColumnChart = React.forwardRef<LineChartRef, StackChartProps>(
    ({options, data, title, loading, zoom, className, onInit, isWorkerName, units, istotal}, ref) => {
        const {i18n} = useTranslation();
        const color = ['#2932E1', '#00CC88', '#981EFF', '#FF6D6D', '#25C9FF', '#E71ED5', '#FFAA00', '#00307D'];
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
            const {colorAlt, series, ...defaults} = chart;

            if (data) {
                const titles = isWorkerName ? data.worker_name : data.phase_type;
                const order = data.order;
                // debugger
                const series: any = [];
                for (let index = 0; index < data.order.length; index++) {
                    // debugger
                    series.push({
                        name: order[index],
                        type: 'bar',
                        stack: '数据',
                        barMaxWidth: 38,
                        itemStyle: {
                            color: color[index]
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: data.data[index]
                    });
                }
                const chartOptions: EChartsOption = defaultsDeep(options, {
                    tooltip: {
                        trigger: 'axis',
                        extraCssText:
                            'padding:15px;padding-right:41px;line-height:30px;width:auto;height:auto;background:rgba(0,0,0,0.75);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;border:none;',
                        axisPointer: {
                            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                        },
                        formatter: function (params: any) {
                            let totals = 0;
                            for (let index = 0; index < params.length; index++) {
                                const element = params[index];
                                totals += element.data;
                            }
                            totals = Number(totals.toFixed(2));
                            let str = ''; //声明一个变量用来存储数据
                            str +=
                                '<div style="font-size:16px;color:#FFFFFF;font-weight:500;margin-left:17px;">' +
                                params[0].axisValue +
                                '</div>';
                            str += '<div class="tooltipContent">';
                            str += '<div class="tooltipitems" style=" display: flex;align-items:center;">';
                            if (!istotal) {
                                str +=
                                    '<span style="display:inline-block;margin-right:5px;width:12px;height:12px;border-width:2px;background-color:' +
                                    '#2932E1' +
                                    ';" class="ant-radio-inner ant-radio-checked"></span>' +
                                    '<span style="color: #FFFFFF;">' +
                                    'total' +
                                    '</span>' +
                                    '</span> : <span style="color: #FFFFFF;">' +
                                    totals +
                                    units +
                                    '</span>';
                            }
                            str += '</div>';
                            str += '</div>';
                            for (let index = 0; index < params.length; index++) {
                                const element = params[index];
                                str += '<div class="tooltipitems">';
                                str +=
                                    '<span style="font-size:12px;display:inline-block;margin-right:5px;width:12px;height:12px;border-radius:50%;background-color:' +
                                    color[index] +
                                    ';"></span>' +
                                    '<span style=" font-size:12px;color: #FFFFFF;">' +
                                    order[index] +
                                    '</span>' +
                                    '</span> : <span style="font-size:12px; color: #FFFFFF;">' +
                                    element.data +
                                    units +
                                    '</span>';
                                str += '</div>';
                            }
                            str += '</div>';
                            return str;
                        }
                    },
                    legend: {
                        data: order,
                        top: 0,
                        right: 0,
                        itemGap: 14,
                        textStyle: {
                            fontSize: 14,
                            color: '#666666'
                        },
                        icon: 'path://M14.5,0h-12C1.1,0,0,1.1,0,2.5S1.1,5,2.5,5h12C15.9,5,17,3.9,17,2.5S15.9,0,14.5,0z',
                        itemWidth: 17,
                        itemHeight: 5
                    },
                    grid: {
                        left: '0',
                        right: '0',
                        bottom: '0',
                        top: '62',
                        containLabel: true
                    },
                    xAxis: [
                        {
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
                        name: '',
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
                    series: series
                });
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [options, data, color, title, theme, i18n.language, echart, isWorkerName, units]);

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
