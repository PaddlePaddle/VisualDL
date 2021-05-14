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

import * as d3 from 'd3';

import type {DataListItem, Indicator} from '../types';
import {useMemo, useState} from 'react';

import {getColorScale} from '../format';

export default function useColorMap(indicators: Indicator[], data: DataListItem[]) {
    const colorByList = useMemo(() => indicators.filter(i => i.type === 'continuous').map(i => i.name), [indicators]);
    const [colorBy, setColorBy] = useState(colorByList[0] ?? null);

    const colorByIndicator = useMemo(() => indicators.find(i => i.name === colorBy), [colorBy, indicators]);

    const colorByExtent = useMemo(
        () =>
            colorByIndicator
                ? d3.extent(data.map(row => +row[colorByIndicator.group][colorByIndicator.name]))
                : ([0, 0] as [number, number]),
        [colorByIndicator, data]
    );

    const colors = useMemo(() => {
        const scale = getColorScale(colorByIndicator ?? null, data);
        return data.map((row, i) =>
            scale(colorByIndicator ? (row[colorByIndicator.group][colorByIndicator.name] as number) : i)
        );
    }, [colorByIndicator, data]);

    return {
        colorByList,
        colorByExtent,
        colorBy,
        setColorBy,
        colors
    };
}
