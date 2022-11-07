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

import LineChart, {LineChartRef, XAxisType, YAxisType} from '~/components/LineChart';
import type {Range, Run} from '~/types';
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';
import {rem, size} from '~/utils/style';

import Chart from '~/components/Chart';
import ChartToolbox from '~/components/ChartToolbox';
import type {EChartsOption, LineSeriesOption} from 'echarts';
import TooltipTable from '~/components/TooltipTable';
import {format} from 'd3-format';
import {renderToStaticMarkup} from 'react-dom/server';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const labelFormatter = format('.8');

const Wrapper = styled.div`
    ${size('100%', '100%')}
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
`;

const StyledLineChart = styled(LineChart)`
    flex-grow: 1;
`;

const Toolbox = styled(ChartToolbox)`
    margin-left: ${rem(20)};
    margin-right: ${rem(20)};
    margin-bottom: ${rem(18)};
`;

export const chartSize = {
    width: 430,
    height: 337
};
export const chartSizeInRem = {
    width: rem(chartSize.width),
    height: rem(chartSize.height)
};

export const DownloadDataTypes = {
    csv: 'csv',
    tsv: 'tsv'
    // excel: 'xlsx'
} as const;

interface TooltipTableData {
    runs: Run[];
    columns: {
        label: string;
        width: string;
    }[];
    data: (string | number)[][];
}

interface ScalarChartProps {
    title: string;
    data: any;
    loading: boolean;
    xAxisType?: XAxisType;
    xRange?: Range;
    yRange?: Range;
    getTooltipTableData: (series: number[], value: number) => TooltipTableData;
    downloadData?: (type: keyof typeof DownloadDataTypes) => void;
}

const ScalarChart: FunctionComponent<ScalarChartProps> = ({
    title,
    data,
    loading,
    xAxisType,
    xRange,
    yRange,
    getTooltipTableData,
    downloadData
}) => {
    const {t} = useTranslation('common');

    const echart = useRef<LineChartRef>(null);

    const [maximized, setMaximized] = useState<boolean>(false);

    const [yAxisType, setYAxisType] = useState<YAxisType>(YAxisType.value);
    const toggleYAxisType = useCallback(() => {
        setYAxisType(t => (t === YAxisType.log ? YAxisType.value : YAxisType.log));
    }, [setYAxisType]);

    const formatter = useCallback(
        (params: any) => {
            console.log('params', params);
            const series: number[] = Array.isArray(params) ? params[0].data : params.data;
            const value: number = (Array.isArray(params) ? params[0].axisValue : params.axisValue) as number;
            return renderToStaticMarkup(
                <TooltipTable run={t('common:runs')} {...getTooltipTableData(series, value)} />
            );
        },
        [getTooltipTableData, t]
    );

    const options: EChartsOption = useMemo(
        () =>
            ({
                legend: {
                    data: []
                },
                tooltip: {
                    position: ['10%', '100%'],
                    formatter,
                    hideDelay: 300,
                    enterable: true
                },
                xAxis: {
                    type: xAxisType ?? XAxisType.value,
                    ...xRange,
                    axisPointer: {
                        label: {
                            formatter:
                                xAxisType === XAxisType.time
                                    ? undefined
                                    : ({value}: {value: number}) => labelFormatter(value)
                        }
                    }
                },
                yAxis: {
                    type: yAxisType,
                    ...yRange
                }
            } as EChartsOption),
        [formatter, xAxisType, xRange, yAxisType, yRange]
    );

    const toolbox = useMemo(
        () => [
            {
                icon: 'maximize',
                activeIcon: 'minimize',
                tooltip: t('common:maximize'),
                activeTooltip: t('common:minimize'),
                toggle: true,
                onClick: () => setMaximized(m => !m)
            },
            {
                icon: 'restore-size',
                tooltip: t('common:restore'),
                onClick: () => echart.current?.restore()
            },
            {
                icon: 'log-axis',
                tooltip: t('common:toggle-log-axis'),
                toggle: true,
                onClick: toggleYAxisType
            },
            {
                icon: 'download',
                menuList: [
                    {
                        label: t('common:download-image'),
                        onClick: () => echart.current?.saveAsImage()
                    },
                    ...(downloadData
                        ? [
                              {
                                  label: t('common:download-data'),
                                  children: Object.keys(DownloadDataTypes)
                                      .sort((a, b) => a.localeCompare(b))
                                      .map(format => ({
                                          label: t('common:download-data-format', {format}),
                                          onClick: () => downloadData(format as keyof typeof DownloadDataTypes)
                                      }))
                              }
                          ]
                        : [])
                ]
            }
        ],
        [downloadData, t, toggleYAxisType]
    );

    return (
        <Chart maximized={maximized} {...chartSizeInRem}>
            <Wrapper>
                <StyledLineChart
                    ref={echart}
                    title={title}
                    options={options}
                    data={data}
                    loading={loading}
                    zoom={true}
                />
                <Toolbox items={toolbox} />
            </Wrapper>
        </Chart>
    );
};

export default ScalarChart;
