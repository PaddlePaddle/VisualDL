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

import type {ListItem, ViewData} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';

import SessionTable from '~/components/HyperParameterPage/SessionTable';
import View from '~/components/HyperParameterPage/View';

type ScatterPlotMatrixViewProps = ViewData;

const ScatterPlotMatrixView: FunctionComponent<ScatterPlotMatrixViewProps> = ({indicators, list, data}) => {
    const colorByList = useMemo(() => indicators.filter(i => i.type === 'continuous').map(i => i.name), [indicators]);
    const [colorBy, setColorBy] = useState(colorByList[0] ?? null);

    const colorByIndicator = useMemo(() => indicators.find(i => i.name === colorBy), [colorBy, indicators]);

    const colorByExtent = useMemo(
        () =>
            colorByIndicator
                ? d3.extent(data.map(row => +row[colorByIndicator.group][colorByIndicator.name]))
                : (['', ''] as const),
        [colorByIndicator, data]
    );

    const [sessionData, setSessionData] = useState<ListItem | null>(null);
    const [showMetricsGraph, setShowMetricsGraph] = useState(false);

    const onHover = useCallback(
        (index: number | null) => {
            if (!showMetricsGraph) {
                setSessionData(index == null ? null : list[index]);
            }
        },
        [list, showMetricsGraph]
    );

    const onSelect = useCallback(
        (index: number | null) => {
            setSessionData(index == null ? null : list[index]);
            setShowMetricsGraph(index != null);
        },
        [list]
    );

    [setColorBy, colorByExtent, onHover, onSelect];

    return (
        <>
            <View></View>
            <SessionTable indicators={indicators} data={sessionData} showMetricsGraph={showMetricsGraph} />
        </>
    );
};

export default ScatterPlotMatrixView;
