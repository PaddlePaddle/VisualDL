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

import type {DataListItem, Indicator, IndicatorGroup, IndicatorRaw, ListItem} from './types';

export function format(list: DataListItem[], indicators: Indicator[]): ListItem[] {
    return list.map(row =>
        indicators.reduce<ListItem>(
            (m, {name, group, type}) => {
                switch (type) {
                    case 'string':
                        m[group][name] = row[group][name] + '';
                        break;
                    case 'numeric':
                    case 'continuous':
                        m[group][name] = Number.parseFloat(row[group][name] + '') + '';
                        break;
                }
                return m;
            },
            {name: row.name, hparams: {}, metrics: {}}
        )
    );
}

export function formatIndicators(indicators: IndicatorRaw[], group: IndicatorGroup): Indicator[] {
    return indicators.map(indicator => {
        switch (indicator.type) {
            case 'numeric':
            case 'string':
                return {
                    ...indicator,
                    group,
                    selected: true,
                    selectedValues: [...indicator.values] as string[] | number[]
                };
            case 'continuous':
                return {
                    ...indicator,
                    group,
                    selected: true,
                    min: Number.NEGATIVE_INFINITY,
                    max: Number.POSITIVE_INFINITY
                };
            default:
                return null as never;
        }
    });
}
