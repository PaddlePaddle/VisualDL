import * as chart from '~/utils/chart';

import React, {useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef} from 'react';
import {WithStyled, position, primaryColor, size} from '~/utils/style';

import {EChartOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import {dataURL2Blob} from '~/utils/image';
import {formatTime} from '~/utils';
import {saveAs} from 'file-saver';
import styled from 'styled-components';
import useECharts from '~/hooks/useECharts';
import {useTranslation} from '~/utils/i18n';

const Wrapper = styled.div`
    position: relative;

    > .echarts {
        height: 100%;
    }

    > .loading {
        ${size('100%')}
        ${position('absolute', 0, null, null, 0)}
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

type Range = {
    min: EChartOption.BasicComponents.CartesianAxis['min'];
    max: EChartOption.BasicComponents.CartesianAxis['max'];
};

type LineChartProps = {
    title?: string;
    legend?: string[];
    data?: Partial<NonNullable<EChartOption<EChartOption.SeriesLine>['series']>>;
    xAxis?: string;
    yAxis?: string;
    xType?: EChartOption.BasicComponents.CartesianAxis.Type;
    yType?: EChartOption.BasicComponents.CartesianAxis.Type;
    xRange?: Range;
    yRange?: Range;
    tooltip?: string | EChartOption.Tooltip.Formatter;
    loading?: boolean;
};

export type LineChartRef = {
    restore(): void;
    saveAsImage(): void;
};

const LineChart = React.forwardRef<LineChartRef, LineChartProps & WithStyled>(
    ({title, legend, data, xAxis, yAxis, xType, yType, xRange, yRange, tooltip, loading, className}, ref) => {
        const {i18n} = useTranslation();

        const {ref: echartRef, echart, wrapper} = useECharts<HTMLDivElement>({
            loading: !!loading,
            zoom: true,
            autoFit: true
        });

        useImperativeHandle(ref, () => ({
            restore: () => {
                echart?.current?.dispatchAction({
                    type: 'restore'
                });
            },
            saveAsImage: () => {
                if (echart?.current) {
                    const blob = dataURL2Blob(
                        echart.current.getDataURL({type: 'png', pixelRatio: 2, backgroundColor: '#FFF'})
                    );
                    saveAs(blob, `${title?.replace(/[/\\?%*:|"<>]/g, '_') || 'scalar'}.png`);
                }
            }
        }));

        const xAxisFormatter = useCallback(
            (value: number) => (xType === 'time' ? formatTime(value, i18n.language, 'LTS') : value),
            [xType, i18n.language]
        );

        useEffect(() => {
            if (process.browser) {
                echart?.current?.setOption(
                    {
                        color: chart.color,
                        title: {
                            ...chart.title,
                            text: title ?? ''
                        },
                        tooltip: {
                            ...chart.tooltip,
                            ...(tooltip
                                ? {
                                      formatter: tooltip
                                  }
                                : {})
                        },
                        toolbox: chart.toolbox,
                        legend: {
                            ...chart.legend,
                            data: legend ?? []
                        },
                        grid: chart.grid,
                        xAxis: {
                            ...chart.xAxis,
                            name: xAxis || '',
                            type: xType || 'value',
                            axisLabel: {
                                ...chart.xAxis.axisLabel,
                                formatter: xAxisFormatter
                            },
                            ...(xRange || {})
                        },
                        yAxis: {
                            ...chart.yAxis,
                            name: yAxis || '',
                            type: yType || 'value',
                            ...(yRange || {})
                        },
                        series: data?.map(item => ({
                            ...chart.series,
                            // show symbol if there is only one point
                            showSymbol: (item?.data?.length ?? 0) <= 1,
                            ...item
                        }))
                    } as EChartOption,
                    {notMerge: true}
                );
            }
        }, [data, title, legend, xAxis, yAxis, xType, yType, xAxisFormatter, xRange, yRange, tooltip, echart]);

        return (
            <Wrapper ref={wrapper} className={className}>
                {!echart && (
                    <div className="loading">
                        <GridLoader color={primaryColor} size="10px" />
                    </div>
                )}
                <div className="echarts" ref={echartRef}></div>
            </Wrapper>
        );
    }
);

export default LineChart;
