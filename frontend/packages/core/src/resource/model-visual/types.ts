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

// cspell:words quantile

export type GraphRequestData = {
    head: string[],
    tail: string,
    name: string
};

export type NodeBasicData = {
    delta_num: string;
    avg: string;
    ab_avg: string;
    var: string;
    zero: string;
};

export type NodeBasicRequestData = {
    [index: string]: NodeBasicData[];
};

export type NodeDetailIndexData = {
    delta_num: string;
    neuron_num: string;
    neuron_values: string;
};

export type NodeDetailIndexRequestData = {
    data: NodeDetailIndexData[];
};

export type NodeDetailNumData = {
    bucket_xy: string;
    delta_num: string;
};

export type NodeDetailNumRequestData = {
    data: NodeDetailNumData[];
};
