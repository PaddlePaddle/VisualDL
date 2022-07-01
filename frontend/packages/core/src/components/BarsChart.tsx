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

const Charts = React.forwardRef<LineChartRef, any>(
    ({options, data, title, loading, zoom, className, onInit, text, isCpu}, ref) => {
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
            const chartData = data;
            const color = ['#2932E1', '#066BFF', '#00CC88', '#FF6600', '#25C9FF'];
            const title = text === 1 ? '调用量（次)' : text === 2 ? '持续时间（us)' : '整体占比（%)';
            const values = [];
            for (let index = 0; index < chartData.value.length; index++) {
                values.push({
                    value: chartData.value[index],
                    itemStyle:{
                        color:color[index]
                    }
                });
            }
            console.log('values', values);
            if (data) {
                let chartOptions: EChartOption = defaultsDeep({
                    title: {
                        bottom: '10%',
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
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '20%',
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
                            axisLine:{
                                lineStyle:{
                                    color:'#CCCCCC'
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
                            axisLabel:{
                                color: '#666666'
                            },
                            axisLine:{
                                lineStyle:{
                                    color:'#CCCCCC'
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
        }, [options, data, title, theme, i18n.language, echart]);
        // const attachRunColor = (runs: string[]): string[] =>
        //   runs?.map((run, index) => {
        //       const i = index % color.length;
        //       return  {

        //       }
        // });
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
