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
import leftIcon from '~/assets/images/leftClick.svg';
import rightIcon from '~/assets/images/rightClick.svg';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
import React, {useEffect, useImperativeHandle} from 'react';
import {WithStyled, primaryColor} from '~/utils/style';
import useECharts, {Options, Wrapper, useChartTheme} from '~/hooks/useECharts';
import styled from 'styled-components';
import type {EChartsOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {useTranslation} from 'react-i18next';

// type LineChartProps = {
//     options?: EChartsOption;
//     title?: string;
//     data?: Partial<NonNullable<EChartsOption<EChartsOption.SeriesLine>['series']>>;
//     loading?: boolean;
//     zoom?: boolean;
//     onInit?: Options['onInit'];
// };

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
interface cpuData {
    value: number;
    name: string;
    proportion: number;
}
type pieChartProps = {
    option?: EChartsOption;
    title?: string;
    data?: cpuData[];
    loading?: boolean;
    zoom?: boolean;
    onInit?: Options['onInit'];
    className?: string;
    isCpu?: boolean;
    color?: string[];
};
const Content = styled.div`
    height: 100%;
    width: 100%;
    .echarts {
        height: 100%;
    }
    .tooltips {
        display: flex;
        .tooltipName {
            font-size: 14px;
            color: #ffffff;
            font-weight: 500;
            margin-left: 10px;
            white-space: pre-wrap;
            hegiht: auto;
            max-width: 800px;
        }
    }
`;
const PieChart = React.forwardRef<LineChartRef, pieChartProps>(
    ({option, data, title, loading, zoom, className, onInit, isCpu, color}, ref) => {
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
                console.log('chartData', data, option);
                // debugger
                const chartOptions: EChartsOption = defaultsDeep(option, {
                    grid: {
                        left: 0
                        // top: '23%'
                    },
                    color: color,
                    tooltip: {
                        trigger: 'item',
                        extraCssText:
                            'padding:15px;padding-right:41px;line-height:30px;width:auto;height:auto;background:rgba(0,0,0,0.75);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;',
                        axisPointer: {
                            type: 'none'
                        },
                        textStyle: {
                            fontSize: '14',
                            color: '#666'
                        },
                        position: ['50%', '0%'],
                        formatter: function (params: any) {
                            console.log('pieparams', params);
                            let str = ''; //声明一个变量用来存储数据
                            str += '<div class="tooltips">';
                            str += '<div class="tooltipName">' + params.data.name + '';
                            ('</div>');
                            str += '<div>';
                            str += '<div style="display:flex; align-items:center;">';
                            str +=
                                '<span style="font-size:12px;margin-right:5px;width:12px;height:12px;border-radius:50%;background-color:' +
                                color[0] +
                                ';"></span>' +
                                '<span style="color: #FFFFFF;">' +
                                '耗时' +
                                '</span>' +
                                '</span> : <span style="color: #FFFFFF;">' +
                                params.data.value +
                                '</span>';
                            str += '</div>';
                            str += '<div style="display:flex; align-items:center;">';
                            str +=
                                '<span style="font-size:12px;margin-right:5px;width:12px;height:12px;border-radius:50%;background-color:' +
                                color[1] +
                                ';"></span>' +
                                '占比' +
                                '</span> : <span style="color: #FFFFFF;">' +
                                params.data.proportion +
                                '%' +
                                '</span>';
                            str += '</div>';
                            str += '</div>';
                            str += '</div>';
                            str += '</div>';
                            return str;
                        }
                    },
                    legend: {
                        show: data.length ? true : false,
                        top: '20',
                        left: '60%',
                        width: '30%',
                        orient: 'vertical',
                        height: 165,
                        itemHeight: '8',
                        textStyle: {
                            fontSize: 14,
                            width: 20
                        },
                        formatter: function (name: string) {
                            return name.length > 20 ? name.slice(0, 18) + '...' : name;
                        },
                        icon: 'circle',
                        type: 'scroll',
                        pageIcons: {
                            vertical: ['image://' + PUBLIC_PATH + leftIcon, 'image://' + PUBLIC_PATH + rightIcon]
                        },
                        tooltip: {
                            show: true,
                            formatter: function (params: any) {
                                console.log('legend', params);
                                let str = ''; //声明一个变量用来存储数据
                                str += '<div class="tooltips">';
                                str += '<div class="tooltipName">' + params.name + '';
                                ('</div>');
                                str += '</div>';
                                return str;
                            }
                        },
                        pageIconInactiveColor: '#981EFF'
                    },
                    series: [
                        {
                            right: '220',
                            name: 'Access From',
                            type: 'pie',
                            radius: ['63%', '90%'],
                            avoidLabelOverlap: false,
                            label: {
                                show: true,
                                position: 'center',
                                textStyle: {
                                    fontSize: '14',
                                    color: '#666'
                                },
                                formatter: function () {
                                    const str = isCpu ? 'CPU' : 'GPU'; //声明一个变量用来存储数据
                                    return str;
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            data: data
                        }
                    ],
                    title: {
                        show: data.length ? false : true,
                        text: data.length ? '' : '暂无GPU数据',
                        left: '16%',
                        top: '45%'
                    }
                });
                // debugger
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [option, data, title, theme, i18n.language, echart, color, isCpu]);
        return (
            <Wrapper ref={wrapper} className={className}>
                {!echart && (
                    <div className="loading">
                        <GridLoader color={primaryColor} size="10px" />
                    </div>
                )}
                <Content>
                    <div className="echarts" ref={echartRef}></div>
                </Content>
            </Wrapper>
        );
    }
);

export default PieChart;
