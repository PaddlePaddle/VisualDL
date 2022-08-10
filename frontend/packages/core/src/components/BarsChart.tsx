/* eslint-disable sort-imports */
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
interface Callingtimes {
    key: string[];
    value: number[];
}
type BarsChartProps = {
    options?: EChartsOption;
    title?: string;
    data?: Callingtimes;
    loading?: boolean;
    zoom?: boolean;
    onInit?: Options['onInit'];
    className?: string;
    units?: string;
    isLegend?: boolean;
    text?: number;
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

export type BarChartRef = {
    restore(): void;
    saveAsImage(): void;
};

const Charts = React.forwardRef<BarChartRef, BarsChartProps>(
    ({options, data, title, loading, zoom, className, onInit, text, isLegend, units}, ref) => {
        const {i18n} = useTranslation();
        const {t} = useTranslation(['profiler', 'common']);
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
            if (data) {
                // const {} = chart;
                const chartData = data;
                const color = ['#2932E1', '#00CC88', '#981EFF', '#FF6D6D', '#25C9FF', '#E71ED5', '#FFAA00', '#00307D'];
                const title =
                    text === 1
                        ? t('Number-calls')
                        : text === 2
                        ? t('duration') + `(${units})`
                        : t('Overall-proportion') + `(%)`;

                const values = [];
                for (let index = 0; index < chartData.value.length; index++) {
                    values.push({
                        value: chartData.value[index],
                        itemStyle: {
                            color: color[index]
                        }
                    });
                }

                const chartOptions: EChartsOption = defaultsDeep({
                    title: {
                        bottom: '5%',
                        left: 'center',
                        show: true,
                        text: title,
                        textStyle: {
                            color: '#666666',
                            fontStyle: 'PingFangSC-Regular',
                            fontWeight: '400',
                            fontSize: 12
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        extraCssText:
                            'padding:15px;padding-right:41px;line-height:30px;width:auto;height:auto;background:rgba(0,0,0,0.75);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;border:none;',
                        formatter: function (params: any) {
                            let str = ''; //声明一个变量用来存储数据
                            str +=
                                '<div style="font-size:14px;color:#FFFFFF;font-weight:500;margin-left:17px;">' +
                                params[0].name +
                                '</div>';
                            str += '<div class="tooltipContent">';
                            for (let index = 0; index < params.length; index++) {
                                const element = params[index];
                                str += '<div class="tooltipitems">';
                                str +=
                                    '<span style="font-size:12px;display:inline-block;margin-right:5px;width:12px;height:12px;border-radius:50%;background-color:' +
                                    element.color +
                                    ';"></span>' +
                                    '<span style="color: #FFFFFF;">' +
                                    element.name +
                                    '</span>' +
                                    '</span> : <span style="color: #FFFFFF;">' +
                                    element.data.value +
                                    '</span>';
                                str += '</div>';
                            }
                            str += '</div>';
                            return str;
                        }
                    },
                    legend: {
                        show: isLegend,
                        data: ['Kernel', 'Memcpy', 'Memset', 'Communication', 'Runtime'],
                        top: 0,
                        right: 0,
                        itemGap: 20,
                        textStyle: {
                            fontSize: 14,
                            color: '#666666'
                        },
                        itemWidth: 17,
                        itemHeight: 5
                    },
                    grid: {
                        left: '0',
                        right: '0',
                        top: '4',
                        bottom: '50',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: chartData.key,
                            axisTick: {
                                alignWithLabel: false,
                                show: false
                            },
                            axisLabel: {
                                show: false
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#CCCCCC'
                                }
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                color: '#666666'
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#CCCCCC'
                                }
                            }
                        }
                    ],
                    series: [
                        {
                            type: 'bar',
                            barWidth: '30%',
                            data: values
                        }
                    ]
                });
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [options, data, title, theme, i18n.language, echart, isLegend, units, text]);
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

export default Charts;
