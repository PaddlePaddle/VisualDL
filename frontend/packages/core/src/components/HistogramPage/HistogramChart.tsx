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

import type {EChartOption, ECharts, EChartsConvertFinder} from 'echarts';
import type {HistogramData, OffsetData, OverlayData, OverlayDataItem} from '~/resource/histogram';
import LineChart, {LineChartRef} from '~/components/LineChart';
import {Modes, options as chartOptions, transform} from '~/resource/histogram';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import StackChart, {StackChartProps, StackChartRef} from '~/components/StackChart';
import {rem, size} from '~/utils/style';

import ChartToolbox from '~/components/ChartToolbox';
import type {Run} from '~/types';
import {distance} from '~/utils';
import ee from '~/utils/event';
import {fetcher} from '~/utils/fetch';
import {format} from 'd3-format';
import type {histogram_transform} from '@visualdl/wasm'; // eslint-disable-line @typescript-eslint/no-unused-vars
import minBy from 'lodash/minBy';
import queryString from 'query-string';
import styled from 'styled-components';
import useHeavyWork from '~/hooks/useHeavyWork';
import {useRunningRequest} from '~/hooks/useRequest';
import useThrottleFn from '~/hooks/useThrottleFn';
import {useTranslation} from 'react-i18next';
import wasm from '~/utils/wasm';

const formatTooltipXValue = format('.4f');
const formatTooltipYValue = format('.4');

const transformWasm = () =>
    wasm<typeof histogram_transform>('histogram_transform').then((histogram_transform): typeof transform => params =>
        histogram_transform(params.data, params.mode)
    );
// const transformWorker = () => new Worker('~/worker/histogram/transform.worker.ts', {type: 'module'});

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
        !!running,
        fetcher,
        {
            refreshInterval: 60 * 1000
        }
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
    const data = useHeavyWork(transformWasm, null, transform, params);

    const [highlight, setHighlight] = useState<number | null>(null);
    useEffect(() => setHighlight(null), [mode]);

    const chartData = useMemo(() => {
        type Optional<T> = T | undefined;
        if (mode === Modes.Overlay) {
            return (data as Optional<OverlayData>)?.data.map((items, index) => ({
                name: `${t('common:time-mode.step')}${items[0][1]}`,
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
    }, [data, mode, run, highlight, t]);

    const formatter = useMemo(
        () => ({
            [Modes.Overlay]: (params: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]) => {
                if (!data || highlight == null) {
                    return '';
                }
                const series = (params as EChartOption.Tooltip.Format[]).find(
                    s => s.data[1] === (data as OverlayData).data[highlight][0][1]
                );
                return series?.seriesName ?? '';
            },
            [Modes.Offset]: (dot: [number, number, number]) => dot[2]
        }),
        [highlight, data]
    );

    const pointerFormatter = useMemo(
        () => ({
            [Modes.Overlay]: (params: {value: number; axisDimension: 'x' | 'y'}) => {
                if (params.axisDimension === 'x') {
                    return formatTooltipXValue(params.value);
                }
                if (params.axisDimension === 'y') {
                    return formatTooltipYValue(params.value);
                }
                return '' as never;
            },
            [Modes.Offset]: (params: {axisDimension: 'x' | 'y'}, dot: [number, number, number]) => {
                if (params.axisDimension === 'x') {
                    return formatTooltipXValue(dot?.[0]);
                }
                if (params.axisDimension === 'y') {
                    return formatTooltipYValue(dot?.[1]);
                }
                return '' as never;
            }
        }),
        []
    );

    const options = useMemo(
        () => ({
            ...chartOptions[mode],
            color: [run.colors[0]],
            tooltip: {
                formatter: formatter[mode]
            },
            axisPointer: {
                label: {
                    formatter: pointerFormatter[mode]
                }
            },
            xAxis: {
                axisPointer: {
                    snap: mode === Modes.Overlay
                }
            },
            yAxis: {
                axisPointer: {
                    snap: mode === Modes.Overlay
                }
            }
        }),
        [mode, run, formatter, pointerFormatter]
    );

    const mousemove = useCallback((echarts: ECharts, {offsetX, offsetY}: {offsetX: number; offsetY: number}) => {
        const series = echarts.getOption().series;
        const pt: [number, number] = [offsetX, offsetY];
        if (series) {
            type Distance = number;
            type Index = number;
            const npts: [number, number, Distance, Index][] = series.map((s, i) =>
                (s.data as OverlayDataItem[])?.reduce(
                    (m, [, , x, y]) => {
                        const px = echarts.convertToPixel('grid' as EChartsConvertFinder, [x, y]) as [number, number];
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
    }, []);

    const throttled = useThrottleFn(mousemove, {wait: 200});

    const onInit = useCallback(
        (echarts: ECharts) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const zr = (echarts as any).getZr();
            if (zr) {
                zr.on('mousemove', (e: {offsetX: number; offsetY: number}) => throttled.run(echarts, e));
                zr.on('mouseout', () => {
                    throttled.cancel();
                    setHighlight(null);
                });
            }
        },
        [throttled]
    );

    const chart = useMemo(() => {
        if (mode === Modes.Overlay) {
            return (
                <StyledLineChart
                    ref={echart as React.RefObject<LineChartRef>}
                    title={title}
                    data={chartData as EChartOption<EChartOption.SeriesLine>['series']}
                    options={options as EChartOption}
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
                    data={chartData as StackChartProps['data']}
                    options={options as EChartOption}
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
