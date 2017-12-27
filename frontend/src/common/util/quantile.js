import number from './number';
export default function (values, p, valueof) {
    if (valueof == null) {
        return valueof = number;
    }
    let n = values.length;
    if (!(n)) {
        return;
    }
    if ((p = +p) <= 0 || n < 2) {
        return +valueof(values[0], 0, values);
    }
    if (p >= 1) {
        return +valueof(values[n - 1], n - 1, values);
    }
    let i = (n - 1) * p;
    let i0 = Math.floor(i);
    let value0 = +valueof(values[i0], i0, values);
    let value1 = +valueof(values[i0 + 1], i0 + 1, values);
    return value0 + (value1 - value0) * (i - i0);
}
