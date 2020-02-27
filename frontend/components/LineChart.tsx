import React, {FunctionComponent, useRef, useEffect, useCallback} from 'react';
import echarts, {ECharts, EChartOption} from 'echarts';
import {WithStyled} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
import * as chart from '~/utils/chart';

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
    const {t} = useTranslation('common');
    const ref = useRef(null);
    const echart = useRef(null as ECharts | null);

    const xAxisFormatter = useCallback(
        (value: number) => (type === 'time' ? new Date(value).toLocaleTimeString() : value),
        [type]
    );

    const createChart = useCallback(() => {
        // eslint-disable-next-line
        echart.current = echarts.init((ref.current as unknown) as HTMLDivElement);
        setTimeout(() => {
            echart.current?.dispatchAction({
                type: 'takeGlobalCursor',
                key: 'dataZoomSelect',
                dataZoomSelectActive: true
            });
        }, 0);
    }, []);

    const destroyChart = useCallback(() => {
        echart.current?.dispose();
    }, []);

    const setChartData = useCallback(() => {
        echart.current?.setOption(
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
    }, [data, title, legend, xAxis, type, xAxisFormatter, yRange, tooltip]);

    useEffect(() => {
        if (process.browser) {
            createChart();
            return () => destroyChart();
        }
    }, [createChart, destroyChart]);

    useEffect(() => {
        if (process.browser) {
            setChartData();
        }
    }, [setChartData]);

    useEffect(() => {
        if (process.browser) {
            if (loading) {
                echart.current?.showLoading('default', {
                    text: t('loading'),
                    color: '#c23531',
                    textColor: '#000',
                    maskColor: 'rgba(255, 255, 255, 0.8)',
                    zlevel: 0
                });
            } else {
                echart.current?.hideLoading();
            }
        }
    }, [t, loading]);

    return <div className={className} ref={ref}></div>;
};

export default LineChart;
