import {Run as BaseRun, Tag as BaseTag, TimeMode} from '~/types';

export {TimeMode as TimeType};

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
