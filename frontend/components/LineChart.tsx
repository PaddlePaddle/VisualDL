import React, {FunctionComponent, useRef, useEffect} from 'react';
import useSWR from 'swr';
import echarts, {ECharts, EChartOption} from 'echarts';
import smooth from '~/utils/smooth';
import {Tag} from '~/types';

type LineChartProps = {
    value: Tag;
};

const LineChart: FunctionComponent<LineChartProps> = ({value}) => {
    const ref = useRef(null);
    let chart: ECharts | null = null;

    const datas = value.runs.map(run => ({
        data: useSWR(`/scalars/scalars?run=${encodeURIComponent(run)}&tag=${encodeURIComponent(value.label)}`)
            .data as number[][],
        run
    }));

    const createChart = () => {
        chart = echarts.init((ref.current as any) as HTMLDivElement);
    };
    const destroyChart = () => {
        chart && chart.dispose();
    };
    const setChartData = (dataset: typeof datas) => {
        chart &&
            dataset.every(data => data.data) &&
            chart.setOption({
                series: [
                    ...dataset.map(
                        (data, i) =>
                            ({
                                name: data.run,
                                type: 'line',
                                showSymbol: false,
                                hoverAnimation: false,
                                z: i,
                                animationDuration: 100,
                                lineStyle: {
                                    width: 1.5,
                                    opacity: 0.5
                                },
                                data: data.data,
                                encode: {
                                    x: [1],
                                    y: [2]
                                },
                                smooth: true
                            } as NonNullable<EChartOption['series']>[0])
                    ),
                    ...dataset.map(
                        (data, i) =>
                            ({
                                name: data.run,
                                type: 'line',
                                showSymbol: false,
                                hoverAnimation: false,
                                z: dataset.length + i,
                                animationDuration: 100,
                                lineStyle: {
                                    width: 1.5,
                                },
                                data: smooth(data.data, 0.6),
                                encode: {
                                    x: [1],
                                    y: [3]
                                },
                                smooth: true
                            } as NonNullable<EChartOption['series']>[0])
                    )
                ]
            });
    };

    if (process.browser) {
        useEffect(() => {
            createChart();
            if (chart) {
                setTimeout(() => {
                    chart &&
                        chart.dispatchAction({
                            type: 'takeGlobalCursor',
                            key: 'dataZoomSelect',
                            dataZoomSelectActive: true
                        });
                }, 0);
                chart.setOption({
                    color: ['#2932E1', '#25C9FF', '#981EFF', '#D8DAF6', '#E9F9FF', '#F3E8FF'],
                    title: {
                        text: value.label,
                        textStyle: {
                            fontSize: 16,
                            fontWeight: 'bold'
                        },
                        top: 10,
                        left: 15
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                show: false
                            },
                            lineStyle: {
                                color: '#2932E1',
                                type: 'dashed'
                            },
                            crossStyle: {
                                color: '#2932E1',
                                type: 'dashed'
                            }
                        }
                    },
                    toolbox: {
                        show: true,
                        orient: 'vertical',
                        showTitle: false,
                        top: 50,
                        right: 8,
                        feature: {
                            saveAsImage: {
                                show: true
                            },
                            dataZoom: {
                                show: true
                            },
                            restore: {
                                show: true
                            }
                        },
                        tooltip: {
                            show: true
                        }
                    },
                    legend: {
                        data: value.runs,
                        top: 12,
                        right: 15,
                        itemWidth: 17,
                        itemHeight: 5,
                        textStyle: {
                            fontSize: 14
                        },
                        icon: 'roundRect'
                    },
                    grid: {
                        left: 50,
                        top: 60,
                        right: 50,
                        bottom: 50
                    },
                    xAxis: {
                        type: 'value',
                        name: 'Step',
                        nameTextStyle: {
                            fontSize: 12,
                            color: '#666'
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#CCC'
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            fontSize: 12,
                            color: '#666'
                        },
                        splitLine: {
                            show: false
                        },
                        splitNumber: 5
                    },
                    yAxis: {
                        type: 'value',
                        splitNumber: 4,
                        axisLine: {
                            lineStyle: {
                                color: '#CCC'
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            fontSize: 12,
                            color: '#666',
                            formatter: (v: number) => v.toString().slice(0, 5)
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#EEE'
                            }
                        }
                    }
                });
                setChartData(datas);
            }
            return () => destroyChart();
        }, [datas]);
    }

    return <div style={{height: '100%'}} ref={ref}></div>;
};

export default LineChart;
