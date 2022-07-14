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
                    color: ["#2932E1","#DC3912"],
                    // backgroundColor: 'rgb(128, 128, 128, .04)',
                    title: {
                        top: '0%',
                        left: '0%',
                        show: true,
                        text: title,
                        textStyle: {
                            color: '#666666',
                            fontStyle: 'PingFangSC-Regular',
                            fontWeight: '400',
                            fontSize: 12
                        }
                    },
                    legend: {
                        type: 'plain',
                        show: true,
                        left: 'center',
                        data: [
                            {
                                name: '日增量'
                            },
                            {
                                name: '当前数量'
                            },
                            {
                                name: 'value大小'
                            }
                        ]
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: {
                            _custom: {
                                type: 'function',
                                display: '<span>ƒ</span> formatter(params, ticket, callback)'
                            }
                        }
                    },
                    grid: {
                        top: '22%',
                        left: '7%',
                        right: '5%',
                        bottom: '6%'
                    },
                    xAxis: [
                        {
                            type: 'category',
                            min: 1,
                            axisTick: {
                                show: false
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#CCCCCC'
                                }
                            },
                            axisLabel: {
                                color: '#666666'
                            },
                            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: '内存使用量（MB）',
                            position: 'left',
                            offset: 0,
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
                                formatter: {
                                    _custom: {
                                        type: 'function',
                                        display: '<span>ƒ</span> labelFormatter(val)'
                                    }
                                }
                            }
                        }
                    ],
                    series: [
                        {
                            name: '邮件',
                            type: 'line',
                            stack: '总量',
                            areaStyle: {
                                color: 'rgba(41,50,225 , 0.3)'
                            },
                            step: true,
                            data: [-120, -132, -201, -234, -90, -230, -210]
                        },
                        {
                            name: '联盟',
                            type: 'line',
                            stack: '总量',
                            areaStyle: {
                                color: 'rgba(220, 57, 18, 0.3)'
                            },
                            step: true,
                            data: [-220, -182, -291, -364, -440, -330, -410]
                        }
                    ]
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
