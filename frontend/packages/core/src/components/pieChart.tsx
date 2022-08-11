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
    units?: string;
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
    ({option, data, title, loading, zoom, className, onInit, isCpu, color, units}, ref) => {
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
            const {colorAlt, series, ...defaults} = chart;
            if (data && color && units) {
                // debugger
                console.log('data', data);
                const noData = [{value: '0', name: 'noData', proportion: '0'}];
                const chartOptions: EChartsOption = defaultsDeep(option, {
                    center: [0, 0],
                    color: data.length ? color : ['#CCCCCC'],
                    tooltip: {
                        show: data.length ? true : false,
                        trigger: 'item',
                        extraCssText:
                            'padding:15px;padding-right:41px;line-height:30px;width:auto;height:auto;background:rgba(0,0,0,0.75);box-shadow:1px 5px 20px 0px rgba(1,11,19,0.2);border-radius:6px;border:none;',
                        axisPointer: {
                            type: 'none'
                        },
                        textStyle: {
                            fontSize: '14',
                            color: '#666'
                        },
                        position: ['50%', '0%'],
                        formatter: function (params: any) {
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
                                `${t('timeConsuming')}` +
                                '</span>' +
                                '</span> : <span style="color: #FFFFFF;">' +
                                params.data.value +
                                units +
                                '</span>';
                            str += '</div>';
                            str += '<div style="display:flex; align-items:center;">';
                            str +=
                                '<span style="font-size:12px;margin-right:5px;width:12px;height:12px;border-radius:50%;background-color:' +
                                color[1] +
                                ';"></span>' +
                                `${t('proportion')}` +
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
                        left: '62%',
                        width: '30%',
                        orient: 'vertical',
                        height: 238,
                        itemHeight: '8',
                        textStyle: {
                            fontSize: 14,
                            width: 20
                        },
                        formatter: function (name: string) {
                            console.log('name', name);

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
                            radius: ['63%', '88%'],
                            center: ['52%', '50%'],
                            avoidLabelOverlap: false,
                            emphasis: {
                                disabled: data.length ? false : true
                            },
                            label: {
                                show: true,
                                position: 'center',
                                textStyle: {
                                    fontSize: '14',
                                    color: data.length ? '#666' : '#999999'
                                },
                                formatter: function () {
                                    if (data.length) {
                                        const str = isCpu ? 'CPU' : 'GPU'; //声明一个变量用来存储数据
                                        return str;
                                    } else {
                                        const str = t('NoGPUdata');
                                        return str;
                                    }
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            data: data.length ? data : noData
                        }
                    ]
                });
                // debugger
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [option, data, title, theme, echart, color, isCpu, units, t]);
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
