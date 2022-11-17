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

import type {CurveType, PRCurveData, Run} from '~/resource/curves';
import LineChart, {LineChartRef} from '~/components/LineChart';
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';
import {options as chartOptions, nearestPoint} from '~/resource/curves';
import {rem, size} from '~/utils/style';

import Chart from '~/components/Chart';
import {Chart as ChartLoader} from '~/components/Loader/ChartPage';
import ChartToolbox from '~/components/ChartToolbox';
import type {EChartsOption} from 'echarts';
import TooltipTable from '~/components/TooltipTable';
import {cycleFetcher} from '~/utils/fetch';
import {format} from 'd3-format';
import queryString from 'query-string';
import {renderToStaticMarkup} from 'react-dom/server';
import styled from 'styled-components';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';
import zip from 'lodash/zip';

const axisFormatter = format('.4f');
const valueFormatter = format('.2f');

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

const Error = styled.div`
    ${size('100%', '100%')}
    display: flex;
    justify-content: center;
    align-items: center;
`;

const chartSize = {
    width: 430,
    height: 337
};
const chartSizeInRem = {
    width: rem(chartSize.width),
    height: rem(chartSize.height)
};

type PRCurveChartProps = {
    type: CurveType;
    runs: Run[];
    tag: string;
    running?: boolean;
};

const PRCurveChart: FunctionComponent<PRCurveChartProps> = ({type, runs, tag, running}) => {
    const {t} = useTranslation(['curves', 'common']);

    const echart = useRef<LineChartRef>(null);

    const {
        data: dataset,
        error,
        loading
    } = useRunningRequest<PRCurveData[]>(
        runs.map(run => `/${type}-curve/list?${queryString.stringify({run: run.label, tag})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );

    const [maximized, setMaximized] = useState<boolean>(false);

    const selectedData = useMemo<[number, number, number[][]][]>(
        () =>
            runs.map((run, i) => {
                const [wallTime, step, ...item] = dataset?.[i]?.find(row => row[1] === run.steps[run.index]) ?? [
                    0,
                    0,
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ];
                return [wallTime, step, zip(...item) as number[][]];
            }),
        [dataset, runs]
    );

    const data = useMemo(
        () =>
            selectedData.map((item, i) => {
                const run = runs[i];
                return {
                    name: run.label,
                    z: i,
                    itemStyle: {
                        color: run.colors[0]
                    },
                    lineStyle: {
                        color: run.colors[0]
                    },
                    data: item[2],
                    encode: {
                        x: [1],
                        y: [0]
                    }
                };
            }),
        [selectedData, runs]
    );

    const formatter = useCallback(
        (params: any) => {
            const series = Array.isArray(params) ? params[0].data : params.data;
            const points = nearestPoint(
                selectedData.map(s => s[2]),
                series[1]
            );
            const columns = [
                {
                    label: t('curves:threshold')
                },
                {
                    label: t('curves:precision')
                },
                {
                    label: t('curves:recall')
                },
                {
                    label: t('curves:true-positives')
                },
                {
                    label: t('curves:false-positives')
                },
                {
                    label: t('curves:true-negatives')
                },
                {
                    label: t('curves:false-negatives')
                }
            ];
            const runData = points.reduce<Run[]>((m, runPoints, index) => {
                m.push(...new Array(runPoints.length).fill(runs[index]));
                return m;
            }, []);
            const data = points.reduce<(string | number)[][]>((m, runPoints) => {
                m.push(
                    ...runPoints.map(([precision, recall, tp, fp, tn, fn, threshold]) => [
                        valueFormatter(threshold),
                        axisFormatter(precision),
                        axisFormatter(recall),
                        tp,
                        fp,
                        tn,
                        fn
                    ])
                );
                return m;
            }, []);
            return renderToStaticMarkup(
                <TooltipTable run={t('common:runs')} runs={runData} columns={columns} data={data} />
            );
        },
        [selectedData, runs, t]
    );

    const options = useMemo(
        () => ({
            ...chartOptions,
            tooltip: {
                ...chartOptions.tooltip,
                formatter,
                hideDelay: 300,
                enterable: true
            }
        }),
        [formatter]
    );

    // display error only on first fetch
    if (!data && error) {
        return <Error>{t('common:error')}</Error>;
    }

    return (
        <Chart maximized={maximized} {...chartSizeInRem}>
            <Wrapper>
                <StyledLineChart ref={echart} title={tag} options={options} data={data} loading={loading} zoom />
                <Toolbox
                    items={[
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
                            icon: 'download',
                            tooltip: t('common:download-image'),
                            onClick: () => echart.current?.saveAsImage()
                        }
                    ]}
                />
            </Wrapper>
        </Chart>
    );
};

export default PRCurveChart;

export const Loader: FunctionComponent = () => (
    <>
        <Chart {...chartSizeInRem}>
            <ChartLoader width={chartSize.width - 2} height={chartSize.height - 2} />
        </Chart>
        <Chart {...chartSizeInRem}>
            <ChartLoader width={chartSize.width - 2} height={chartSize.height - 2} />
        </Chart>
    </>
);
