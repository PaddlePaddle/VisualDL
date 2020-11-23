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

export interface TagsData {
    runs: string[];
    tags: string[][];
}

export interface Run {
    label: string;
    colors: [string, string];
}

export interface Tag<R extends Run = Run> {
    runs: R[];
    label: string;
}

export interface TagWithSingleRun {
    label: string;
    run: Run;
}

export enum TimeMode {
    Step = 'step',
    Relative = 'relative',
    WallTime = 'wall'
}
