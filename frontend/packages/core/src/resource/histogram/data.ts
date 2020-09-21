import type {HistogramData, OffsetData, OffsetDataItem, OverlayData, OverlayDataItem} from './types';

import {Modes} from './types';

function computeHistogram(
    data: {left: number; right: number; count: number}[],
    min: number,
    max: number,
    binsNum = 30
) {
    if (min === max) {
        // Create bins even if all the data has a single value.
        max = min * 1.1 + 1;
        min = min / 1.1 - 1;
    }
    const stepWidth = (max - min) / binsNum;
    const range: number[] = [];
    for (let i = min; i < max; i += stepWidth) {
        range.push(i);
    }

    let itemIndex = 0;
    return range.map(binLeft => {
        const binRight = binLeft + stepWidth;
        let yValue = 0;
        while (itemIndex < data.length) {
            const itemRight = Math.min(max, data[itemIndex].right);
            const itemLeft = Math.max(min, data[itemIndex].left);
            const overlap = Math.min(itemRight, binRight) - Math.max(itemLeft, binLeft);
            const count = (overlap / (itemRight - itemLeft)) * data[itemIndex].count;
            if (overlap > 0) {
                yValue += count;
            }
            // If `itemRight` is bigger than `binRight`, then this bin is
            // finished and there also has data for the next bin, so don't increment
            // `itemIndex`.
            if (itemRight > binRight) {
                break;
            }
            itemIndex++;
        }
        return {
            x: binLeft,
            dx: stepWidth,
            y: yValue
        };
    });
}

export function transform({data, mode}: {data: HistogramData; mode: Modes}) {
    const temp = data.map(([time, step, items]) => ({
        time,
        step,
        min: Math.min(...items.map(item => item[0])),
        max: Math.max(...items.map(item => item[1])),
        items: items.map(([left, right, count]) => ({left, right, count}))
    }));
    const min = Math.min(...temp.map(({min}) => min));
    const max = Math.max(...temp.map(({max}) => max));
    const overlay = temp.map(({time, step, items}) =>
        computeHistogram(items, min, max).map<OverlayDataItem>(({x, dx, y}) => [time, step, x + dx / 2, Math.floor(y)])
    );
    if (mode === Modes.Overlay) {
        return {
            min,
            max,
            data: overlay
        } as OverlayData;
    }
    if (mode === Modes.Offset) {
        let minStep = Infinity;
        let maxStep = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        const offset = overlay.map(items => {
            const step = items[0][1];
            step > maxStep && (maxStep = step);
            step < minStep && (minStep = step);
            return items.reduce<OffsetDataItem[]>((m, [, , x, y]) => {
                y > maxZ && (maxZ = y);
                y < minZ && (minZ = y);
                return [...m, x, step, y];
            }, []);
        });
        return {
            minX: min,
            maxX: max,
            minZ,
            maxZ,
            minStep,
            maxStep,
            data: offset
        } as OffsetData;
    }
    return undefined as never;
}
