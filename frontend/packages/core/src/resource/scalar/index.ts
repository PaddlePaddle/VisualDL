/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {SortingMethod as SM, XAxis} from './types';

import type {TooltipData} from './types';
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
    // Compare other points width the trigger point, calculate the nearest sort.
    [SM.Nearest]: (points: TooltipData[], data: number[]) => sortBy(points, point => point.item[3] - data[2])
} as const;

export type {Dataset, ScalarDataset, Range, TooltipData} from './types';
export {XAxis, SortingMethod} from './types';
export * from './chart';
export * from './data';
