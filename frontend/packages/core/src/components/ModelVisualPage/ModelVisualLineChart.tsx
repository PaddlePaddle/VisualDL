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
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';
import {rem, size} from '~/utils/style';

import Chart from '~/components/Chart';
import ChartToolbox from '~/components/ChartToolbox';
import type {EChartOption} from 'echarts';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

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

export type ModelVisualLineChartProps = {
    title: string;
    data: EChartOption.SeriesLine[];
    legendData?: string[],
    loading: boolean;
    xAxisType?: XAxisType;
    xConfig?: EChartOption.XAxis;
    yConfig?: EChartOption.YAxis;
    downloadData?: (type: keyof typeof DownloadDataTypes) => void;
};

const ModelVisualLineChart: FunctionComponent<ModelVisualLineChartProps> = ({
    title,
    data,
    legendData,
    loading,
    xAxisType,
    xConfig,
    yConfig,
    downloadData
}) => {
    const {t} = useTranslation('common');

    const echart = useRef<LineChartRef>(null);

    const [yAxisType, setYAxisType] = useState<YAxisType>(YAxisType.value);
    const toggleYAxisType = useCallback(() => {
        setYAxisType(t => (t === YAxisType.log ? YAxisType.value : YAxisType.log));
    }, [setYAxisType]);

    const options = useMemo(
        () => ({
            legend: {
                data: legendData ?? [],
                top: '11%',
                textStyle: {
                    color: 'auto'
                }
            },
            grid: {
                bottom: '20%'
            },
            dataZoom: [
                {
                    type: 'inside',
                    zoomLock: true
                },
                {
                    start: 0
                }
            ],
            tooltip: {
                hideDelay: 300,
                enterable: true
            },
            xAxis: {
                type: xAxisType ?? XAxisType.category,
                ...xConfig
            },
            yAxis: {
                type: yAxisType,
                ...yConfig
            }
        }),
        [xAxisType, xConfig, yConfig]
    );

    const toolbox = useMemo(
        () => [
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
        [downloadData, toggleYAxisType, t]
    );

    return (
        <Chart {...chartSizeInRem}>
            <Wrapper>
                <StyledLineChart ref={echart} title={title} options={options} data={data} loading={loading} />
                <Toolbox items={toolbox} />
            </Wrapper>
        </Chart>
    );
};

export default ModelVisualLineChart;
