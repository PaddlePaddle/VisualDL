import type {EChartOption, VisualMap} from 'echarts';

import type {Modes} from './types';

const baseOptions: EChartOption = {
    legend: {
        data: []
    }
};

export const options: Record<Modes, EChartOption> = {
    overlay: {
        ...baseOptions,
        axisPointer: {
            link: [
                {
                    xAxisIndex: 'all'
                }
            ],
            show: true,
            snap: true,
            triggerTooltip: true
        },
        yAxis: {
            axisLine: {
                onZero: false
            }
        }
    },
    offset: {
        ...baseOptions,
        visualMap: ({
            type: 'continuous',
            show: false,
            dimension: 1,
            inRange: {
                colorLightness: [0.5, 0.8],
                colorSaturation: [0.5, 0.8]
            }
        } as unknown) as VisualMap.Continuous[], // Fix echarts type bug
        xAxis: {
            axisLine: {
                onZero: false
            }
        },
        yAxis: {
            axisLine: {
                onZero: false
            },
            inverse: true,
            splitLine: {
                show: false
            }
        }
    }
};
