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

import BarChart, {BarChartRef} from '~/components/BarChart';
import React, {FunctionComponent, useMemo, useRef} from 'react';
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

const StyledBarChart = styled(BarChart)`
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
} as const;


export type ModelVisualBarChartProps = {
    title: string;
    data: EChartOption.SeriesBar[];
    loading: boolean;
    xConfig?: EChartOption.XAxis;
    yConfig?: EChartOption.YAxis;
    tooltip?: EChartOption.Tooltip;
    downloadData?: (type: keyof typeof DownloadDataTypes) => void;
};

const ModelVisualBarChart: FunctionComponent<ModelVisualBarChartProps> = ({
    title,
    data,
    loading,
    xConfig,
    yConfig,
    tooltip,
    downloadData
}) => {
    const {t} = useTranslation('common');

    const echart = useRef<BarChartRef>(null);

    const options = useMemo(
        () => ({
            legend: {
                data: []
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
            tooltip: tooltip ?? {
                hideDelay: 300,
                enterable: true
            },
            xAxis: {
                ...xConfig
            },
            yAxis: {
                ...yConfig
            }
        }),
        [xConfig, yConfig]
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
        [downloadData, t]
    );

    return (
        <Chart {...chartSizeInRem}>
            <Wrapper>
                <StyledBarChart ref={echart} title={title} options={options} data={data} loading={loading} />
                <Toolbox items={toolbox} />
            </Wrapper>
        </Chart>
    );
};

export default ModelVisualBarChart;
