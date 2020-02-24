import React, {FunctionComponent, useRef, useEffect, useCallback} from 'react';
import echarts, {ECharts, EChartOption} from 'echarts';
import * as chart from '~/utils/chart';

type LineChartProps = {
    title?: string;
    legend?: string[];
    data?: Partial<NonNullable<EChartOption<EChartOption.SeriesLine>['series']>>;
};

const LineChart: FunctionComponent<LineChartProps> = ({title, legend, data}) => {
    const ref = useRef(null);
    const echart = useRef(null as ECharts | null);

    const createChart = useCallback(() => {
        // eslint-disable-next-line
        echart.current = echarts.init((ref.current as unknown) as HTMLDivElement);
        echart.current.setOption({
            color: chart.color,
            title: {
                ...chart.title,
                text: title ?? ''
            },
            tooltip: chart.tooltip,
            toolbox: chart.toolbox,
            legend: {
                ...chart.legend,
                data: legend ?? []
            },
            grid: chart.grid,
            xAxis: chart.xAxis,
            yAxis: chart.yAxis
        });
        setTimeout(() => {
            echart.current?.dispatchAction({
                type: 'takeGlobalCursor',
                key: 'dataZoomSelect',
                dataZoomSelectActive: true
            });
        }, 0);
    }, [title, legend]);

    const destroyChart = useCallback(() => {
        echart.current && echart.current.dispose();
    }, []);

    const setChartData = useCallback(() => {
        echart.current &&
            echart.current.setOption({
                series: data?.map(item => ({
                    ...chart.series,
                    ...item
                }))
            });
    }, [data]);

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
