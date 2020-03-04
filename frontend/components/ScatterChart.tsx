import React, {FunctionComponent, useEffect, useMemo} from 'react';
import {EChartOption} from 'echarts';
import {WithStyled, primaryColor} from '~/utils/style';
import useECharts from '~/hooks/useECharts';
import {Dimension} from '~/types';

const SYMBOL_SIZE = 12;

type Point = {
    name: string;
    value: [number, number] | [number, number, number];
};

type ScatterChartProps = {
    keyword: string;
    loading: boolean;
    points: Point[];
    dimension: Dimension;
};

const assemble2D = (points: {highlighted: Point[]; others: Point[]}, label: EChartOption.SeriesBar['label']) => {
    // eslint-disable-next-line
    const createSeries = (name: string, data: Point[], patch?: {[k: string]: any}) => ({
        name,
        symbolSize: SYMBOL_SIZE,
        data,
        type: 'scatter',
        label,
        ...(patch || {})
    });

    return {
        xAxis: {},
        yAxis: {},
        toolbox: {
            show: true,
            showTitle: false,
            itemSize: 0,

            feature: {
                dataZoom: {},
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            createSeries('highlighted', points.highlighted),
            createSeries('others', points.others, {color: primaryColor})
        ]
    };
};

const assemble3D = (points: {highlighted: Point[]; others: Point[]}, label: EChartOption.SeriesBar['label']) => {
    // eslint-disable-next-line
    const createSeries = (name: string, data: Point[], patch?: {[k: string]: any}) => ({
        name,
        symbolSize: SYMBOL_SIZE,
        data,
        type: 'scatter3D',
        label,
        ...(patch || {})
    });

    return {
        grid3D: {},
        xAxis3D: {},
        yAxis3D: {},
        zAxis3D: {},
        series: [
            createSeries('highlighted', points.highlighted),
            createSeries('others', points.others, {color: primaryColor})
        ]
    };
};

const getChartOptions = (
    settings: Pick<ScatterChartProps, 'dimension'> & {points: {highlighted: Point[]; others: Point[]}}
) => {
    const {dimension, points} = settings;
    const label = {
        show: true,
        position: 'top',
        formatter: (params: {data: {name: string; showing: boolean}}) => (params.data.showing ? params.data.name : '')
    };

    const assemble = dimension === '2d' ? assemble2D : assemble3D;
    return assemble(points, label);
};

const dividePoints = (points: Point[], keyword: string): [Point[], Point[]] => {
    if (!keyword) {
        return [[], points];
    }

    const matched: Point[] = [];
    const missing: Point[] = [];
    points.forEach(point => {
        if (point.name.includes(keyword)) {
            matched.push(point);
            return;
        }
        missing.push(point);
    });

    return [matched, missing];
};

const ScatterChart: FunctionComponent<ScatterChartProps & WithStyled> = ({
    points,
    keyword,
    loading,
    dimension,
    className
}) => {
    const [ref, echart] = useECharts<HTMLDivElement>({
        loading,
        gl: true
    });
    const [highlighted, others] = useMemo(() => dividePoints(points, keyword), [points, keyword]);
    const chartOptions = useMemo(
        () =>
            getChartOptions({
                dimension,
                points: {
                    highlighted,
                    others
                }
            }),
        [dimension, highlighted, others]
    );

    useEffect(() => {
        if (!process.browser) {
            return;
        }

        echart.current?.setOption(
            chartOptions,
            true // not merged
        );
    }, [chartOptions, echart]);

    return <div className={className} ref={ref}></div>;
};

export default ScatterChart;
