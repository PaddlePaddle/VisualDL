import BigNumber from 'bignumber.js';
import {Dataset} from './types';
import {Run} from '~/types';
import cloneDeep from 'lodash/cloneDeep';
import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import {quantile} from '~/utils';

export const transform = ({datasets, smoothing}: {datasets: Dataset[]; smoothing: number}) =>
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

export const singlePointRange = (value: number) => ({
    min: value ? Math.min(value * 2, 0) : -0.5,
    max: value ? Math.max(value * 2, 0) : 0.5
});

export const range = ({datasets, outlier}: {datasets: Dataset[]; outlier: boolean}) => {
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
