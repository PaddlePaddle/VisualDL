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

import * as d3 from 'd3';

import type {DataListItem, Indicator, IndicatorGroup, IndicatorRaw, ListItem} from './types';

export const COLOR_MAP = ['#2932E1', '#FE4A3B', '#FFAA00'];

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

export function getColorScale(indicator: Indicator | null, data: DataListItem[]): d3.ScaleLinear<string, string> {
    let domain: number[];
    if (indicator == null) {
        domain = [0, data.length - 1];
    } else if (indicator.type !== 'continuous') {
        throw new Error('cannot color lines by `' + indicator.name + '`');
    } else {
        const values = data.map(row => +row[indicator.group][indicator.name]);
        domain = d3.extent(values) as [number, number];
    }
    const min = domain[0];
    const max = domain.pop() as number;
    for (let i = 1; i < COLOR_MAP.length - 1; i++) {
        domain.push(min + ((max - min) / (COLOR_MAP.length - 1)) * i);
    }
    domain.push(max);
    return (
        d3
            .scaleLinear<string, string>()
            .domain(domain)
            .range(COLOR_MAP)
            // d3 types sucks
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .interpolate(d3.interpolateRgb as any)
    );
}
