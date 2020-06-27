import {SortingMethod as SM, TooltipData, XAxis} from './types';

import sortBy from 'lodash/sortBy';

export const xAxisMap = {
    [XAxis.Step]: 1,
    [XAxis.Relative]: 4,
    [XAxis.WallTime]: 0
} as const;

export const sortingMethod = [SM.Default, SM.Descending, SM.Ascending, SM.Nearest] as const;
export const sortingMethodMap: Record<SM, (points: TooltipData[], data: number[]) => TooltipData[]> = {
    [SM.Default]: (points: TooltipData[]) => points,
    [SM.Descending]: (points: TooltipData[]) => sortBy(points, point => point.item[3]).reverse(),
    [SM.Ascending]: (points: TooltipData[]) => sortBy(points, point => point.item[3]),
    // Compare other ponts width the trigger point, caculate the nearest sort.
    [SM.Nearest]: (points: TooltipData[], data: number[]) => sortBy(points, point => point.item[3] - data[2])
} as const;

export * from './types';
export * from './chart';
export * from './data';
