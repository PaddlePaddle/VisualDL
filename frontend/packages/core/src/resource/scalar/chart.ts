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

// cSpell:words maxs coord

import type {Dataset, Range, TooltipData, XAxis} from './types';

import type I18n from 'i18next';
import type {Run} from '~/types';
import {format} from 'd3-format';
import {formatTime} from '~/utils';
import moment from 'moment';
import {xAxisMap} from './index';

const valueFormatter = format('.5');

const humanizeDuration = (ms: number) => {
    const time = moment.duration(ms);
    const hour = time.hours();
    if (hour) {
        time.subtract(hour, 'hour');
    }
    const minute = time.minutes();
    if (minute) {
        time.subtract(minute, 'minute');
    }
    const second = time.asSeconds();
    let str = Math.floor(second) + 's';
    if (hour) {
        str = `${hour}h${minute}m${str}`;
    } else if (minute) {
        str = `${minute}m${str}`;
    }
    return str;
};

export const options = {
    legend: {
        data: []
    },
    tooltip: {
        position: ['10%', '100%']
    }
};

export const chartData = ({
    data,
    ranges,
    runs,
    xAxis,
    smoothedOnly
}: {
    data: Dataset[];
    ranges: Range[];
    runs: Run[];
    xAxis: XAxis;
    smoothedOnly?: boolean;
}) =>
    data
        .map((dataset, i) => {
            // smoothed data:
            // [0] wall time
            // [1] step
            // [2] original value
            // [3] smoothed value
            // [4] relative
            const name = runs[i].label;
            const color = runs[i].colors[0];
            const colorAlt = runs[i].colors[1];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any[] = [
                {
                    name,
                    z: runs.length + i,
                    itemStyle: {
                        color
                    },
                    lineStyle: {
                        color
                    },
                    data: dataset,
                    encode: {
                        x: [xAxisMap[xAxis]],
                        y: [3]
                    }
                }
            ];
            if (!smoothedOnly) {
                const range = ranges[i];
                // const mins = dataset.filter(item => item[2] === range?.min);
                // const maxs = dataset.filter(item => item[2] === range?.max);
                const min = dataset.find(item => item[2] === range?.min);
                const max = dataset.find(item => item[2] === range?.max);
                result.push({
                    name,
                    z: i,
                    itemStyle: {
                        color: colorAlt
                    },
                    lineStyle: {
                        color: colorAlt
                    },
                    data: dataset,
                    encode: {
                        x: [xAxisMap[xAxis]],
                        y: [2]
                    },
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 6,
                        itemStyle: {
                            color: '#fff',
                            borderColor: colorAlt,
                            borderWidth: 1
                        },
                        label: {
                            show: false
                        },
                        data: [
                            ...(min ? [{coord: [min[xAxisMap[xAxis]], min[2]]}] : []),
                            ...(max ? [{coord: [max[xAxisMap[xAxis]], max[2]]}] : [])
                        ]
                        // data: [
                        //     ...mins.map(item => ({coord: [item[xAxisMap[xAxis]], item[2]]})),
                        //     ...maxs.map(item => ({coord: [item[xAxisMap[xAxis]], item[2]]}))
                        // ]
                    }
                });
            }
            return result;
        })
        .flat();

export const tooltip = (data: TooltipData[], stepLength: number, i18n: typeof I18n) => {
    return {
        columns: [
            {
                label: i18n.t('scalar:smoothed'),
                width: '5em'
            },
            {
                label: i18n.t('scalar:value'),
                width: '4.285714286em'
            },
            {
                label: i18n.t('common:time-mode.step'),
                width: `${Math.max(stepLength * 0.571428571, 2.857142857)}em`
            },
            {
                label: i18n.t('scalar:min'),
                width: '4.285714286em'
            },
            {
                label: i18n.t('scalar:max'),
                width: '4.285714286em'
            },
            {
                label: i18n.t('common:time-mode.wall'),
                width: '10.714285714em'
            },
            {
                label: i18n.t('common:time-mode.relative'),
                width: '4.285714286em'
            }
        ],
        data: data.map(({min, max, item}) => [
            valueFormatter(item[3] ?? Number.NaN),
            valueFormatter(item[2] ?? Number.NaN),
            item[1],
            valueFormatter(min ?? Number.NaN),
            valueFormatter(max ?? Number.NaN),
            formatTime(item[0], i18n.language),
            humanizeDuration(item[4])
        ])
    };
};
