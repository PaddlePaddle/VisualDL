export enum Modes {
    Offset = 'offset',
    Overlay = 'overlay'
}

type Time = number;
type Step = number;
type Left = number;
type Right = number;
type Count = number;
type Item = [Left, Right, Count];

export type HistogramDataItem = [Time, Step, Item[]];
export type HistogramData = HistogramDataItem[];

export type OverlayDataItem = [Time, Step, number, number];
export type OverlayData = {
    min: number;
    max: number;
    data: OverlayDataItem[][];
};

export type OffsetDataItem = number;
export type OffsetData = {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    minStep: number;
    maxStep: number;
    data: OffsetDataItem[][];
};
