import React, {FunctionComponent, useRef, useEffect, useCallback} from 'react';
import echarts, {ECharts, EChartOption} from 'echarts';
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
};

const LineChart: FunctionComponent<LineChartProps> = ({title, legend, data, xAxis, type, yRange, tooltip}) => {
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
        echart.current && echart.current.dispose();
    }, []);

    const setChartData = useCallback(() => {
        echart.current &&
            echart.current.setOption(
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

    return <div style={{height: '100%'}} ref={ref}></div>;
};

export default LineChart;
