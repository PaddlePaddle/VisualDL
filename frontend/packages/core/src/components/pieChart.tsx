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
import leftIcon from '@visualdl/icons/icons/left.svg';
import defaultLeftIcon from '@visualdl/icons/icons/defaultLeft.svg';
import rightIcon from '@visualdl/icons/icons/right.svg';
import defaultRightIcon from '@visualdl/icons/icons/defaultRight.svg';

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

const PieChart = React.forwardRef<LineChartRef, any>(
    ({options, data, title, loading, zoom, className, onInit,isCpu,color}, ref) => {
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
            const chartData = [];
            if (data && color) {
                for (const item of data) {
                    chartData.push({
                        value: item.total_time,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                console.log('chartData', chartData);
                let chartOptions: EChartOption = defaultsDeep({
                    grid: {
                        left: 0
                    },
                    color: color,
                    tooltip: {
                        trigger: 'item',
                        extraCssText:
                            'padding:15px;line-height:30px;width:auto;height:auto;background:rgba(255,255,255,1);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;',
                        axisPointer: {
                            type: 'none'
                        },
                        textStyle: {
                            fontSize: '14',
                            color: '#666'
                        },
                        formatter: function (params: any) {
                            console.log('pieparams', params);
                            var str = ''; //声明一个变量用来存储数据
                            str += '<div>' + params.data.name + '</div>';
                            str +=
                                '<span style="display:inline-block;margin-right:5px;margin-bottom:2px;width:6px;height:6px;border-radius:50%;background-color:' +
                                params.color +
                                ';"></span>' +
                                '耗时' +
                                '</span> : <span>' +
                                params.data.value +
                                '</br>';
                            str +=
                                '<span style="display:inline-block;margin-right:5px;margin-bottom:2px;width:6px;height:6px;border-radius:50%;background-color:' +
                                params.color +
                                ';"></span>' +
                                '占比' +
                                '</span> : <span>' +
                                params.data.proportion + '%'
                                '</br>';
                            return str;
                        }
                    },
                    legend: {
                        top: 'center',
                        right: '50',
                        orient: 'vertical',
                        height: 160,
                        icon: "circle",
                        type: 'scroll',
                        pageIcons:{
                            vertical:['image://' + leftIcon,
                            'image://' + rightIcon]
                        },
                        pageIconInactiveColor:'#981EFF'
                    },
                    series: [
                        {
                            right: '200',
                            name: 'Access From',
                            type: 'pie',
                            radius: ['70%', '100%'],
                            avoidLabelOverlap: false,
                            label: {
                                show: true,
                                position: 'center',
                                textStyle: {
                                    fontSize: '14',
                                    color: '#666'
                                },
                                formatter: function () {
                                    var str = isCpu ? 'CPU' : 'GPU'; //声明一个变量用来存储数据
                                    return str;
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            // data: [
                            //     {value: 41234, name: 'Communication', proportion: '81.45%'},
                            //     {value: 7359, name: 'Direct', proportion: '11.45%'},
                            //     {value: 5801, name: 'Email', proportion: '11.45%'},
                            //     {value: 4841, name: 'Union Ads', proportion: '11.45%'},
                            //     {value: 3000, name: 'Video bds', proportion: '11.45%'},
                            //     {value: 3000, name: 'Video cds', proportion: '11.45%'},
                            //     {value: 3000, name: 'Video dds', proportion: '11.45%'},
                            //     {value: 3000, name: 'Video eds', proportion: '11.45%'},
                            //     {value: 3000, name: 'Video fds', proportion: '11.45%'},
                            //     {value: 3000, name: 'Video gds', proportion: '11.45%'},
                            //     {value: 3000, name: 'Video hds', proportion: '11.45%'}
                            // ]
                            data: chartData
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

export default PieChart;
