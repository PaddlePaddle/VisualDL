import cloneDeep from 'lodash/cloneDeep';

// https://en.wikipedia.org/wiki/Moving_average
export default (seriesData: number[][], smoothingWeight: number) => {
    let data: number[][] = cloneDeep(seriesData);
    let last = data.length > 0 ? 0 : Number.NaN;
    let numAccum = 0;
    let startValue = 0;
    data.forEach((d, i) => {
        let nextVal = d[2];
        // second to millisecond.
        let millisecond = Math.floor(d[0] * 1000);
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
