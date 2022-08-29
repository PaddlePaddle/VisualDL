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

import type {EChartsOption,LineSeriesOption} from 'echarts';
import type {MetricData} from './types';
import type {Run} from '~/types';

export function calculateRelativeTime(data: MetricData[]) {
    let startTime = 0;
    return data.map((row, index) => {
        const time = Math.floor(row[0]);
        if (index === 0) {
            startTime = time;
        }
        const relative = time - startTime;
        return [time, row[1], row[2], relative];
    });
}

export function chartData(data: number[][], run: Run): EChartsOption['line'] {
    const name = run.label;
    const color = run.colors[0];
    return [
        {
            name,
            itemStyle: {
                color
            },
            lineStyle: {
                color
            },
            data,
            encode: {
                x: [1],
                y: [2]
            }
        }
    ];
}
