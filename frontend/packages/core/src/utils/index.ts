import BigNumber from 'bignumber.js';
import moment from 'moment';

export const formatTime = (value: number, language: string, formatter = 'L LTS') =>
    moment(Math.floor(value), 'x').locale(language).format(formatter);

export const quantile = (values: number[], p: number) => {
    const n = values.length;
    if (!n) {
        return NaN;
    }
    if ((p = +p) <= 0 || n < 2) {
        return values[0];
    }
    if (p >= 1) {
        return values[n - 1];
    }
    const i = new BigNumber(p).multipliedBy(n - 1);
    const i0 = i.integerValue().toNumber();
    const value0 = new BigNumber(values[i0]);
    const value1 = new BigNumber(values[i0 + 1]);
    return value0.plus(value1.minus(value0).multipliedBy(i.minus(i0))).toNumber();
};

export const distance = (p1: [number, number], p2: [number, number]): number =>
    Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
