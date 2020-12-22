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

import {Run as BaseRun, Tag as BaseTag, TimeMode} from '~/types';

export {TimeMode as TimeType};

export type CurveType = 'pr' | 'roc';

type Step = number;
type WallTime = number;
type Relative = number;
type Precision = number;
type Recall = number;
type TruePositives = number;
type FalsePositives = number;
type TrueNegatives = number;
type FalseNegatives = number;
type Thresholds = number;

export type PRCurveDataItem = [
    WallTime,
    Step,
    Precision[],
    Recall[],
    TruePositives[],
    FalsePositives[],
    TrueNegatives[],
    FalseNegatives[],
    Thresholds[]
];
export type PRCurveData = PRCurveDataItem[];

export interface Run extends BaseRun {
    index: number;
    steps: Step[];
    wallTimes: WallTime[];
    relatives: Relative[];
}

export type Tag = BaseTag<Run>;

export type StepInfo = [WallTime, Step][];
