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
