import {
    Dataset,
    Range,
    RangeParams,
    TransformParams,
    chartData,
    range,
    singlePointRange,
    sortingMethodMap,
    tooltip,
    transform,
    xAxisMap
} from '~/resource/scalars';
import LineChart, {LineChartRef} from '~/components/LineChart';
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';
import {
    em,
    primaryActiveColor,
    primaryColor,
    primaryFocusedColor,
    rem,
    size,
    textColor,
    textLightColor,
    textLighterColor,
    transitionProps
} from '~/utils/style';

import {EChartOption} from 'echarts';
import Icon from '~/components/Icon';
import {cycleFetcher} from '~/utils/fetch';
import queryString from 'query-string';
import styled from 'styled-components';
import useHeavyWork from '~/hooks/useHeavyWork';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from '~/utils/i18n';

const smoothWasm = () =>
    import('@visualdl/wasm').then(({transform}) => (params: TransformParams) =>
        (transform(params.datasets, params.smoothing) as unknown) as Dataset[]
    );
const rangeWasm = () =>
    import('@visualdl/wasm').then(({range}) => (params: RangeParams) =>
        (range(params.datasets, params.outlier) as unknown) as Range
    );

const smoothWorker = () => new Worker('~/worker/scalars/smooth.worker.ts', {type: 'module'});
const rangeWorker = () => new Worker('~/worker/scalars/range.worker.ts', {type: 'module'});

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

const Toolbox = styled.div`
    font-size: ${em(16)};
    height: 1em;
    line-height: 1;
    margin: 0 ${rem(20)} ${rem(18)};
    display: flex;
`;

const ToolboxItem = styled.a<{active?: boolean}>`
    cursor: pointer;
    color: ${props => (props.active ? primaryColor : textLighterColor)};
    ${transitionProps('color')}

    &:hover {
        color: ${props => (props.active ? primaryFocusedColor : textLightColor)};
    }

    &:active {
        color: ${props => (props.active ? primaryActiveColor : textColor)};
    }

    & + & {
        margin-left: ${rem(14)};
    }
`;

const Error = styled.div`
    ${size('100%', '100%')}
    display: flex;
    justify-content: center;
    align-items: center;
`;

enum XAxisType {
    value = 'value',
    log = 'log',
    time = 'time'
}

enum YAxisType {
    value = 'value',
    log = 'log'
}

type ScalarChartProps = {
    runs: string[];
    tag: string;
    smoothing: number;
    xAxis: keyof typeof xAxisMap;
    sortingMethod: keyof typeof sortingMethodMap;
    outlier?: boolean;
    running?: boolean;
    onToggleMaximized?: (maximized: boolean) => void;
};

const ScalarChart: FunctionComponent<ScalarChartProps> = ({
    runs,
    tag,
    smoothing,
    xAxis,
    sortingMethod,
    outlier,
    running,
    onToggleMaximized
}) => {
    const {t, i18n} = useTranslation(['scalars', 'common']);

    const echart = useRef<LineChartRef>(null);

    const {data: datasets, error, loading} = useRunningRequest<(Dataset | null)[]>(
        runs.map(run => `/scalars/list?${queryString.stringify({run, tag})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );

    const smooth = false;
    const [maximized, setMaximized] = useState<boolean>(false);
    const toggleMaximized = useCallback(() => {
        onToggleMaximized?.(!maximized);
        setMaximized(m => !m);
    }, [onToggleMaximized, maximized, setMaximized]);

    const xAxisType = useMemo(() => (xAxis === 'wall' ? XAxisType.time : XAxisType.value), [xAxis]);

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
    const smoothedDatasets = useHeavyWork(smoothWasm, smoothWorker, transform, transformParams) ?? [];

    const rangeParams = useMemo(
        () => ({
            datasets: smoothedDatasets,
            outlier: !!outlier
        }),
        [smoothedDatasets, outlier]
    );
    const yRange = useHeavyWork(rangeWasm, rangeWorker, range, rangeParams);

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
        <Wrapper>
            <StyledLineChart
                ref={echart}
                title={tag}
                xRange={ranges.x}
                yRange={ranges.y}
                xType={xAxisType}
                yType={yAxisType}
                tooltip={formatter}
                data={data}
                loading={loading}
            />
            <Toolbox>
                <ToolboxItem onClick={toggleMaximized}>
                    <Icon type={maximized ? 'minimize' : 'maximize'} />
                </ToolboxItem>
                <ToolboxItem onClick={() => echart.current?.restore()}>
                    <Icon type="restore-size" />
                </ToolboxItem>
                <ToolboxItem onClick={toggleYAxisType} active={yAxisType === YAxisType.log}>
                    <Icon type="log-axis" />
                </ToolboxItem>
                <ToolboxItem onClick={() => echart.current?.saveAsImage()}>
                    <Icon type="download" />
                </ToolboxItem>
            </Toolbox>
        </Wrapper>
    );
};

export default ScalarChart;
