import {Dataset, TooltipData, XAxis} from './types';

import {I18n} from '@visualdl/i18n';
import {Run} from '~/types';
import {format} from 'd3-format';
import {formatTime} from '~/utils';
import {xAxisMap} from './index';

const valueFormatter = format('.5');

export const options = {
    legend: {
        data: []
    },
    tooltip: {
        position: ['10%', '100%']
    }
};

export const chartData = ({data, runs, xAxis}: {data: Dataset[]; runs: Run[]; xAxis: XAxis}) =>
    data
        .map((dataset, i) => {
            // smoothed data:
            // [0] wall time
            // [1] step
            // [2] orginal value
            // [3] smoothed value
            // [4] relative
            const name = runs[i].label;
            const color = runs[i].colors[0];
            const colorAlt = runs[i].colors[1];
            return [
                {
                    name,
                    z: i,
                    itemStyle: {
                        color: colorAlt
                    },
                    lineStyle: {
                        color: colorAlt
                    },
                    data: dataset,
                    encode: {
                        x: [xAxisMap[xAxis]],
                        y: [2]
                    }
                },
                {
                    name,
                    z: runs.length + i,
                    itemStyle: {
                        color
                    },
                    lineStyle: {
                        color
                    },
                    data: dataset,
                    encode: {
                        x: [xAxisMap[xAxis]],
                        y: [3]
                    }
                }
            ];
        })
        .flat();

// TODO: make it better, don't concat html
export const tooltip = (data: TooltipData[], i18n: I18n) => {
    const indexPropMap = {
        time: 0,
        step: 1,
        value: 2,
        smoothed: 3,
        relative: 4
    } as const;
    const widthPropMap = {
        run: [60, 180] as [number, number],
        time: 150,
        step: 40,
        value: 60,
        smoothed: 70,
        relative: 60
    } as const;
    const translatePropMap = {
        run: 'common:runs',
        time: 'scalars:x-axis-value.wall',
        step: 'scalars:x-axis-value.step',
        value: 'scalars:value',
        smoothed: 'scalars:smoothed',
        relative: 'scalars:x-axis-value.relative'
    } as const;
    const transformedData = data.map(item => {
        const data = item.item;
        return {
            run: item.run,
            smoothed: valueFormatter(data[indexPropMap.smoothed] ?? Number.NaN),
            value: valueFormatter(data[indexPropMap.value] ?? Number.NaN),
            step: data[indexPropMap.step],
            time: formatTime(data[indexPropMap.time], i18n.language),
            // Relative display value should take easy-read into consideration.
            // Better to tranform data to 'day:hour', 'hour:minutes', 'minute: seconds' and second only.
            relative: Math.floor(data[indexPropMap.relative] * 60 * 60) + 's'
        } as const;
    });

    const renderContent = (content: string, width: number | [number, number]) =>
        `<div style="overflow: hidden; ${
            Array.isArray(width)
                ? `min-width:${(width as [number, number])[0]};max-width:${(width as [number, number])[1]};`
                : `width:${width as number}px;`
        }">${content}</div>`;

    let headerHtml = '<tr style="font-size:14px;">';
    headerHtml += (Object.keys(transformedData[0]) as (keyof typeof transformedData[0])[])
        .map(key => {
            return `<th style="padding: 0 4px; font-weight: bold;" class="${key}">${renderContent(
                i18n.t(translatePropMap[key]),
                widthPropMap[key]
            )}</th>`;
        })
        .join('');
    headerHtml += '</tr>';

    const content = transformedData
        .map(item => {
            let str = '<tr style="font-size:12px;">';
            str += Object.keys(item)
                .map(key => {
                    let content = '';
                    if (key === 'run') {
                        content += `<span class="run-indicator" style="background-color:${
                            item[key].colors?.[0] ?? 'transpanent'
                        }"></span>`;
                        content += `<span title="${item[key].label}">${item[key].label}</span>`;
                    } else {
                        content += item[key as keyof typeof item];
                    }
                    return `<td style="padding: 0 4px;" class="${key}">${renderContent(
                        content,
                        widthPropMap[key as keyof typeof item]
                    )}</td>`;
                })
                .join('');
            str += '</tr>';
            return str;
        })
        .join('');

    return `<table style="text-align: left;table-layout: fixed;"><thead>${headerHtml}</thead><tbody>${content}</tbody><table>`;
};
