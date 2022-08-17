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

import type {Dataset, InvalidValue, Range, ScalarDataset, Step, TooltipData, Value, XAxis} from './types';
import {formatTime, humanizeDuration} from '~/utils';

import type {EChartsOption,LineSeriesOption} from 'echarts';
import type I18n from 'i18next';
import type {Run} from '~/types';
import {format} from 'd3-format';
import {xAxisMap} from './index';

const valueFormatter = format('.5');

const INF_VALUE = 'inf';
const NAN_VALUE = 'nan';

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
    rawData,
    ranges,
    runs,
    xAxis,
    smoothedOnly
}: {
    data: Dataset[];
    rawData: ScalarDataset[];
    ranges: Range[];
    runs: Run[];
    xAxis: XAxis;
    smoothedOnly?: boolean;
}): EChartsOption['line'] =>
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
            const xAxisIndex = xAxisMap[xAxis];
            const singlePointIndices: number[] = [];
            dataset.forEach((d, index) => {
                if (d[2] != null) {
                    const prevV = index === 0 ? null : dataset[index - 1][2];
                    const nextV = index === dataset.length - 1 ? null : dataset[index + 1][2];
                    if (prevV == null && nextV == null) {
                        singlePointIndices.push(index);
                    }
                }
            });
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
                        x: [xAxisIndex],
                        y: [3]
                    },
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 4,
                        itemStyle: {
                            color: '#fff',
                            borderColor: color,
                            borderWidth: 1
                        },
                        label: {
                            show: false
                        },
                        data: singlePointIndices.map(index => ({
                            coord: [dataset[index][xAxisIndex], dataset[index][3]]
                        }))
                    }
                }
            ];
            if (!smoothedOnly) {
                const range = ranges[i];
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
                        x: [xAxisIndex],
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
                            ...singlePointIndices.map(index => ({
                                coord: [dataset[index][xAxisIndex], dataset[index][2]],
                                symbol: 'circle',
                                symbolSize: 4
                            })),
                            ...(min ? [{coord: [min[xAxisIndex], min[2]]}] : []),
                            ...(max ? [{coord: [max[xAxisIndex], max[2]]}] : [])
                        ]
                    }
                });

                const rawDataset = rawData[i];
                const infData: [Step, Value][] = [];
                const nanData: [Step, Value][] = [];
                // FIXME: react async update...
                if (rawDataset.length === dataset.length) {
                    let lastValidValue: Value = null;
                    rawDataset.forEach(([, x, y], j) => {
                        if (j > 0) {
                            if (dataset[j][2] != null) {
                                lastValidValue = dataset[j][2];
                            }
                        }
                        if (y === INF_VALUE) {
                            infData.push([x, lastValidValue]);
                        } else if (y === NAN_VALUE) {
                            nanData.push([x, lastValidValue]);
                        }
                    });
                }
                result.push({
                    data: infData,
                    symbolShow: false,
                    lineStyle: {
                        width: 0,
                        opacity: 0
                    },
                    markPoint: {
                        symbol: 'rect',
                        symbolSize: 6,
                        itemStyle: {
                            color: '#fff',
                            borderColor: colorAlt,
                            borderWidth: 1
                        },
                        label: {
                            show: false
                        },
                        data: infData.map(d => ({coord: d}))
                    }
                });
                result.push({
                    data: nanData,
                    symbolShow: false,
                    lineStyle: {
                        width: 0,
                        opacity: 0
                    },
                    markPoint: {
                        symbol: 'triangle',
                        symbolSize: 6,
                        itemStyle: {
                            color: '#fff',
                            borderColor: colorAlt,
                            borderWidth: 1
                        },
                        label: {
                            show: false
                        },
                        data: nanData.map(d => ({coord: d}))
                    }
                });
            }
            return result;
        })
        .flat();

export const tooltip = (data: TooltipData[], stepLength: number, i18n: typeof I18n) => {
    const getValue = (value: Value | InvalidValue): string => {
        if (value === INF_VALUE) {
            return 'Inf';
        }
        if (value === NAN_VALUE) {
            return 'NaN';
        }
        return value == null ? '--' : valueFormatter(value);
    };
    return {
        columns: [
            {
                label: i18n.t('scalar:smoothed'),
                width: '5em'
            },
            {
                label: i18n.t('common:scalar-value'),
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
        data: data.map(({min, max, item, rawItem}) => [
            item[3] == null ? '--' : valueFormatter(item[3]),
            getValue(rawItem[2]),
            item[1],
            valueFormatter(min ?? Number.NaN),
            valueFormatter(max ?? Number.NaN),
            formatTime(item[0], i18n.language),
            humanizeDuration(item[4])
        ])
    };
};
