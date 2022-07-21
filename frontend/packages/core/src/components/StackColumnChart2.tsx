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
    ({options, data, title, loading, zoom, className, onInit, color}, ref) => {
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
            const {colorAlt, series, ...defaults} = chart;

            if (data && color) {
                const titles = data.worker_name;
                const order = data.order;
                const series: any = [];
                for (let index = 0; index < data.worker_name.length; index++) {
                    const element = titles[index];
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
                let chartOptions: EChartOption = defaultsDeep(options, {
                    tooltip: {
                        trigger: 'axis',
                        extraCssText:
                            'padding:15px;padding-right:41px;line-height:30px;width:auto;height:auto;background:rgba(0,0,0,0.75);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;',
                        axisPointer: {
                            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                        },
                        formatter: function (params: any) {
                            console.log('Trainchart', params);
                            let totals = 0;
                            for (let index = 0; index < params.length; index++) {
                                const element = params[index];
                                totals += element.data;
                            }
                            totals = Number(totals.toFixed(2))
                            let str = ''; //声明一个变量用来存储数据
                            str +=
                                '<div style="font-size:16px;color:#FFFFFF;font-weight:500;margin-left:17px;">' +
                                params[0].axisValue +
                                '</div>';
                            str += '<div class="tooltipContent">';
                            str += '<div class="tooltipitems" style=" display: flex;align-items:center;">';
                            str +=
                                '<span style="display:inline-block;margin-right:5px;width:12px;height:12px;border-width:2px;background-color:' +
                                '#2932E1' +
                                ';" class="ant-radio-inner ant-radio-checked"></span>' +
                                '<span style="color: #FFFFFF;">' +
                                'total' +
                                '</span>' +
                                '</span> : <span style="color: #FFFFFF;">' +
                                totals +
                                '</span>';
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
                                    '</span>';
                                str += '</div>';
                            }
                            str += '</div>';
                            return str;
                        }
                    },
                    legend: {
                        data: order,
                        top: 20,
                        right: 43,
                        itemGap: 14,
                        textStyle: {
                            fontSize: 14,
                            color: '#666666'
                        },
                        itemWidth: 17,
                        itemHeight: 5
                    },
                    grid: {
                        left: '54',
                        right: '43',
                        bottom: '40',
                        top: '84',
                        containLabel: false
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
                    // dataZoom: [
                    //     //给x轴设置滚动条
                    //     {
                    //         start: 0, //默认为0
                    //         end: 20, //默认为100
                    //         type: 'slider',
                    //         show: true,
                    //         xAxisIndex: [0],
                    //         handleSize: 0, //滑动条的 左右2个滑动条的大小
                    //         height: 8, //组件高度
                    //         left: 50, //左边的距离
                    //         right: 40, //右边的距离
                    //         bottom: 10, //右边的距离
                    //         handleColor: '#ddd', //h滑动图标的颜色
                    //         handleStyle: {
                    //             borderColor: '#cacaca',
                    //             borderWidth: '1',
                    //             shadowBlur: 2,
                    //             background: '#ddd',
                    //             shadowColor: '#ddd'
                    //         },
                    //         // fillerColor: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    //         //     {
                    //         //         //给颜色设置渐变色 前面4个参数，给第一个设置1，第四个设置0 ，就是水平渐变
                    //         //         //给第一个设置0，第四个设置1，就是垂直渐变
                    //         //         offset: 0,
                    //         //         color: '#1eb5e5'
                    //         //     },
                    //         //     {
                    //         //         offset: 1,
                    //         //         color: '#5ccbb1'
                    //         //     }
                    //         // ]),
                    //         backgroundColor: '#ddd', //两边未选中的滑动条区域的颜色
                    //         showDataShadow: false, //是否显示数据阴影 默认auto
                    //         showDetail: false, //即拖拽时候是否显示详细数值信息 默认true
                    //         handleIcon:
                    //             'M-292,322.2c-3.2,0-6.4-0.6-9.3-1.9c-2.9-1.2-5.4-2.9-7.6-5.1s-3.9-4.8-5.1-7.6c-1.3-3-1.9-6.1-1.9-9.3c0-3.2,0.6-6.4,1.9-9.3c1.2-2.9,2.9-5.4,5.1-7.6s4.8-3.9,7.6-5.1c3-1.3,6.1-1.9,9.3-1.9c3.2,0,6.4,0.6,9.3,1.9c2.9,1.2,5.4,2.9,7.6,5.1s3.9,4.8,5.1,7.6c1.3,3,1.9,6.1,1.9,9.3c0,3.2-0.6,6.4-1.9,9.3c-1.2,2.9-2.9,5.4-5.1,7.6s-4.8,3.9-7.6,5.1C-285.6,321.5-288.8,322.2-292,322.2z',
                    //         filterMode: 'filter'
                    //     },
                    //     //下面这个属性是里面拖到
                    //     {
                    //         type: 'inside',
                    //         show: true,
                    //         xAxisIndex: [0],
                    //         start: 0, //默认为1
                    //         end: 100 - 1500 / 31 //默认为100
                    //     }
                    // ],
                    series: series
                });
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [options, data, color, title, theme, i18n.language, echart]);

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
