import cloneDeep from 'lodash/cloneDeep';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import moment from 'moment';

// https://en.wikipedia.org/wiki/Moving_average
export const transform = (seriesData: number[][], smoothingWeight: number) => {
    const data: number[][] = cloneDeep(seriesData);
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
            last = last * smoothingWeight + (1 - smoothingWeight) * nextVal;
            numAccum++;
            let debiasWeight = 1;
            if (smoothingWeight !== 1.0) {
                debiasWeight = 1.0 - Math.pow(smoothingWeight, numAccum);
            }
            d[3] = last / debiasWeight;
        }
    });
    return data;
};

export const quantile = (
    values: number[][],
    p: number,
    valueOf: (value: number[], index: number, values: number[][]) => number
) => {
    const n = values.length;
    if (!n) {
        return NaN;
    }
    if ((p = +p) <= 0 || n < 2) {
        return valueOf(values[0], 0, values);
    }
    if (p >= 1) {
        return valueOf(values[n - 1], n - 1, values);
    }
    const i = (n - 1) * p;
    const i0 = Math.floor(i);
    const value0 = valueOf(values[i0], i0, values);
    const value1 = valueOf(values[i0 + 1], i0 + 1, values);
    return value0 + (value1 - value0) * (i - i0);
};

export const range = (seriesData: number[][], outlier = false) => {
    if (seriesData.length == 0) return;
    if (!outlier) {
        // Get the orgin data range.
        return {
            min: minBy(seriesData, items => items[2])?.[2] ?? 0,
            max: maxBy(seriesData, items => items[2])?.[2] ?? 0
        };
    } else {
        // Get the quantile range.
        const sorted = sortBy(seriesData, [item => item[2]]);
        return {
            min: quantile(sorted, 0.05, item => item[2]),
            max: quantile(seriesData, 0.95, item => item[2])
        };
    }
};

export type TooltipData = {
    run: string;
    item: number[];
};

// TODO: make it better, don't concat html
export const tooltip = (data: TooltipData[]) => {
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
    const transformedData = data.map(item => {
        const data = item.item;
        return {
            Run: item.run,
            // Keep six number for easy-read.
            Smoothed: data[indexPropMap.Smoothed].toString().slice(0, 6),
            Value: data[indexPropMap.Value].toString().slice(0, 6),
            Step: data[indexPropMap.Step],
            Time: moment(Math.floor(data[indexPropMap.Time]), 'x').format('YYYY-MM-DD HH:mm:ss'),
            // Relative display value should take easy-read into consideration.
            // Better to tranform data to 'day:hour', 'hour:minutes', 'minute: seconds' and second only.
            Relative: Math.floor(data[indexPropMap.Relative] * 60 * 60) + 's'
        };
    });

    let headerHtml = '<tr style="font-size:14px;">';
    headerHtml += Object.keys(transformedData[0])
        .map(key => {
            return `<td style="padding: 0 4px; font-weight: bold; width: ${
                widthPropMap[key as keyof typeof transformedData[0]]
            }px;">${key}</td>`;
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
