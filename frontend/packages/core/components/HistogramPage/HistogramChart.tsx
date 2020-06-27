import {HistogramData, Modes, OffsetData, OverlayData, options as chartOptions, transform} from '~/resource/histogram';
import LineChart, {LineChartRef} from '~/components/LineChart';
import React, {FunctionComponent, useCallback, useMemo, useRef, useState} from 'react';
import StackChart, {StackChartRef} from '~/components/StackChart';
import {rem, size} from '~/utils/style';

import ChartToolbox from '~/components/ChartToolbox';
import {EChartOption} from 'echarts';
import {Run} from '~/types';
import ee from '~/utils/event';
import queryString from 'query-string';
import styled from 'styled-components';
import useHeavyWork from '~/hooks/useHeavyWork';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from '~/utils/i18n';

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

    const chartData = useMemo(() => {
        type Optional<T> = T | undefined;
        if (mode === Modes.Overlay) {
            return (data as Optional<OverlayData>)?.data.map(items => ({
                name: `step${items[0][1]}`,
                data: items,
                encode: {
                    x: [2],
                    y: [3]
                }
            }));
        }
        if (mode === Modes.Offset) {
            return {
                ...((data as Optional<OffsetData>) ?? {})
            };
        }
    }, [data, mode]);

    const options = useMemo(
        () => ({
            ...chartOptions[mode],
            color: [run.colors[0]]
        }),
        [mode, run]
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
                />
            );
        }
        if (mode === Modes.Offset) {
            return (
                <StyledStackChart
                    ref={echart as React.RefObject<StackChartRef>}
                    title={title}
                    data={chartData as EChartOption<EChartOption.SeriesCustom>['series'] & OffsetData}
                    options={options}
                    loading={loading}
                />
            );
        }
        return null;
    }, [chartData, loading, mode, options, title]);

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
