import moment from 'moment';

export const formatTime = (value: number, language: string, formatter = 'L LTS') =>
    moment(Math.floor(value), 'x')
        .locale(language)
        .format(formatter);

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
