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
import React, {FunctionComponent, useCallback, useMemo} from 'react';
import SChart, {DownloadDataTypes, chartSize, chartSizeInRem} from '~/components/ScalarChart';
import {
    SortingMethod,
    XAxis,
    chartData,
    nearestPoint,
    singlePointRange,
    sortingMethodMap,
    tooltip,
    xAxisMap
} from '~/resource/scalar';

import Chart from '~/components/Chart';
import {Chart as ChartLoader} from '~/components/Loader/ChartPage';
import type {Run} from '~/types';
import {XAxisType} from '~/components/LineChart';
import {cycleFetcher} from '~/utils/fetch';
import queryString from 'query-string';
import saveFile from '~/utils/saveFile';
import styled from 'styled-components';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';
import useWebAssembly from '~/hooks/useWebAssembly';

const Error = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

type ScalarChartProps = {
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

    const {
        data: datasets,
        error,
        loading
    } = useRunningRequest<(ScalarDataset | null)[]>(
        runs.map(run => `/scalar/list?${queryString.stringify({run: run.label, tag})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );

    const xAxisType = useMemo(() => (xAxis === XAxis.WallTime ? XAxisType.time : XAxisType.value), [xAxis]);

    const transformParams = useMemo(() => [datasets?.map(data => data ?? []) ?? [], smoothing], [datasets, smoothing]);
    const {data: smoothedDatasetsOrUndefined} = useWebAssembly<Dataset[]>('scalar_transform', transformParams);
    const smoothedDatasets = useMemo<NonNullable<typeof smoothedDatasetsOrUndefined>>(
        () => smoothedDatasetsOrUndefined ?? [],
        [smoothedDatasetsOrUndefined]
    );

    const axisRangeParams = useMemo(() => [smoothedDatasets, !!outlier], [smoothedDatasets, outlier]);
    const {data: yRange} = useWebAssembly<Range>('scalar_axis_range', axisRangeParams);

    const datasetRangesParams = useMemo(() => [smoothedDatasets], [smoothedDatasets]);
    const {data: datasetRanges} = useWebAssembly<Range[]>('scalar_range', datasetRangesParams);

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
    const getTooltipTableData = useCallback(
        (series: number[]) => {
            const idx = xAxisMap[xAxis];
            const points = nearestPoint(smoothedDatasets ?? [], runs, idx, series[idx]).map((point, index) => ({
                ...point,
                ...datasetRanges?.[index]
            }));
            const sort = sortingMethodMap[sortingMethod];
            const sorted = sort(points, series);
            const {columns, data} = tooltip(sorted, maxStepLength, i18n);
            return {
                runs: sorted.map(i => i.run),
                columns,
                data
            };
        },
        [smoothedDatasets, datasetRanges, runs, sortingMethod, xAxis, maxStepLength, i18n]
    );

    const downloadData = useCallback(
        (type: keyof typeof DownloadDataTypes) => {
            saveFile(
                runs.map(
                    run =>
                        `/scalar/data?${queryString.stringify({
                            run: run.label,
                            tag,
                            type
                        })}`
                ),
                runs.map(run => `visualdl-scalar-${run.label}-${tag}.${DownloadDataTypes[type]}`),
                `visualdl-scalar-${tag}.zip`
            );
        },
        [runs, tag]
    );

    // display error only on first fetch
    if (!data && error) {
        return <Error>{t('common:error')}</Error>;
    }

    return (
        <SChart
            title={tag}
            data={data}
            loading={loading}
            xAxisType={xAxisType}
            xRange={ranges.x}
            yRange={ranges.y}
            getTooltipTableData={getTooltipTableData}
            downloadData={downloadData}
        />
    );
};

export default ScalarChart;

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
