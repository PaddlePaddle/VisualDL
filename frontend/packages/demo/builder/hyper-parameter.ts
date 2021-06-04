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

import type {Worker} from './types';

interface Indicator {
    name: string;
    type: string;
}

interface IndicatorData {
    hparams: Indicator[];
    metrics: Indicator[];
}

interface ListItem {
    name: string;
    hparams: Record<string, string | number>;
    metrics: Record<string, string | number>;
}

const DataTypes = ['csv', 'tsv'];

const worker: Worker = async io => {
    const q = [io.save<IndicatorData>('/hparams/indicators'), io.save<ListItem[]>('/hparams/list')] as const;
    const [{metrics}, list] = await Promise.all(q);
    for (const row of list) {
        for (const metric of metrics) {
            await io.save('/hparams/metric', {run: row.name, metric: metric.name});
        }
    }

    await Promise.all(DataTypes.map(type => io.saveBinary('/hparams/data', {type})));
};

export default worker;
