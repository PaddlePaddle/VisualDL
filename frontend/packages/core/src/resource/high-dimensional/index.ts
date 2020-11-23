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

import type {Point} from './types';

export type {Dimension, Reduction, Point} from './types';

const dividePoints = (points: Point[], keyword?: string) => {
    if (!keyword) {
        return [[], points];
    }

    const matched: Point[] = [];
    const missing: Point[] = [];
    points.forEach(point => {
        if (point.name.includes(keyword)) {
            matched.push(point);
            return;
        }
        missing.push(point);
    });

    return [matched, missing];
};

const combineLabel = (points: Point['value'][], labels: string[], visibility?: boolean) =>
    points.map((value, i) => {
        const name = labels[i] || '';
        return {
            name,
            showing: !!visibility,
            value
        };
    });

export const divide = ({
    points,
    keyword,
    labels,
    visibility
}: {
    points: Point['value'][];
    keyword?: string;
    labels: string[];
    visibility?: boolean;
}) => dividePoints(combineLabel(points, labels, visibility), keyword);
