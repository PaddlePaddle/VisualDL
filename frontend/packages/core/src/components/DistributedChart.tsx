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

import React, {useEffect, useCallback} from 'react';
import {primaryColor} from '~/utils/style';
import useECharts, {Options, Wrapper, useChartTheme} from '~/hooks/useECharts';
import {color} from '~/utils/chart';
import {renderToStaticMarkup} from 'react-dom/server';
import TooltipTable from '~/components/TooltipTable';
import type {EChartsOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {useTranslation} from 'react-i18next';
import type {curveType} from '~/components/ProfilerPage/MemoryView/type';
type DistributedChartProps = {
    options?: EChartsOption;
    titles?: string;
    data?: curveType;
    loading?: boolean;
    zoom?: boolean;
    className?: string;
    onInit?: Options['onInit'];
};
type lineData = (number | string)[][];
export interface Run {
    label: string;
    colors: [string, string];
}
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

const DistributedChart = React.forwardRef<LineChartRef, DistributedChartProps>(
    ({options, data, titles, loading, zoom, className, onInit}, ref) => {
        const {t} = useTranslation(['profiler', 'common']);
        const {i18n} = useTranslation();

        const {
            ref: echartRef,
            echart,
            wrapper
        } = useECharts<HTMLDivElement>({
            loading: !!loading,
            zoom,
            autoFit: true,
            onInit
        });
        const theme = useChartTheme();
        const formatter = useCallback(
            (params: any) => {
                if (params.length) {
                    const n = params.length / 4 - 1;
                    let index = 0;
                    const datas: any = [];
                    const runs: any = [];
                    while (index < params.length) {
                        const element = params[index];
                        if (element) {
                            runs.push({label: element.seriesName, colors: [element.color]});
                            datas.push(element.value);
                        }
                        if (n >= 0) {
                            index += 1 + n;
                        } else {
                            index += 1;
                        }
                    }
                    const columns = [
                        {label: t('timestamp')},
                        {label: t('memory-size') + '（KB）'},
                        {label: t('event-name')}
                    ];
                    return renderToStaticMarkup(
                        <TooltipTable run={t('common:runs')} runs={runs as Run[]} columns={columns} data={datas} />
                    );
                }
            },
            [t]
        );

        useEffect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            if (!data) {
                return;
            }
            // debugger
            const chartData = data;

            const seriesData = Object.keys(data.name).map(items => {
                const Data: any = data;
                const series = Data[items] as lineData;
                return {
                    name: t(items),
                    step: 'true',
                    type: 'line',
                    smooth: true,
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
                    data: series,
                    encode: {
                        x: [0],
                        y: [1]
                    }
                };
            });
            if (chartData) {
                const title = `Peak Memory Usage: ${titles}KB`;
                const chartOptions: EChartsOption = defaultsDeep({
                    color: [
                        '#2932E1',
                        '#00CC88',
                        '#981EFF',
                        '#066BFF',
                        '#00E2FF',
                        '#FFAA00',
                        '#E71ED5',
                        '#FF6600',
                        '#0DEBB0',
                        '#D50505'
                    ],
                    // backgroundColor: 'rgb(128, 128, 128, .04)',
                    title: {
                        top: '0',
                        left: '15',
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
                    tooltip: {
                        trigger: 'axis',
                        formatter,
                        hideDelay: 300,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderColor: 'rgba(0, 0, 0, 0.6)',
                        textStyle: {color: '#fff'},
                        enterable: true
                    },
                    grid: {
                        left: '0',
                        right: '20',
                        bottom: '0',
                        top: '62',
                        containLabel: true
                    },
                    xAxis: {
                        crossStyle: {
                            color: '#2932e1',
                            type: 'dashed'
                        },
                        label: {show: true},
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
                    },
                    yAxis: {
                        type: 'value',
                        name: t('memory-usage') + '（kB)',
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

                    dataZoom: [
                        {
                            type: 'inside',
                            xAxisIndex: 0
                        }
                    ],
                    // toolbox: {
                    //     show: false,
                    //     showTitle: false,
                    //     itemSize: 0,
                    //     feature: {
                    //         dataZoom: {
                    //             show: true,
                    //             xAxisIndex: 0
                    //         }
                    //     }
                    // },
                    series: seriesData
                });

                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [options, data, titles, theme, i18n.language, echart, formatter, t]);
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
