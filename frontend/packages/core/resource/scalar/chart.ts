import {Dataset, XAxis} from './types';

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

export const tooltip = (data: Dataset, stepLength: number, i18n: I18n) => {
    return {
        columns: [
            {
                label: i18n.t('scalar:smoothed'),
                width: '5em'
            },
            {
                label: i18n.t('scalar:value'),
                width: '4.285714286em'
            },
            {
                label: i18n.t('common:time-mode.step'),
                width: `${Math.max(stepLength * 0.571428571, 2.857142857)}em`
            },
            {
                label: i18n.t('common:time-mode.wall'),
                width: '10.714285714em'
            },
            {
                label: i18n.t('common:time-mode.relative'),
                width: '4.285714286em'
            }
        ],
        data: data.map(([time, step, value, smoothed, relative]) => [
            valueFormatter(smoothed ?? Number.NaN),
            valueFormatter(value ?? Number.NaN),
            step,
            formatTime(time, i18n.language),
            Math.floor(relative * 60 * 60) + 's'
        ])
    };
};
