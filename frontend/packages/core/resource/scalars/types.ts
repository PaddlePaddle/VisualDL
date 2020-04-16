import {xAxisMap} from './index';

export type Dataset = number[][];

export type Range = {
    min: number;
    max: number;
};

export type TooltipData = {
    run: string;
    item: number[];
};

export type TransformParams = {
    datasets: Dataset[];
    smoothing: number;
};

export type ChartDataParams = {
    data: Dataset[];
    runs: string[];
    smooth: boolean;
    xAxis: keyof typeof xAxisMap;
};

export type RangeParams = {
    datasets: Dataset[];
    outlier: boolean;
};
