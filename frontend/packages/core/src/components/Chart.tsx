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
