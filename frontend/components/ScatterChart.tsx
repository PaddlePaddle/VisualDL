import React, {FunctionComponent, useEffect} from 'react';
import {EChartOption} from 'echarts';
import {WithStyled, primaryColor} from '~/utils/style';
import useECharts from '~/hooks/useECharts';
import {Dimension} from '~/types';

type ScatterChartProps = {
    data?: ([number, number] | [number, number, number])[];
    labels?: string[];
    loading?: boolean;
    dimension?: Dimension;
};

const ScatterChart: FunctionComponent<ScatterChartProps & WithStyled> = ({
    data,
    labels,
    loading,
    dimension,
    className
}) => {
    const [ref, echart] = useECharts<HTMLDivElement>(!!loading);

    useEffect(() => {
        if (process.browser) {
            (async () => {
                const is3D = dimension === '3d';
                if (is3D) {
                    await import('echarts-gl');
                }
                echart.current?.setOption(
                    {
                        ...(is3D
                            ? {
                                  yAxis3D: {},
                                  xAxis3D: {},
                                  zAxis3D: {},
                                  grid3D: {}
                              }
                            : {
                                  xAxis: {},
                                  yAxis: {}
                              }),
                        series: [
                            {
                                data,
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: (
                                        params: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]
                                    ) => {
                                        if (!labels) {
                                            return '';
                                        }
                                        const {dataIndex: index} = Array.isArray(params) ? params[0] : params;
                                        if (index == null) {
                                            return '';
                                        }
                                        return labels[index] ?? '';
                                    }
                                },
                                symbolSize: 12,
                                itemStyle: {
                                    color: primaryColor
                                },
                                type: is3D ? 'scatter3D' : 'scatter'
                            }
                        ]
                    },
                    {notMerge: true}
                );
            })();
        }
    }, [data, labels, dimension, echart]);

    return <div className={className} ref={ref}></div>;
};

export default ScatterChart;
