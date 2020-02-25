import React, {FunctionComponent, useCallback, useMemo} from 'react';
import useSWR from 'swr';
import compact from 'lodash/compact';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import {EChartOption} from 'echarts';
import {useTranslation} from '~/utils/i18n';
import {cycleFetcher} from '~/utils/fetch';
import {transform, range, tooltip, TooltipData} from '~/utils/scalars';
import * as chart from '~/utils/chart';
import LineChart from '~/components/LineChart';

export const xAxisMap = {
    step: 1,
    relative: 4,
    wall: 0
};

export const sortingMethodMap = {
    default: null,
    descending: (points: TooltipData[]) => sortBy(points, point => point.item[3]).reverse(),
    ascending: (points: TooltipData[]) => sortBy(points, point => point.item[3]),
    // Compare other ponts width the trigger point, caculate the nearest sort.
    nearest: (points: TooltipData[], data: number[]) => sortBy(points, point => point.item[3] - data[2])
};

type DataSet = number[][];

type ScalarChartProps = {
    runs: string[];
    tag: string;
    smoothing: number;
    xAxis: keyof typeof xAxisMap;
    sortingMethod: keyof typeof sortingMethodMap;
    outlier?: boolean;
    running?: boolean;
};

const ScalarChart: FunctionComponent<ScalarChartProps> = ({
    runs,
    tag,
    smoothing,
    xAxis,
    sortingMethod,
    outlier,
    running
}) => {
    const {t} = useTranslation('scalars');

    // TODO: maybe we can create a custom hook here
    const {data: datasets} = useSWR<DataSet[]>(
        runs.map(run => `/scalars/scalars?run=${encodeURIComponent(run)}&tag=${encodeURIComponent(tag)}`),
        (...urls) => cycleFetcher(urls),
        {
            refreshInterval: running ? 15 * 1000 : 0
        }
    );

    const type = xAxis === 'wall' ? 'time' : 'value';
    const smooth = xAxis !== 'wall';

    const smoothedDatasets = useMemo(() => datasets?.map(dataset => transform(dataset, smoothing)), [
        datasets,
        smoothing
    ]);

    const data = useMemo(
        () =>
            smoothedDatasets
                ?.map((dataset, i) => {
                    // smoothed data:
                    // [0] wall time
                    // [1] step
                    // [2] orginal value
                    // [3] smoothed value
                    // [4] relative
                    const name = runs[i];
                    return [
                        {
                            name,
                            z: i,
                            lineStyle: {
                                width: chart.series.lineStyle.width,
                                opacity: 0.5
                            },
                            data: dataset,
                            encode: {
                                x: [xAxisMap[xAxis]],
                                y: [2]
                            },
                            smooth
                        },
                        {
                            name,
                            z: runs.length + i,
                            data: dataset,
                            encode: {
                                x: [xAxisMap[xAxis]],
                                y: [3]
                            },
                            smooth
                        }
                    ];
                })
                .flat(),
        [runs, smooth, smoothedDatasets, xAxis]
    );

    const yRange = useMemo(() => {
        const ranges = compact(smoothedDatasets?.map(dataset => range(dataset, outlier)));
        const min = minBy(ranges, range => range.min)?.min ?? 0;
        const max = maxBy(ranges, range => range.max)?.max ?? 0;

        if (!(min === 0 && max === 0)) {
            return {
                min: min > 0 ? min * 0.9 : min * 1.1,
                max: max > 0 ? max * 1.1 : max * 0.9
            };
        }
    }, [outlier, smoothedDatasets]);

    const formatter = useCallback(
        (params: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]) => {
            const data = Array.isArray(params) ? params[0].data : params.data;
            const step = data[1];
            const points =
                smoothedDatasets?.map((series, index) => {
                    let nearestItem;
                    if (step === 0) {
                        nearestItem = series[0];
                    } else {
                        for (let i = 0; i < series.length; i++) {
                            const item = series[i];
                            if (item[1] === step) {
                                nearestItem = item;
                                break;
                            }
                            if (item[1] > step) {
                                nearestItem = series[i - 1 >= 0 ? i - 1 : 0];
                                break;
                            }
                            if (!nearestItem) {
                                nearestItem = series[series.length - 1];
                            }
                        }
                    }
                    return {
                        run: runs[index],
                        item: nearestItem || []
                    };
                }) ?? [];
            const sort = sortingMethodMap[sortingMethod];
            return tooltip(sort ? sort(points, data) : points);
        },
        [smoothedDatasets, runs, sortingMethod]
    );

    return (
        <LineChart
            title={tag}
            legend={runs}
            xAxis={t(`x-axis-value.${xAxis}`)}
            yRange={yRange}
            type={type}
            tooltip={formatter}
            data={data}
        />
    );
};

export default ScalarChart;
