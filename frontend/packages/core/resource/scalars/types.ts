import {sortingMethodMap, xAxisMap} from './index';

import {Run} from '~/types';

export type Dataset = number[][];

export type XAxis = keyof typeof xAxisMap;
export type SortingMethod = keyof typeof sortingMethodMap;

export type Range = {
    min: number;
    max: number;
};

export type TooltipData = {
    run: Run;
    item: number[];
};
