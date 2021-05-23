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

import React, {FunctionComponent, useState} from 'react';
import {useGraph, useIndicatorOrder} from '~/resource/hyper-parameter';

import ColorMap from '~/components/HyperParameterPage/ColorMap';
import ParallelCoordinatesGraph from './ParallelCoordinatesGraph';
import SessionTable from '~/components/HyperParameterPage/SessionTable';
import View from '~/components/HyperParameterPage/View';
import type {ViewData} from '~/resource/hyper-parameter';
import {rem} from '~/utils/style';
import styled from 'styled-components';

const ParallelCoordinatesContainer = styled.div`
    width: 100%;
    display: flex;
    font-size: ${rem(12)};
    align-items: stretch;
    justify-content: space-between;

    > .graph {
        flex: auto;
    }

    > .color-map {
        flex: none;
    }
`;

const COLUMN_ORDER_STORAGE_KEY = 'hyper-parameter-parallel-coordinates-view-column-order';

type ParallelCoordinatesViewProps = ViewData;

const ParallelCoordinatesView: FunctionComponent<ParallelCoordinatesViewProps> = ({indicators, list, data}) => {
    const {selectedIndicators, sessionData, onHover, onSelect, showMetricsGraph} = useGraph(indicators, list);

    const [colors, setColors] = useState<string[]>([]);

    const [order, setOrder] = useIndicatorOrder(COLUMN_ORDER_STORAGE_KEY, indicators);

    return (
        <>
            <View>
                <ParallelCoordinatesContainer>
                    <ParallelCoordinatesGraph
                        className="graph"
                        indicators={selectedIndicators}
                        list={list}
                        data={data}
                        colors={colors}
                        order={order}
                        onHover={onHover}
                        onSelect={onSelect}
                        onChangeOrder={setOrder}
                    />
                    <ColorMap className="color-map" indicators={indicators} data={data} onChange={setColors} />
                </ParallelCoordinatesContainer>
            </View>
            <SessionTable indicators={indicators} data={sessionData} showMetricsGraph={showMetricsGraph} />
        </>
    );
};

export default ParallelCoordinatesView;
