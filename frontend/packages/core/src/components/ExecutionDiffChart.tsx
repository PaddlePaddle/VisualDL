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
import * as echarts from 'echarts';
import {WithStyled, primaryColor, opacify} from '~/utils/style';
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

const ExecutionDiffChart = React.forwardRef<LineChartRef, any>(
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
            const {color, colorAlt, series, ...defaults} = chart;
            const chartData = true;
            if (chartData) {
                const title = 'Peak Memory Usage: 0.4MB';
                let chartOptions: EChartOption = defaultsDeep({
                    // backgroundColor:'#0c2d55',
                    tooltip: {
                        trigger: 'axis',
                    },
                    color:['#fcba62','#69f0ff'],
                    legend: {
                        x: 'left',
                        top: '11%',
                        left:'15%',
                        textStyle: {
                            color: '#68a9ff',
                            fontSize: 14,
                            padding:[0,8,0,8]
                        }
                    },
                    grid: {
                        top: '15%',
                        left: '10%',
                        right: '5%',
                        bottom: '15%',
                    },
                    xAxis: [
                        {
                            type: 'category',
                            axisLine: {
                                lineStyle: {
                                    color: '#425b78'
                                }
                            },
                            axisLabel: {
                                color: '#b9bec6',
                            },
                            splitLine: {
                                show: false,
                            },
                            boundaryGap: false,
                            data: ['2020-06-21', '2020-06-22', '2020-06-23', '2020-06-24', '2020-06-25', '2020-06-26', '2020-06-27'], //this.$moment(data.times).format("HH-mm") ,
                        },
                    ],
                
                    yAxis: [
                        {
                            type: 'value',
                            name: '单位：m/s',
                            nameTextStyle:{
                                         color:"#b9bec6", 
                                         fontSize:12,  
                                     },
                            axisLine: {
                                lineStyle: {
                                    color: '#425b78',
                                    fontSize: 14
                                }
                            },
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: '#587485',
                                },
                            },
                            axisLabel: {
                                show: true,
                                textStyle: {
                                    color: '#b9bec6',
                
                                },
                            },
                        },
                    ],
                    series: [
                        {
                            name: '风速',
                            type: 'line',
                            showSymbol: false,
                            step:'end',
                            lineStyle: {
                                normal: {
                                    color: '#fcba62',
                                },
                            },
                            // label: {
                            //     show: true,
                            //     position: 'top',
                            //     textStyle: {
                            //         color: '#A582EA',
                            //     }
                            // },
                            // itemStyle: {
                            //     color: "#fff",
                            //     borderColor: "#A582EA",
                            //     borderWidth: 2,
                            // },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(
                                        0,
                                        0,
                                        0,
                                        1,
                                        [
                                            {
                                                offset: 0,
                                                color: 'rgba(223,172,105,1)',
                                            },
                                            {
                                                offset: 1,
                                                color: 'rgba(212,190,161,0.7)',
                                            },
                                        ],
                                        false
                                    ),
                                },
                            },
                            data: [4, 7, 5, 4, 3, 5, 8], //data.values
                        },
                        {
                            name: '两层风速',
                            type: 'line',
                            showSymbol: false,
                            step:'end',
                            // showAllSymbol: true,
                            // symbol: 'circle',
                            // symbolSize: 10,
                            lineStyle: {
                                normal: {
                                    color: '#69f0ff',
                                },
                            },
                            // label: {
                            //     show: true,
                            //     position: 'top',
                            //     textStyle: {
                            //         color: '#2CABE3',
                            //     }
                            // },
                            // itemStyle: {
                            //     color: "#fff",
                            //     borderColor: "#2CABE3",
                            //     // borderWidth: 2,
                            // },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(
                                        0,
                                        0,
                                        0,
                                        1,
                                        [
                                            {
                                                offset: 0,
                                                color: 'rgba(107,205,216,1)',
                                            },
                                            {
                                                offset: 1,
                                                color: 'rgba(143,192,127,0.7)',
                                            },
                                        ],
                                        false
                                    ),
                                },
                            },
                            data: [3, 5, 4, 2, 1, 7, 6], //data.values
                        },
                    ],
                });
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [options, data, title, theme, i18n.language, echart]);
        // useEffect(()=>{
        //     echart?.on('click', (params:any) => {
        //         console.log('params',params)
        //       })
        //     debugger
        // },[])
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

export default ExecutionDiffChart;
