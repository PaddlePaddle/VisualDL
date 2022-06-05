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

export const nearestPoint = (data: number[][][], recall: number): number[][][] => {
    return data.map(series => {
        console.log('nearestPointSeries', series);  
        // [0.3333333432674408, 1, 75, 150, 0, 0, 0.02]
        let delta = Number.POSITIVE_INFINITY;
        let nearestRecall = 0;
        for (let i = 0; i < series.length; i++) {
            const d = Math.abs(series[i][1] - recall);
            if (d < Number.EPSILON) {
                nearestRecall = series[i][1];
                break;
            }
            if (d < delta) {
                delta = d;
                nearestRecall = series[i][1];
            }
        }
        return series.filter(s => s[1] === nearestRecall);
        // 
    });
};
