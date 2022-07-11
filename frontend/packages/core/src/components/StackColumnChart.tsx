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
                const titles = data.order;
                const series: any = [];
                for (let index = 0; index < titles.length; index++) {
                    const element = titles[index];
                    series.push({
                        name: element,
                        type: 'bar',
                        stack: '数据',
                        barMaxWidth: 38,
                        itemStyle: {
                            color: color[index]
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: data[element]
                    });
                }
                let chartOptions: EChartOption = defaultsDeep({
                    tooltip: {
                        trigger: 'axis',
                        extraCssText:
                            'padding:15px;line-height:30px;width:auto;height:auto;background:rgba(0,0,0,0.75);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;',
                        axisPointer: {
                            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                        },
                        formatter: function (params: any, index: any) {
                            console.log('StackColumnChart', params, index);
                            var str = ''; //声明一个变量用来存储数据
                            str +=
                                '<div style="font-size:14px;color:#FFFFFF;font-weight:500;margin-left:10px;">' +
                                params[0].name +
                                '</div>';
                            for (let index = 0; index < params.length; index++) {
                                const element = params[index];
                                str +=
                                    '<span style="font-size:12px;display:inline-block;margin-right:5px;margin-bottom:2px;width:6px;height:6px;border-radius:50%;background-color:' +
                                    element.color +
                                    ';"></span>' +
                                    `${element.seriesName}` +
                                    '</span> : <span>' +
                                    element.value +
                                    '</br>';
                            }
                            return str;
                        }
                    },
                    legend: {
                        data: titles,
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
