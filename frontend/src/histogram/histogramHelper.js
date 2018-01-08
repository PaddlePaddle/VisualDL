import {min, max, range} from 'lodash';

export const tansformHistogramData = hitogramData => {
    let [time, step, items] = hitogramData;
    return {
        time,
        step,
        min: min(items.map(([left, right, count]) => left)),
        max: max(items.map(([left, right, count]) => right)),
        items: items.map(([left, right, count]) => ({left, right, count}))
    };
};

export const computeTempDatas = (histogram, min, max, numbers = 30) => {
    if (max === min) {
        // Create bins even if all the data has a single value.
        max = min * 1.1 + 1;
        min = min / 1.1 - 1;
    }
    let stepWidth = (max - min) / numbers;
    let index = 0;
    return range(min, max, stepWidth).map(left => {
        let right = left + stepWidth;
        let yValue = 0;
        while (index < histogram.items.length) {
            let itemRight = Math.min(max, histogram.items[index].right);
            let itemLeft = Math.max(min, histogram.items[index].left);
            let intersect = Math.min(itemRight, right) - Math.max(itemLeft, left);
            let count = (intersect / (itemRight - itemLeft))
            * histogram.items[index].count;

            yValue += intersect > 0 ? count : 0;

            // If `bucketRight` is bigger than `binRight`, then this bin is
            // finished and there is data for the next bin, so don't increment
            // `index`.
            if (itemRight > right) {
                break;
            }
            index++;
        }
        return {x: left, dx: stepWidth, y: yValue};
    });
};

export const tansformToChartData
= (tempData, time, step) => tempData.map(({x, dx, y}) => [time, step, x + dx / 2, Math.floor(y)]);

export const originDataToChartData = originData => {
    let tempDatas = originData.map(tansformHistogramData);
    let finalMin = min(tempDatas.map(({min}) => min));
    let finalMax = max(tempDatas.map(({max}) => max));
    let chartData = tempDatas.map(item => {
        let computedTempDatas = computeTempDatas(item, finalMin, finalMax);
        let {time, step} = item;
        return {
            time,
            step,
            items: tansformToChartData(computedTempDatas, time, step)
        };
    });
    return {
        min: finalMin,
        max: finalMax,
        chartData
    };
};
