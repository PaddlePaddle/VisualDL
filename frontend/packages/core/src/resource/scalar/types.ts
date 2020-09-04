import {Run, TimeMode} from '~/types';

type Value = number;
type WallTime = number;
type Step = number;
type Smoothed = number;
type Relative = number;

export type Dataset = [WallTime, Step, Value, Smoothed, Relative][];
export type ScalarDataset = [WallTime, Step, Value][];

export {TimeMode as XAxis};
export enum SortingMethod {
    Default = 'default',
    Descending = 'descending',
    Ascending = 'ascending',
    Nearest = 'nearest'
}

export type Range = {
    min: number;
    max: number;
};

export type TooltipData = {
    run: Run;
    item: Dataset[number];
    min?: number;
    max?: number;
};
