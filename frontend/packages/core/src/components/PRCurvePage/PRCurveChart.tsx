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

import LineChart, {LineChartRef} from '~/components/LineChart';
import type {PRCurveData, Run} from '~/resource/pr-curve';
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';
import {options as chartOptions, nearestPoint} from '~/resource/pr-curve';
import {rem, size} from '~/utils/style';

import ChartToolbox from '~/components/ChartToolbox';
import type {EChartOption} from 'echarts';
import TooltipTable from '~/components/TooltipTable';
import {cycleFetcher} from '~/utils/fetch';
import ee from '~/utils/event';
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

type PRCurveChartProps = {
    cid: symbol;
    runs: Run[];
    tag: string;
    running?: boolean;
};

const PRCurveChart: FunctionComponent<PRCurveChartProps> = ({cid, runs, tag, running}) => {
    const {t} = useTranslation(['pr-curve', 'common']);

    const echart = useRef<LineChartRef>(null);

    const {data: dataset, error, loading} = useRunningRequest<PRCurveData[]>(
        runs.map(run => `/pr-curve/list?${queryString.stringify({run: run.label, tag})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );

    const [maximized, setMaximized] = useState<boolean>(false);
    const toggleMaximized = useCallback(() => {
        ee.emit('toggle-chart-size', cid, !maximized);
        setMaximized(m => !m);
    }, [cid, maximized]);

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
        (params: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]) => {
            const series = Array.isArray(params) ? params[0].data : params.data;
            const points = nearestPoint(
                selectedData.map(s => s[2]),
                series[1]
            );
            const columns = [
                {
                    label: t('pr-curve:threshold')
                },
                {
                    label: t('pr-curve:precision')
                },
                {
                    label: t('pr-curve:recall')
                },
                {
                    label: t('pr-curve:true-positives')
                },
                {
                    label: t('pr-curve:false-positives')
                },
                {
                    label: t('pr-curve:true-negatives')
                },
                {
                    label: t('pr-curve:false-negatives')
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
        <Wrapper>
            <StyledLineChart ref={echart} title={tag} options={options} data={data} loading={loading} zoom />
            <Toolbox
                items={[
                    {
                        icon: 'maximize',
                        activeIcon: 'minimize',
                        tooltip: t('pr-curve:maximize'),
                        activeTooltip: t('pr-curve:minimize'),
                        toggle: true,
                        onClick: toggleMaximized
                    },
                    {
                        icon: 'restore-size',
                        tooltip: t('pr-curve:restore'),
                        onClick: () => echart.current?.restore()
                    },
                    {
                        icon: 'download',
                        tooltip: t('pr-curve:download-image'),
                        onClick: () => echart.current?.saveAsImage()
                    }
                ]}
            />
        </Wrapper>
    );
};

export default PRCurveChart;
