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

// cspell:words quantile

export type {Range} from '~/types';

export enum OrderDirection {
    ASCENDING = 'asc',
    DESCENDING = 'desc'
}

export enum ScaleMethod {
    LINEAR = 'linear',
    LOGARITHMIC = 'logarithmic',
    QUANTILE = 'quantile'
}

export type IndicatorType = 'string' | 'numeric' | 'continuous';
export type IndicatorGroup = 'hparams' | 'metrics';

interface IndicatorBase<T extends IndicatorType> {
    name: string;
    type: T;
}

interface DiscreteIndicator<T extends 'string' | 'numeric'> extends IndicatorBase<T> {
    values: T extends 'string' ? string[] : T extends 'numeric' ? number[] : never[];
}

type DiscreteStringIndicator = DiscreteIndicator<'string'>;
type DiscreteNumericIndicator = DiscreteIndicator<'numeric'>;
type ContinuousIndicator = IndicatorBase<'continuous'>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type IndicatorRaw<T extends {} = {}> = (
    | DiscreteStringIndicator
    | DiscreteNumericIndicator
    | ContinuousIndicator
) &
    T;

type IndicatorWithGroup = IndicatorRaw & {
    group: IndicatorGroup;
};

interface FilterData {
    selected: boolean;
    min?: number;
    max?: number;
    selectedValues?: number[] | string[];
}

export type Indicator = IndicatorWithGroup & FilterData;

// eslint-disable-next-line @typescript-eslint/ban-types
export interface IndicatorData<T extends {} = {}> {
    hparams: IndicatorRaw<T>[];
    metrics: IndicatorRaw<T>[];
}

export interface DataListItem<T extends string | number = string | number> {
    name: string;
    hparams: Record<string, T>;
    metrics: Record<string, T>;
}

export type ListItem = DataListItem<string>;

export interface ViewData {
    indicators: Indicator[];
    list: ListItem[];
    data: DataListItem[];
}

export interface ImportanceData {
    name: string;
    value: number;
}

type Value = number;
type WallTime = number;
type Step = number;

export type MetricData = [WallTime, Step, Value];
