import {min, max, range} from 'lodash';

export const tansformBackendData = histogramData => {
    let [time, step, items] = histogramData;
    return {
        time,
        step,
        min: min(items.map(([left, right, count]) => left)),
        max: max(items.map(([left, right, count]) => right)),
        items: items.map(([left, right, count]) => ({left, right, count}))
    };
};

export const computeNewHistogram = (histogram, min, max, binsNum = 30) => {
    if (max === min) {
        // Create bins even if all the data has a single value.
        max = min * 1.1 + 1;
        min = min / 1.1 - 1;
    }
    let stepWidth = (max - min) / binsNum;
    let itemIndex = 0;
    return range(min, max, stepWidth).map(binLeft => {
        let binRight = binLeft + stepWidth;
        let yValue = 0;
        while (itemIndex < histogram.items.length) {
            let itemRight = Math.min(max, histogram.items[itemIndex].right);
            let itemLeft = Math.max(min, histogram.items[itemIndex].left);
            let overlap = Math.min(itemRight, binRight) - Math.max(itemLeft, binLeft);
            let count = (overlap / (itemRight - itemLeft)) * histogram.items[itemIndex].count;
            yValue += overlap > 0 ? count : 0;
            // If `itemRight` is bigger than `binRight`, then this bin is
            // finished and there also has data for the next bin, so don't increment
            // `itemIndex`.
            if (itemRight > binRight) {
                break;
            }
            itemIndex++;
        }
        return {x: binLeft, dx: stepWidth, y: yValue};
    });
};

export const tansformToVisData
= (tempData, time, step) => tempData.map(({x, dx, y}) => [time, step, x + dx / 2, Math.floor(y)]);

export const originDataToChartData = originData => {
    let tempDatas = originData.map(tansformBackendData);
    let globalMin = min(tempDatas.map(({min}) => min));
    let globalMax = max(tempDatas.map(({max}) => max));
    let chartData = tempDatas.map(item => {
        let histoBins = computeNewHistogram(item, globalMin, globalMax);
        let {time, step} = item;
        return {
            time,
            step,
            items: tansformToVisData(histoBins, time, step)
        };
    });
    return {
        min: globalMin,
        max: globalMax,
        chartData
    };
};
