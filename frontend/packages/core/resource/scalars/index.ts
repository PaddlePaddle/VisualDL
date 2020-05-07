import * as chart from '~/utils/chart';

import {ChartDataParams, Dataset, RangeParams, TooltipData, TransformParams} from './types';
import {formatTime, quantile} from '~/utils';

import BigNumber from 'bignumber.js';
import {I18n} from '@visualdl/i18n';
import {Run} from '~/types';
import cloneDeep from 'lodash/cloneDeep';
import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import sortBy from 'lodash/sortBy';

BigNumber.config({EXPONENTIAL_AT: [-6, 7]});

export * from './types';

export const xAxisMap = {
    step: 1,
    relative: 4,
    wall: 0
};

export const sortingMethodMap = {
    default: null,
    descending: (points: TooltipData[]) => sortBy(points, point => point.item[3]).reverse(),
    ascending: (points: TooltipData[]) => sortBy(points, point => point.item[3]),
    // Compare other ponts width the trigger point, caculate the nearest sort.
    nearest: (points: TooltipData[], data: number[]) => sortBy(points, point => point.item[3] - data[2])
};

export const transform = ({datasets, smoothing}: TransformParams) =>
    // https://en.wikipedia.org/wiki/Moving_average
    datasets.map(seriesData => {
        const data = cloneDeep(seriesData);
        let last = new BigNumber(data.length > 0 ? 0 : Number.NaN);
        let numAccum = 0;
        let startValue = 0;
        const bigSmoothing = new BigNumber(smoothing);
        data.forEach((d, i) => {
            const nextVal = new BigNumber(d[2]);
            // second to millisecond.
            const millisecond = (d[0] = Math.floor(d[0] * 1000));
            if (i === 0) {
                startValue = millisecond;
            }
            // relative time, millisecond to hours.
            d[4] = Math.floor(millisecond - startValue) / (60 * 60 * 1000);
            if (!nextVal.isFinite()) {
                d[3] = nextVal.toNumber();
            } else {
                // last = last * smoothing + (1 - smoothing) * nextVal;
                last = last.multipliedBy(bigSmoothing).plus(bigSmoothing.minus(1).negated().multipliedBy(nextVal));
                numAccum++;
                let debiasWeight = new BigNumber(1);
                if (!bigSmoothing.isEqualTo(1)) {
                    //debiasWeight = 1.0 - Math.pow(smoothing, numAccum);
                    debiasWeight = bigSmoothing.exponentiatedBy(numAccum).minus(1).negated();
                }
                // d[3] = last / debiasWeight;
                d[3] = last.dividedBy(debiasWeight).toNumber();
            }
        });
        return data;
    });

export const chartData = ({data, runs, smooth, xAxis}: ChartDataParams) =>
    data
        .map((dataset, i) => {
            // smoothed data:
            // [0] wall time
            // [1] step
            // [2] orginal value
            // [3] smoothed value
            // [4] relative
            const name = runs[i].label;
            const color = runs[i].colors[0];
            const colorAlt = runs[i].colors[1];
            return [
                {
                    name,
                    z: i,
                    lineStyle: {
                        color: colorAlt,
                        width: chart.series.lineStyle.width
                    },
                    data: dataset,
                    encode: {
                        x: [xAxisMap[xAxis]],
                        y: [2]
                    },
                    smooth
                },
                {
                    name,
                    z: runs.length + i,
                    itemStyle: {
                        color
                    },
                    data: dataset,
                    encode: {
                        x: [xAxisMap[xAxis]],
                        y: [3]
                    },
                    smooth
                }
            ];
        })
        .flat();

export const singlePointRange = (value: number) => ({
    min: value ? Math.min(value * 2, 0) : -0.5,
    max: value ? Math.max(value * 2, 0) : 0.5
});

export const range = ({datasets, outlier}: RangeParams) => {
    const ranges = compact(
        datasets?.map(dataset => {
            if (dataset.length == 0) return;
            const values = dataset.map(v => v[2]);
            if (!outlier) {
                // Get the orgin data range.
                return {
                    min: Math.min(...values) ?? 0,
                    max: Math.max(...values) ?? 0
                };
            } else {
                // Get the quantile range.
                const sorted = dataset.map(v => v[2]).sort();
                return {
                    min: quantile(sorted, 0.05),
                    max: quantile(values, 0.95)
                };
            }
        })
    );

    const min = minBy(ranges, range => range.min)?.min ?? 0;
    const max = maxBy(ranges, range => range.max)?.max ?? 0;

    if (!(min === 0 && max === 0)) {
        return {
            min: min > 0 ? min * 0.9 : min * 1.1,
            max: max > 0 ? max * 1.1 : max * 0.9
        };
    }
};

export const nearestPoint = (data: Dataset[], runs: Run[], step: number) =>
    data.map((series, index) => {
        let nearestItem;
        if (step === 0) {
            nearestItem = series[0];
        } else {
            for (let i = 0; i < series.length; i++) {
                const item = series[i];
                if (item[1] === step) {
                    nearestItem = item;
                    break;
                }
                if (item[1] > step) {
                    nearestItem = series[i - 1 >= 0 ? i - 1 : 0];
                    break;
                }
                if (!nearestItem) {
                    nearestItem = series[series.length - 1];
                }
            }
        }
        return {
            run: runs[index],
            item: nearestItem || []
        };
    });

// TODO: make it better, don't concat html
export const tooltip = (data: TooltipData[], i18n: I18n) => {
    const indexPropMap = {
        time: 0,
        step: 1,
        value: 2,
        smoothed: 3,
        relative: 4
    } as const;
    const widthPropMap = {
        run: [60, 180] as [number, number],
        time: 150,
        step: 40,
        value: 60,
        smoothed: 70,
        relative: 60
    } as const;
    const translatePropMap = {
        run: 'common:runs',
        time: 'scalars:x-axis-value.wall',
        step: 'scalars:x-axis-value.step',
        value: 'scalars:value',
        smoothed: 'scalars:smoothed',
        relative: 'scalars:x-axis-value.relative'
    } as const;
    const transformedData = data.map(item => {
        const data = item.item;
        return {
            run: item.run,
            // use precision then toString to remove trailling 0
            smoothed: new BigNumber(data[indexPropMap.smoothed] ?? Number.NaN).precision(5).toString(),
            value: new BigNumber(data[indexPropMap.smoothed] ?? Number.NaN).precision(5).toString(),
            step: data[indexPropMap.step],
            time: formatTime(data[indexPropMap.time], i18n.language),
            // Relative display value should take easy-read into consideration.
            // Better to tranform data to 'day:hour', 'hour:minutes', 'minute: seconds' and second only.
            relative: Math.floor(data[indexPropMap.relative] * 60 * 60) + 's'
        } as const;
    });

    const renderContent = (content: string, width: number | [number, number]) =>
        `<div style="overflow: hidden; ${
            Array.isArray(width)
                ? `min-width:${(width as [number, number])[0]};max-width:${(width as [number, number])[1]};`
                : `width:${width as number}px;`
        }">${content}</div>`;

    let headerHtml = '<tr style="font-size:14px;">';
    headerHtml += (Object.keys(transformedData[0]) as (keyof typeof transformedData[0])[])
        .map(key => {
            return `<th style="padding: 0 4px; font-weight: bold;" class="${key}">${renderContent(
                i18n.t(translatePropMap[key]),
                widthPropMap[key]
            )}</th>`;
        })
        .join('');
    headerHtml += '</tr>';

    const content = transformedData
        .map(item => {
            let str = '<tr style="font-size:12px;">';
            str += Object.keys(item)
                .map(key => {
                    let content = '';
                    if (key === 'run') {
                        content += `<span class="run-indicator" style="background-color:${
                            item[key].colors?.[0] ?? 'transpanent'
                        }"></span>`;
                        content += `<span title="${item[key].label}">${item[key].label}</span>`;
                    } else {
                        content += item[key as keyof typeof item];
                    }
                    return `<td style="padding: 0 4px;" class="${key}">${renderContent(
                        content,
                        widthPropMap[key as keyof typeof item]
                    )}</td>`;
                })
                .join('');
            str += '</tr>';
            return str;
        })
        .join('');

    return `<table style="text-align: left;table-layout: fixed;"><thead>${headerHtml}</thead><tbody>${content}</tbody><table>`;
};
