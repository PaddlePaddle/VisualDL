import {sortingMethodMap, xAxisMap} from './index';

import {Run} from '~/types';

type Value = number;
type WallTime = number;
type Step = number;
type Smoothed = number;
type Relative = number;

export type Dataset = [WallTime, Step, Value, Smoothed, Relative][];
export type ScalarDataset = [WallTime, Step, Value][];

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
