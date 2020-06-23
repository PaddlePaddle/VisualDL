import * as chart from '~/utils/chart';

import React, {useCallback, useEffect, useImperativeHandle} from 'react';
import {WithStyled, primaryColor} from '~/utils/style';
import useECharts, {Wrapper} from '~/hooks/useECharts';

import {EChartOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {useTranslation} from '~/utils/i18n';

type renderItem = NonNullable<EChartOption.SeriesCustom['renderItem']>;
type renderItemArguments = NonNullable<renderItem['arguments']>;
type RenderItem = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any,
    api: Required<NonNullable<renderItemArguments['api']>>
) => NonNullable<renderItem['return']>;
type GetValue = (i: number) => number;
type GetCoord = (p: [number, number]) => [number, number];

type StackChartProps = {
    options?: EChartOption;
    title?: string;
    data?: Partial<NonNullable<EChartOption<EChartOption.SeriesCustom>['series']>[number]> & {
        minZ: number;
        maxZ: number;
        minX: number;
        maxX: number;
        minStep: number;
        maxStep: number;
    };
    loading?: boolean;
    zoom?: boolean;
};

export type StackChartRef = {
    saveAsImage(): void;
};

const StackChart = React.forwardRef<StackChartRef, StackChartProps & WithStyled>(
    ({options, data, title, loading, zoom, className}, ref) => {
        const {i18n} = useTranslation();

        const {ref: echartRef, echart, wrapper, saveAsImage} = useECharts<HTMLDivElement>({
            loading: !!loading,
            zoom,
            autoFit: true
        });

        useImperativeHandle(ref, () => ({
            saveAsImage: () => {
                saveAsImage(title);
            }
        }));

        const {minZ, maxZ, minStep, maxStep, minX, maxX, ...seriesData} = data ?? {
            minZ: 0,
            maxZ: 0,
            minStep: 0,
            maxStep: 0,
            minX: 0,
            maxX: 0,
            data: null
        };
        const rawData = (seriesData.data as number[][]) ?? [];

        const getPoint = useCallback(
            (x: number, y: number, z: number, getCoord: GetCoord, yValueMapHeight: number) => {
                const pt = getCoord([x, y]);
                // linear map in z axis
                pt[1] -= ((z - minZ) / (maxZ - minZ)) * yValueMapHeight;
                return pt;
            },
            [minZ, maxZ]
        );

        const makePolyPoints = useCallback(
            (dataIndex: number, getValue: GetValue, getCoord: GetCoord, yValueMapHeight: number) => {
                const points = [];
                let i = 0;
                while (rawData[dataIndex] && i < rawData[dataIndex].length) {
                    const x = getValue(i++);
                    const y = getValue(i++);
                    const z = getValue(i++);
                    points.push(getPoint(x, y, z, getCoord, yValueMapHeight));
                }
                return points;
            },
            [getPoint, rawData]
        );

        useEffect(() => {
            if (process.browser) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const {color, colorAlt, ...defaults} = chart;

                const chartOptions: EChartOption = defaultsDeep(
                    {
                        title: {
                            text: title ?? ''
                        },
                        visualMap: {
                            min: minStep,
                            max: maxStep
                        },
                        xAxis: {
                            min: minX,
                            max: maxX
                        },
                        grid: {
                            top: '40%'
                        },
                        tooltip: {
                            axisPointer: {
                                axis: 'y',
                                snap: false
                            }
                        },
                        series: [
                            {
                                type: 'custom',
                                dimensions: ['x', 'y'],
                                data: rawData as number[][],
                                renderItem: ((params, api) => {
                                    const points = makePolyPoints(
                                        params.dataIndex as number,
                                        api.value as GetValue,
                                        api.coord as GetCoord,
                                        (params.coordSys.y as number) - 10
                                    );
                                    return {
                                        type: 'polygon',
                                        silent: true,
                                        shape: {
                                            points
                                        },
                                        style: api.style({
                                            stroke: chart.xAxis.axisLine.lineStyle.color,
                                            lineWidth: 1
                                        })
                                    };
                                }) as RenderItem
                            }
                        ]
                    },
                    options,
                    defaults
                );
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [options, data, title, i18n.language, echart, rawData, minX, maxX, minStep, maxStep, makePolyPoints]);

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

export default StackChart;
