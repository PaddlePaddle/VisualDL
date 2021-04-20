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

export type Data = {
    id: string;
    value: string;
};

export enum OrderDirection {
    ASCENDING = 'asc',
    DESCENDING = 'desc'
}

interface IndicatorBase<T extends 'string' | 'numeric' | 'continuous'> {
    name: string;
    type: T;
}

export interface DiscreteIndicator<T extends 'string' | 'numeric'> extends IndicatorBase<T> {
    values: T extends 'string' ? string[] : T extends 'numeric' ? number[] : never[];
}

export type DiscreteStringIndicator = DiscreteIndicator<'string'>;
export type DiscreteNumericIndicator = DiscreteIndicator<'numeric'>;
export type ContinuousIndicator = IndicatorBase<'continuous'>;

export type Indicator = DiscreteStringIndicator | DiscreteNumericIndicator | ContinuousIndicator;

export interface IndicatorData {
    hparams: Indicator[];
    metrics: Indicator[];
}

export interface Range {
    min: number;
    max: number;
}

export interface ListItem<T extends string | number = string | number> {
    name: string;
    hparams: Record<string, T>;
    metrics: Record<string, T>;
}

export interface ViewData<T extends string | number = string | number> {
    indicators: IndicatorData;
    list: ListItem<T>[];
}
