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

import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {WithStyled, borderRadius, headerHeight, math, rem, sameBorder, size, transitionProps} from '~/utils/style';

import ee from '~/utils/event';
import styled from 'styled-components';

const Div = styled.div<{maximized?: boolean; divWidth?: string; divHeight?: string}>`
    ${props =>
        size(
            props.maximized ? `calc(100vh - ${headerHeight} - ${rem(40)})` : props.divHeight || 'auto',
            props.maximized ? '100%' : props.divWidth || '100%'
        )}
    background-color: var(--background-color);
    ${sameBorder({radius: math(`${borderRadius} * 2`)})}
    ${transitionProps(['border-color', 'box-shadow', 'background-color'])}
    position: relative;

    &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.05);
    }
`;

type ChartProps = {
    cid: symbol;
    width?: string;
    height?: string;
};

const Chart: FunctionComponent<ChartProps & WithStyled> = ({cid, width, height, className, children}) => {
    const [maximized, setMaximized] = useState(false);
    const toggleMaximze = useCallback(
        (id: symbol, value: boolean) => {
            if (id === cid) {
                setMaximized(value);
            }
        },
        [cid]
    );
    useEffect(() => {
        ee.on('toggle-chart-size', toggleMaximze);
        return () => {
            ee.off('toggle-chart-size', toggleMaximze);
        };
    }, [toggleMaximze]);

    return (
        <Div
            maximized={maximized}
            divWidth={width}
            divHeight={height}
            className={`${maximized ? 'maximized' : ''} ${className ?? ''}`}
        >
            {children}
        </Div>
    );
};

export default Chart;
