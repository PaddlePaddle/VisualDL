import {TooltipData} from './types';
import sortBy from 'lodash/sortBy';

export const xAxis = ['step', 'relative', 'wall'] as const;
export const xAxisMap = {
    step: 1,
    relative: 4,
    wall: 0
} as const;

export const sortingMethod = ['default', 'descending', 'ascending', 'nearest'] as const;
export const sortingMethodMap = {
    default: null,
    descending: (points: TooltipData[]) => sortBy(points, point => point.item[3]).reverse(),
    ascending: (points: TooltipData[]) => sortBy(points, point => point.item[3]),
    // Compare other ponts width the trigger point, caculate the nearest sort.
    nearest: (points: TooltipData[], data: number[]) => sortBy(points, point => point.item[3] - data[2])
} as const;

export * from './types';
export * from './chart';
export * from './data';
