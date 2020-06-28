import {EChartOption, ECharts, EChartsConvertFinder} from 'echarts';
import {
    HistogramData,
    Modes,
    OffsetData,
    OverlayData,
    OverlayDataItem,
    options as chartOptions,
    transform
} from '~/resource/histogram';
import LineChart, {LineChartRef} from '~/components/LineChart';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import StackChart, {StackChartRef} from '~/components/StackChart';
import {rem, size} from '~/utils/style';

import ChartToolbox from '~/components/ChartToolbox';
import {Run} from '~/types';
import {distance} from '~/utils';
import ee from '~/utils/event';
import {format} from 'd3-format';
import minBy from 'lodash/minBy';
import queryString from 'query-string';
import styled from 'styled-components';
import useHeavyWork from '~/hooks/useHeavyWork';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from '~/utils/i18n';

const formatTooltipXValue = format('.4f');
const formatTooltipYValue = format('.4');

const transformWasm = () =>
    import('@visualdl/wasm').then(({histogram_transform}): typeof transform => params =>
        histogram_transform(params.data, params.mode)
    );
const transformWorker = () => new Worker('~/worker/histogram/transform.worker.ts', {type: 'module'});

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

const StyledStackChart = styled(StackChart)`
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

type HistogramChartProps = {
    cid: symbol;
    run: Run;
    tag: string;
    mode: Modes;
    running?: boolean;
};

const HistogramChart: FunctionComponent<HistogramChartProps> = ({cid, run, tag, mode, running}) => {
    const {t} = useTranslation(['histogram', 'common']);

    const echart = useRef<LineChartRef | StackChartRef>(null);

    const {data: dataset, error, loading} = useRunningRequest<HistogramData>(
        `/histogram/list?${queryString.stringify({run: run.label, tag})}`,
        !!running
    );

    const [maximized, setMaximized] = useState<boolean>(false);
    const toggleMaximized = useCallback(() => {
        ee.emit('toggle-chart-size', cid, !maximized);
        setMaximized(m => !m);
    }, [cid, maximized]);

    const title = useMemo(() => `${tag} (${run.label})`, [tag, run.label]);

    const params = useMemo(
        () => ({
            data: dataset ?? [],
            mode
        }),
        [dataset, mode]
    );
    const data = useHeavyWork(transformWasm, transformWorker, transform, params);

    const [highlight, setHighlight] = useState<number | null>(null);
    useEffect(() => setHighlight(null), [mode]);

    const chartData = useMemo(() => {
        type Optional<T> = T | undefined;
        if (mode === Modes.Overlay) {
            return (data as Optional<OverlayData>)?.data.map((items, index) => ({
                name: `step${items[0][1]}`,
                data: items,
                lineStyle: {
                    color: run.colors[index === highlight || highlight == null ? 0 : 1]
                },
                z: index === highlight ? data?.data.length : index,
                encode: {
                    x: [2],
                    y: [3]
                }
            }));
        }
        if (mode === Modes.Offset) {
            const offset = data as Optional<OffsetData>;
            return {
                minX: offset?.minX,
                maxX: offset?.maxX,
                minY: offset?.minStep,
                maxY: offset?.maxStep,
                minZ: offset?.minZ,
                maxZ: offset?.maxZ,
                data: offset?.data ?? []
            };
        }
        return null as never;
    }, [data, mode, run, highlight]);

    const formatter = useCallback(
        (params: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]) => {
            if (!data) {
                return '';
            }
            if (mode === Modes.Overlay) {
                if (highlight == null) {
                    return '';
                }
                const series = (params as EChartOption.Tooltip.Format[]).filter(
                    s => s.data[1] === (data as OverlayData).data[highlight][0][1]
                );
                return [
                    series[0].seriesName,
                    ...series.map(s => `${formatTooltipXValue(s.data[2])}, ${formatTooltipYValue(s.data[3])}`)
                ].join('<br />');
            }
            if (mode === Modes.Offset) {
                return '';
            }
            return '' as never;
        },
        [highlight, data, mode]
    );

    const options = useMemo(
        () => ({
            ...chartOptions[mode],
            color: [run.colors[0]],
            tooltip: {
                formatter
            }
        }),
        [mode, run, formatter]
    );

    const onInit = useCallback(
        (echarts: ECharts) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const zr = (echarts as any).getZr();
            if (zr) {
                zr.on('mousemove', ({offsetX, offsetY}: {offsetX: number; offsetY: number}) => {
                    const series = echarts.getOption().series;
                    const pt: [number, number] = [offsetX, offsetY];
                    if (series) {
                        if (mode === Modes.Overlay) {
                            type Distance = number;
                            type Index = number;
                            const npts: [number, number, Distance, Index][] = series.map((s, i) =>
                                (s.data as OverlayDataItem[])?.reduce(
                                    (m, [, , x, y]) => {
                                        const px = echarts.convertToPixel('grid' as EChartsConvertFinder, [x, y]) as [
                                            number,
                                            number
                                        ];
                                        const d = distance(px, pt);
                                        if (d < m[2]) {
                                            return [x, y, d, i];
                                        }
                                        return m;
                                    },
                                    [0, 0, Number.POSITIVE_INFINITY, i]
                                )
                            );
                            const npt = minBy(npts, p => p[2]);
                            setHighlight(npt?.[3] ?? null);
                            return;
                        }
                    }
                });
                zr.on('mouseout', () => setHighlight(null));
            }
        },
        [mode]
    );

    const chart = useMemo(() => {
        if (mode === Modes.Overlay) {
            return (
                <StyledLineChart
                    ref={echart as React.RefObject<LineChartRef>}
                    title={title}
                    data={chartData as EChartOption<EChartOption.SeriesLine>['series']}
                    options={options}
                    loading={loading}
                    onInit={onInit}
                />
            );
        }
        if (mode === Modes.Offset) {
            return (
                <StyledStackChart
                    ref={echart as React.RefObject<StackChartRef>}
                    title={title}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={chartData as any}
                    options={options}
                    loading={loading}
                />
            );
        }
        return null;
    }, [chartData, loading, mode, options, title, onInit]);

    // display error only on first fetch
    if (!data && error) {
        return <Error>{t('common:error')}</Error>;
    }

    return (
        <Wrapper>
            {chart}
            <Toolbox
                items={[
                    {
                        icon: 'maximize',
                        activeIcon: 'minimize',
                        tooltip: t('histogram:maximize'),
                        activeTooltip: t('histogram:minimize'),
                        toggle: true,
                        onClick: toggleMaximized
                    },
                    {
                        icon: 'download',
                        tooltip: t('histogram:download-image'),
                        onClick: () => echart.current?.saveAsImage()
                    }
                ]}
            />
        </Wrapper>
    );
};

export default HistogramChart;
