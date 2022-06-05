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
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
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
    console.log('runs.map(run => `/scalar/list?${queryString.stringify({run: run.label, tag})}`)',runs.map(run => `/scalar/list?${queryString.stringify({run: run.label, tag})}`));
    
    const {
        data: datasetsWithNull,
        error,
        loading
    } = useRunningRequest<(ScalarDataset | null)[]>(
        runs.map(run => `/scalar/list?${queryString.stringify({run: run.label, tag})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );
    
    // 第一个参数请求地址的拼接，第二个参数为是否在运行中，第三个为请求的fetcher
    console.log('datasetsWithNull', datasetsWithNull);
    const datasets = useMemo(
        () => (datasetsWithNull?.filter(r => r != null).slice(0, runs.length) ?? []) as ScalarDataset[],
        [datasetsWithNull, runs.length]
    );
    // 此处datasets 将datasetsWithNull中的数据判定不为空之后拷贝出来，

    const xAxisType = useMemo(() => (xAxis === XAxis.WallTime ? XAxisType.time : XAxisType.value), [xAxis]);
    // XAxisType {value = 'value',log = 'log',time = 'time'}  
    const transformParams = useMemo(
        () => [
            // Number.isFinite返回值 一个布尔值 表示给定的值是否是一个有穷数
            datasets.map(data => data.map(row => [row[0], row[1], Number.isFinite(row[2]) ? row[2] : null]) ?? []) ??
                [],
            smoothing
        ],
        [datasets, smoothing]
    );
    //  对datasets数据进一步的处理
    const {data: smoothedDatasetsOrUndefined} = useWebAssembly<Dataset[]>('scalar_transform', transformParams);
    console.log('smoothedDatasetsOrUndefined', smoothedDatasetsOrUndefined);
    //  对datasets数据进一步的处理,transformParams的基础上 进一步的处理 增加了两位
    const smoothedDatasets = useMemo<NonNullable<typeof smoothedDatasetsOrUndefined>>(
        () => smoothedDatasetsOrUndefined ?? [],
        [smoothedDatasetsOrUndefined]
    );
    // 最后对数据进行自检判断，判断是否不为空

    const axisRangeParams = useMemo(() => [smoothedDatasets, !!outlier], [smoothedDatasets, outlier]); //  是否忽略极端值

    const {data: yRange} = useWebAssembly<Range>('scalar_axis_range', axisRangeParams);
    // 进一步处理数据

    const datasetRangesParams = useMemo(() => [smoothedDatasets], [smoothedDatasets]);

    const {data: datasetRanges} = useWebAssembly<Range[]>('scalar_range', datasetRangesParams);
    // 进一步处理数据

    const ranges: Record<'x' | 'y', Range | undefined> = useMemo(() => {
        let x: Range | undefined = undefined;
        let y: Range | undefined = yRange;

        // if there is only one point, place it in the middle
        if (smoothedDatasets.length === 1 && smoothedDatasets[0].length === 1) {
            if ([XAxisType.value, XAxisType.log].includes(xAxisType)) {
                x = singlePointRange(smoothedDatasets[0][0][xAxisMap[xAxis]]);
                // 如果是有穷数的两倍为轴的长度，如果不是 就以 -0.5 0.5
            }
            y = singlePointRange(smoothedDatasets[0][0][2]);
        }
        // x轴 y轴 范围
        return {x, y};
    }, [smoothedDatasets, yRange, xAxisType, xAxis]);

    const [data, setData] = useState<ReturnType<typeof chartData>>([]);
    useEffect(() => {
        console.log('smoothedDatasets, datasets, runs',smoothedDatasets, datasets, runs ); 
        if (smoothedDatasets.length === runs.length && datasets.length === runs.length) {
            setData(
                chartData({
                    data: smoothedDatasets,
                    rawData: datasets,
                    ranges: showMostValue ? datasetRanges ?? [] : [],
                    runs,
                    xAxis,
                    smoothedOnly
                })
            );
        }
    }, [smoothedDatasets, datasets, showMostValue, datasetRanges, runs, xAxis, smoothedOnly]);

    const maxStepLength = useMemo(
        () => String(Math.max(...smoothedDatasets.map(i => Math.max(...i.map(j => j[1]))))).length,
        // 取出步骤的最大值
        [smoothedDatasets]
    );
    const getTooltipTableData = useCallback(
        (_, value: number) => {
            const idx = xAxisMap[xAxis];
            //  datasets 请求数据的返回
            //  moothedDatasets  经过useWebAssembly插件处理的数据
            //  runs label标签 train 和颜色
            //  idx  右侧选择器的步差  
            //  value 每项的axisValue
            const points = nearestPoint(smoothedDatasets, datasets, runs, idx, value).map(point => ({
                ...point,
                ...datasetRanges?.[runs.findIndex(run => run.label === point.run.label)]
            }));
            const sort = sortingMethodMap[sortingMethod];
            const sorted = sort(points, value);
            const {columns, data} = tooltip(sorted, maxStepLength, i18n);
            return {
                runs: sorted.map(i => i.run),
                columns,
                data
            };
        },
        [xAxis, smoothedDatasets, datasets, runs, sortingMethod, maxStepLength, i18n, datasetRanges]
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
    console.log('ScalarPageData',data);
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
