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

import React, {FunctionComponent} from 'react';
import {useColorMap, useGraph} from '~/resource/hyper-parameter';

import ScatterPlotMatrix from './ScatterPlotMatrix';
import SessionTable from '~/components/HyperParameterPage/SessionTable';
import View from '~/components/HyperParameterPage/View';
import type {ViewData} from '~/resource/hyper-parameter';

type ScatterPlotMatrixViewProps = ViewData;

const ScatterPlotMatrixView: FunctionComponent<ScatterPlotMatrixViewProps> = ({indicators, list, data}) => {
    const {colorByList, colorByExtent, colorBy, setColorBy, colors} = useColorMap(indicators, data);
    const {selectedIndicators, sessionData, onHover, onSelect, showMetricsGraph} = useGraph(indicators, list);

    return (
        <>
            <View>
                <ScatterPlotMatrix
                    indicators={selectedIndicators}
                    data={data}
                    list={list}
                    colors={colors}
                    onHover={onHover}
                    onSelect={onSelect}
                />
            </View>
            <SessionTable indicators={indicators} data={sessionData} showMetricsGraph={showMetricsGraph} />
        </>
    );
};

export default ScatterPlotMatrixView;
