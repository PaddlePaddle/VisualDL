import cloneDeep from 'lodash/cloneDeep';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import compact from 'lodash/compact';
import {formatTime, quantile} from '~/utils';
import * as chart from '~/utils/chart';
import {I18n} from '~/utils/i18next/types';
import {xAxisMap, TooltipData, TransformParams, ChartDataParams, RangeParams} from './types';

export * from './types';

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
        let last = data.length > 0 ? 0 : Number.NaN;
        let numAccum = 0;
        let startValue = 0;
        data.forEach((d, i) => {
            const nextVal = d[2];
            // second to millisecond.
            const millisecond = (d[0] = Math.floor(d[0] * 1000));
            if (i === 0) {
                startValue = millisecond;
            }
            // Relative time, millisecond to hours.
            d[4] = Math.floor(millisecond - startValue) / (60 * 60 * 1000);
            if (!isFinite(nextVal)) {
                d[3] = nextVal;
            } else {
                last = last * smoothing + (1 - smoothing) * nextVal;
                numAccum++;
                let debiasWeight = 1;
                if (smoothing !== 1.0) {
                    debiasWeight = 1.0 - Math.pow(smoothing, numAccum);
                }
                d[3] = last / debiasWeight;
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
            const name = runs[i];
            const color = chart.color[i % chart.color.length];
            const colorAlt = chart.colorAlt[i % chart.colorAlt.length];
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

export const range = ({datasets, outlier}: RangeParams) => {
    const ranges = compact(
        datasets?.map(dataset => {
            if (dataset.length == 0) return;
            if (!outlier) {
                // Get the orgin data range.
                return {
                    min: minBy(dataset, items => items[2])?.[2] ?? 0,
                    max: maxBy(dataset, items => items[2])?.[2] ?? 0
                };
            } else {
                // Get the quantile range.
                const sorted = sortBy(dataset, [item => item[2]]);
                return {
                    min: quantile(sorted, 0.05, item => item[2]),
                    max: quantile(dataset, 0.95, item => item[2])
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

// TODO: make it better, don't concat html
export const tooltip = (data: TooltipData[], i18n: I18n) => {
    const indexPropMap = {
        Time: 0,
        Step: 1,
        Value: 2,
        Smoothed: 3,
        Relative: 4
    };
    const widthPropMap = {
        Run: 60,
        Time: 120,
        Step: 40,
        Value: 50,
        Smoothed: 60,
        Relative: 60
    };
    const translatePropMap = {
        Run: 'common:runs',
        Time: 'scalars:x-axis-value.wall',
        Step: 'scalars:x-axis-value.step',
        Value: 'scalars:value',
        Smoothed: 'scalars:smoothed',
        Relative: 'scalars:x-axis-value.relative'
    };
    const transformedData = data.map(item => {
        const data = item.item;
        return {
            Run: item.run,
            // Keep six number for easy-read.
            Smoothed: data[indexPropMap.Smoothed]?.toString().slice(0, 6),
            Value: data[indexPropMap.Value]?.toString().slice(0, 6),
            Step: data[indexPropMap.Step],
            Time: formatTime(data[indexPropMap.Time], i18n.language),
            // Relative display value should take easy-read into consideration.
            // Better to tranform data to 'day:hour', 'hour:minutes', 'minute: seconds' and second only.
            Relative: Math.floor(data[indexPropMap.Relative] * 60 * 60) + 's'
        };
    });

    let headerHtml = '<tr style="font-size:14px;">';
    headerHtml += (Object.keys(transformedData[0]) as (keyof typeof transformedData[0])[])
        .map(key => {
            return `<td style="padding: 0 4px; font-weight: bold; width: ${widthPropMap[key]}px;">${i18n.t(
                translatePropMap[key]
            )}</td>`;
        })
        .join('');
    headerHtml += '</tr>';

    const content = transformedData
        .map(item => {
            let str = '<tr style="font-size:12px;">';
            str += Object.keys(item)
                .map(val => {
                    return `<td style="padding: 0 4px; overflow: hidden;">${item[val as keyof typeof item]}</td>`;
                })
                .join('');
            str += '</tr>';
            return str;
        })
        .join('');

    // eslint-disable-next-line
    return `<table style="text-align: left;table-layout: fixed;width: 500px;"><thead>${headerHtml}</thead><tbody>${content}</tbody><table>`;
};
