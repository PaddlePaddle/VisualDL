/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {EChartsOption,VisualMapComponentOption} from 'echarts';

import type {Modes} from './types';

const baseOptions: EChartsOption = {
    legend: {
        data: []
    }
};

export const options: Record<Modes, EChartsOption> = {
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
        visualMap: {
            type: 'continuous',
            show: false,
            dimension: 1,
            inRange: {
                colorLightness: [0.5, 0.8],
                colorSaturation: [0.5, 0.8]
            }
        } as unknown as VisualMapComponentOption, // Fix echarts type bug
        //['Continuous'][]
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
