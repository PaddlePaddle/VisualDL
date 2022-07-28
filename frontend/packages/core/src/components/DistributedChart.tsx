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
import type {EChartsOption,RegisteredSeriesOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {formatTime} from '~/utils';
import {useTranslation} from 'react-i18next';

type LineChartProps = {
    options?: EChartsOption;
    title?: string;
    data?: Partial<RegisteredSeriesOption['line']>;
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

const DistributedChart = React.forwardRef<LineChartRef, any>(
    ({options, data, title, loading, zoom, className, onInit, isCpu}, ref) => {
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
            if (!data) {
                return;
            }
            console.log('linedata', data);
            // debugger
            const {colorAlt, series, ...defaults} = chart;
            const chartData = data;
            // console.log('data.axis', data.axis.length);
            const seriesData = Object.keys(data.name).map((items, indexs: number) => {
                // const datas = data.linedata[items].map((item: any, index: number) => {
                //     const arrays = Object.values(item);
                //     // arrays.push(data.axis[index]);
                //     return arrays;
                // });
                return {
                    name: `内存使用量（MB)${indexs}`,
                    // step: 'true',
                    type: 'line',
                    // smooth: true,
                    showSymbol: false,
                    symbol: 'circle',
                    symbolSize: 4,
                    emphasis: {
                        focus: 'series',
                        itemStyle: {
                            opacity: 1,
                            borderWidth: 2,
                            borderColor: '#fff',
                            shadowColor: color[0],
                            shadowBlur: 2
                        }
                    },
                    animationDuration: 100,
                    // hoverAnimation: false,
                    data: data[items],
                    encode: {
                        x: [0],
                        y: [1]
                    }
                };
            });
            console.log('seriesData', seriesData);
            if (chartData) {
                const title = 'Peak Memory Usage: 0.4MB';
                let chartOptions: EChartsOption = defaultsDeep({
                    color: ['#2932E1', '#D50505'],
                    // backgroundColor: 'rgb(128, 128, 128, .04)',
                    title: {
                        top: '24',
                        left: '20',
                        show: true,
                        text: title,
                        textStyle: {
                            color: '#666666',
                            fontStyle: 'PingFangSC-Regular',
                            fontWeight: '400',
                            fontSize: 14
                        }
                    },
                    legend: {
                        type: 'plain',
                        show: true,
                        left: 'center'
                        // data: [
                        //     {
                        //         name: '日增量'
                        //     },
                        //     {
                        //         name: '当前数量'
                        //     },
                        //     {
                        //         name: 'value大小'
                        //     }
                        // ]
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (params: any) {
                            console.log('legend', params);
                            var str = ''; //声明一个变量用来存储数据
                            str += '<div class="tooltips">';
                            if (params.length) {
                                const n = params.length / 4 - 1;
                                console.log('legendn', n, params.length);
                                let index = 0;
                                while (index < params.length) {
                                    const element = params[index];
                                    str += '<div class="tooltipName">' + element.seriesName + '';
                                    ('</div>');
                                    str += '<div class="tooltipName">' + element.value[0] + '';
                                    ('</div>');
                                    index += 1 + n;
                                }
                                str += '</div>';
                            }
                            return str;
                        }
                    },
                    grid: {
                        top: '84',
                        left: '78',
                        right: '51',
                        bottom: '46'
                    },
                    xAxis: {
                        crossStyle: {
                            color: '#2932e1',
                            type: 'dashed'
                        },
                        label: {show: true},
                        lineStyle: {color: '#2932e1', type: 'dashed'},
                        type: 'value',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderColor: 'rgba(0, 0, 0, 0.6)',
                        enterable: true
                    },
                    yAxis: {
                        type: 'value',
                        name: '内存使用量（MB',
                        position: 'left',
                        // offset: 0,
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#CCCCCC'
                            }
                        },
                        axisLabel: {
                            color: '#666666',
                            fontSize: 12
                        }
                        // splitNumber: 5
                    },

                    dataZoom: [{
                        type: "inside",
                        xAxisIndex: 0,
                        // startValue: 1574166124,
                        // endValue:1574194004
                    }],
                    series: seriesData
                });

                echart?.setOption(chartOptions, {notMerge: true});
                console.log('chartOptions', chartOptions);
            }
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

export default DistributedChart;
