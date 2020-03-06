import React, {FunctionComponent, useEffect, useCallback} from 'react';
import {EChartOption} from 'echarts';
import {WithStyled} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
import useECharts from '~/hooks/useECharts';
import * as chart from '~/utils/chart';
import {formatTime} from '~/utils/scalars';

type LineChartProps = {
    title?: string;
    legend?: string[];
    data?: Partial<NonNullable<EChartOption<EChartOption.SeriesLine>['series']>>;
    xAxis?: string;
    type?: EChartOption.BasicComponents.CartesianAxis.Type;
    yRange?: {
        min: number;
        max: number;
    };
    tooltip?: string | EChartOption.Tooltip.Formatter;
    loading?: boolean;
};

const LineChart: FunctionComponent<LineChartProps & WithStyled> = ({
    title,
    legend,
    data,
    xAxis,
    type,
    yRange,
    tooltip,
    loading,
    className
}) => {
    const {i18n} = useTranslation();

    const {ref, echart} = useECharts<HTMLDivElement>({
        loading: !!loading,
        zoom: true
    });

    const xAxisFormatter = useCallback(
        (value: number) => (type === 'time' ? formatTime(value, i18n.language, 'LTS') : value),
        [type, i18n.language]
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
                        type: type || 'value',
                        axisLabel: {
                            ...chart.xAxis.axisLabel,
                            formatter: xAxisFormatter
                        }
                    },
                    yAxis: {
                        ...chart.yAxis,
                        ...(yRange || {})
                    },
                    series: data?.map(item => ({
                        ...chart.series,
                        ...item
                    }))
                } as EChartOption,
                {notMerge: true}
            );
        }
    }, [data, title, legend, xAxis, type, xAxisFormatter, yRange, tooltip, echart]);

    return <div className={className} ref={ref}></div>;
};

export default LineChart;
