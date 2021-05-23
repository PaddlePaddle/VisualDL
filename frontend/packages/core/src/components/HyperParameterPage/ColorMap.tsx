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

import {COLOR_MAP, getColorScale} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';

import Select from '~/components/HyperParameterPage/BorderLessSelect';
import type {ViewData} from '~/resource/hyper-parameter';
import type {WithStyled} from '~/utils/style';
import {rem} from '~/utils/style';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: ${rem(88)};
    margin-left: ${rem(20)};
    display: flex;
    flex-direction: column;

    .color-by {
        flex: none;
        margin-bottom: 1em;
    }

    .color-indicator {
        flex: auto;
        display: flex;
        color: var(--text-light-color);

        .indicator-image {
            flex: none;
            width: 1em;
            background-image: linear-gradient(0deg, ${COLOR_MAP[0]} 0%, ${COLOR_MAP[1]} 50%, ${COLOR_MAP[2]} 100%);
            margin: 0.5em 0;
        }

        .indicator-text {
            flex: auto;
            display: flex;
            flex-direction: column-reverse;
            justify-content: space-between;
            margin-left: 0.5em;
        }
    }
`;

type ColorMapProps = Pick<ViewData, 'indicators' | 'data'> & {
    onChange: (colors: string[]) => unknown;
};

const ColorMap: FunctionComponent<ColorMapProps & WithStyled> = ({indicators, data, onChange}) => {
    const colorByList = useMemo(() => indicators.filter(i => i.type === 'continuous').map(i => i.name), [indicators]);
    const [colorBy, setColorBy] = useState(colorByList[0] ?? null);

    const colorByIndicator = useMemo(() => indicators.find(i => i.name === colorBy), [colorBy, indicators]);

    const colorByExtent = useMemo<[number, number]>(
        () =>
            colorByIndicator
                ? (d3
                      .extent(data.map(row => +row[colorByIndicator.group][colorByIndicator.name]))
                      .map((v: number | undefined) => Math.round((v ?? 0) * 1000) / 1000) as [number, number])
                : [0, 0],
        [colorByIndicator, data]
    );

    useEffect(() => {
        const scale = getColorScale(colorByIndicator ?? null, data);
        const colors = data.map((row, i) =>
            scale(colorByIndicator ? (row[colorByIndicator.group][colorByIndicator.name] as number) : i)
        );
        onChange?.(colors);
    }, [colorByIndicator, data, onChange]);

    return (
        <Wrapper className="color-map">
            <div className="color-by">
                <Select list={colorByList} value={colorBy} onChange={setColorBy} />
            </div>
            <div className="color-indicator">
                <div className="indicator-image"></div>
                <div className="indicator-text">
                    {colorByExtent.map((c: string | number | undefined, i: number) => (
                        <span key={i}>{c ?? ''}</span>
                    ))}
                </div>
            </div>
        </Wrapper>
    );
};

export default ColorMap;
