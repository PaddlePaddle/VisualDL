import React, {FunctionComponent, useCallback, useMemo} from 'react';
import styled from 'styled-components';
import queryString from 'query-string';
import {EChartOption} from 'echarts';
import {em, size} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
import {useRunningRequest} from '~/hooks/useRequest';
import useHeavyWork from '~/hooks/useHeavyWork';
import {cycleFetcher} from '~/utils/fetch';
import {
    transform,
    chartData,
    range,
    tooltip,
    sortingMethodMap,
    xAxisMap,
    Dataset,
    Range,
    TransformParams,
    RangeParams
} from '~/resource/scalars';
import LineChart from '~/components/LineChart';

const width = em(430);
const height = em(320);

const smoothWasm = () =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    import('~/wasm/dist').then(({transform}) => (params: TransformParams) =>
        (transform(params.datasets, params.smoothing) as unknown) as Dataset[]
    );
const rangeWasm = () =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    import('~/wasm/dist').then(({range}) => (params: RangeParams) =>
        (range(params.datasets, params.outlier) as unknown) as Range
    );

const smoothWorker = () => new Worker('~/worker/scalars/smooth.worker.ts', {type: 'module'});
const rangeWorker = () => new Worker('~/worker/scalars/range.worker.ts', {type: 'module'});

const StyledLineChart = styled(LineChart)`
    ${size(height, width)}
`;

const Error = styled.div`
    ${size(height, width)}
    display: flex;
    justify-content: center;
    align-items: center;
`;

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
    const {t, i18n} = useTranslation(['scalars', 'common']);

    const {data: datasets, error, loading} = useRunningRequest<Dataset[]>(
        runs.map(run => `/scalars/list?${queryString.stringify({run, tag})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );

    const type = xAxis === 'wall' ? 'time' : 'value';
    const smooth = xAxis !== 'wall';

    const transformParams = useMemo(
        () => ({
            datasets: datasets ?? [],
            smoothing
        }),
        [datasets, smoothing]
    );
    const smoothedDatasets = useHeavyWork(smoothWasm, smoothWorker, transform, transformParams) ?? [];

    const rangeParams = useMemo(
        () => ({
            datasets: smoothedDatasets,
            outlier: !!outlier
        }),
        [smoothedDatasets, outlier]
    );
    const yRange = useHeavyWork(rangeWasm, rangeWorker, range, rangeParams);

    const data = useMemo(
        () =>
            chartData({
                data: smoothedDatasets,
                runs,
                smooth,
                xAxis
            }),
        [smoothedDatasets, runs, smooth, xAxis]
    );

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
            return tooltip(sort ? sort(points, data) : points, i18n);
        },
        [smoothedDatasets, runs, sortingMethod, i18n]
    );

    // display error only on first fetch
    if (!data && error) {
        return <Error>{t('common:error')}</Error>;
    }

    return (
        <StyledLineChart
            title={tag}
            legend={runs}
            xAxis={t(`x-axis-value.${xAxis}`)}
            yRange={yRange}
            type={type}
            tooltip={formatter}
            data={data}
            loading={loading}
        />
    );
};

export default ScalarChart;
