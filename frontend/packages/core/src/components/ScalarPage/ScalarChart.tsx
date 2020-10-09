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

import type {Dataset, Range, ScalarDataset} from '~/resource/scalar';
import LineChart, {LineChartRef, XAxisType, YAxisType} from '~/components/LineChart';
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';
import {
    SortingMethod,
    XAxis,
    axisRange,
    chartData,
    options as chartOptions,
    nearestPoint,
    range,
    singlePointRange,
    sortingMethodMap,
    tooltip,
    transform,
    xAxisMap
} from '~/resource/scalar';
import {rem, size} from '~/utils/style';
import type {scalar_axis_range, scalar_range, scalar_transform} from '@visualdl/wasm'; // eslint-disable-line @typescript-eslint/no-unused-vars

import ChartToolbox from '~/components/ChartToolbox';
import type {EChartOption} from 'echarts';
import type {Run} from '~/types';
import TooltipTable from '~/components/TooltipTable';
import {cycleFetcher} from '~/utils/fetch';
import ee from '~/utils/event';
import {format} from 'd3-format';
import queryString from 'query-string';
import {renderToStaticMarkup} from 'react-dom/server';
import styled from 'styled-components';
import useHeavyWork from '~/hooks/useHeavyWork';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';
import wasm from '~/utils/wasm';

const labelFormatter = format('.8');

const smoothWasm = () =>
    wasm<typeof scalar_transform>('scalar_transform').then((scalar_transform): typeof transform => params =>
        scalar_transform(params.datasets, params.smoothing)
    );

const axisRangeWasm = () =>
    wasm<typeof scalar_axis_range>('scalar_axis_range').then((scalar_axis_range): typeof axisRange => params =>
        scalar_axis_range(params.datasets, params.outlier)
    );

const rangeWasm = () =>
    wasm<typeof scalar_range>('scalar_range').then((scalar_range): typeof range => params =>
        scalar_range(params.datasets)
    );

// const smoothWorker = () => new Worker('~/worker/scalar/smooth.worker.ts', {type: 'module'});
// const rangeWorker = () => new Worker('~/worker/scalar/range.worker.ts', {type: 'module'});

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

type ScalarChartProps = {
    cid: symbol;
    runs: Run[];
    tag: string;
    smoothing: number;
    xAxis: XAxis;
    sortingMethod: SortingMethod;
    outlier?: boolean;
    smoothedOnly?: boolean;
    showMostValue?: boolean;
    running?: boolean;
};

const ScalarChart: FunctionComponent<ScalarChartProps> = ({
    cid,
    runs,
    tag,
    smoothing,
    xAxis,
    sortingMethod,
    outlier,
    smoothedOnly,
    showMostValue,
    running
}) => {
    const {t, i18n} = useTranslation(['scalar', 'common']);

    const echart = useRef<LineChartRef>(null);

    const {data: datasets, error, loading} = useRunningRequest<(ScalarDataset | null)[]>(
        runs.map(run => `/scalar/list?${queryString.stringify({run: run.label, tag})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );

    const [maximized, setMaximized] = useState<boolean>(false);
    const toggleMaximized = useCallback(() => {
        ee.emit('toggle-chart-size', cid, !maximized);
        setMaximized(m => !m);
    }, [cid, maximized]);

    const xAxisType = useMemo(() => (xAxis === XAxis.WallTime ? XAxisType.time : XAxisType.value), [xAxis]);

    const [yAxisType, setYAxisType] = useState<YAxisType>(YAxisType.value);
    const toggleYAxisType = useCallback(() => {
        setYAxisType(t => (t === YAxisType.log ? YAxisType.value : YAxisType.log));
    }, [setYAxisType]);

    const transformParams = useMemo(
        () => ({
            datasets: datasets?.map(data => data ?? []) ?? [],
            smoothing
        }),
        [datasets, smoothing]
    );
    const smoothedDatasetsOrUndefined = useHeavyWork(smoothWasm, null, transform, transformParams);
    const smoothedDatasets = useMemo<NonNullable<typeof smoothedDatasetsOrUndefined>>(
        () => smoothedDatasetsOrUndefined ?? [],
        [smoothedDatasetsOrUndefined]
    );

    const axisRangeParams = useMemo(
        () => ({
            datasets: smoothedDatasets,
            outlier: !!outlier
        }),
        [smoothedDatasets, outlier]
    );
    const yRange = useHeavyWork(axisRangeWasm, null, axisRange, axisRangeParams);

    const datasetRangesParams = useMemo(() => ({datasets: smoothedDatasets}), [smoothedDatasets]);
    const datasetRanges = useHeavyWork(rangeWasm, null, range, datasetRangesParams);

    const ranges: Record<'x' | 'y', Range | undefined> = useMemo(() => {
        let x: Range | undefined = undefined;
        let y: Range | undefined = yRange;

        // if there is only one point, place it in the middle
        if (smoothedDatasets.length === 1 && smoothedDatasets[0].length === 1) {
            if ([XAxisType.value, XAxisType.log].includes(xAxisType)) {
                x = singlePointRange(smoothedDatasets[0][0][xAxisMap[xAxis]]);
            }
            y = singlePointRange(smoothedDatasets[0][0][2]);
        }
        return {x, y};
    }, [smoothedDatasets, yRange, xAxisType, xAxis]);

    const data = useMemo(
        () =>
            chartData({
                data: smoothedDatasets.slice(0, runs.length),
                ranges: showMostValue ? datasetRanges ?? [] : [],
                runs,
                xAxis,
                smoothedOnly
            }),
        [smoothedDatasets, datasetRanges, runs, xAxis, smoothedOnly, showMostValue]
    );

    const maxStepLength = useMemo(
        () => String(Math.max(...smoothedDatasets.map(i => Math.max(...i.map(j => j[1]))))).length,
        [smoothedDatasets]
    );

    const formatter = useCallback(
        (params: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]) => {
            const series: Dataset[number] = Array.isArray(params) ? params[0].data : params.data;
            const points = nearestPoint(smoothedDatasets ?? [], runs, series[1]).map((point, index) => ({
                ...point,
                ...datasetRanges?.[index]
            }));
            const sort = sortingMethodMap[sortingMethod];
            const sorted = sort(points, series);
            const {columns, data} = tooltip(sorted, maxStepLength, i18n);
            return renderToStaticMarkup(
                <TooltipTable run={t('common:runs')} runs={sorted.map(i => i.run)} columns={columns} data={data} />
            );
        },
        [smoothedDatasets, datasetRanges, runs, sortingMethod, maxStepLength, t, i18n]
    );

    const options = useMemo(
        () => ({
            ...chartOptions,
            tooltip: {
                ...chartOptions.tooltip,
                formatter,
                hideDelay: 300,
                enterable: true
            },
            xAxis: {
                type: xAxisType,
                ...ranges.x,
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
                ...ranges.y
            }
        }),
        [formatter, ranges, xAxisType, yAxisType]
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
                        tooltip: t('scalar:maximize'),
                        activeTooltip: t('scalar:minimize'),
                        toggle: true,
                        onClick: toggleMaximized
                    },
                    {
                        icon: 'restore-size',
                        tooltip: t('scalar:restore'),
                        onClick: () => echart.current?.restore()
                    },
                    {
                        icon: 'log-axis',
                        tooltip: t('scalar:toggle-log-axis'),
                        toggle: true,
                        onClick: toggleYAxisType
                    },
                    {
                        icon: 'download',
                        tooltip: t('scalar:download-image'),
                        onClick: () => echart.current?.saveAsImage()
                    }
                ]}
            />
        </Wrapper>
    );
};

export default ScalarChart;
