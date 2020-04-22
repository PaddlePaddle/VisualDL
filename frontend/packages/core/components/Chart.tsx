import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {
    WithStyled,
    backgroundColor,
    borderRadius,
    headerHeight,
    math,
    primaryColor,
    rem,
    sameBorder,
    size,
    transitionProps
} from '~/utils/style';

import ee from '~/utils/event';
import styled from 'styled-components';

const width = rem(430);
const height = rem(337);

const Div = styled.div<{maximized?: boolean}>`
    ${props =>
        size(props.maximized ? `calc(100vh - ${headerHeight} - ${rem(40)})` : height, props.maximized ? '100%' : width)}
    background-color: ${backgroundColor};
    ${sameBorder({radius: math(`${borderRadius} * 2`)})}
    ${transitionProps(['border-color', 'box-shadow'])}
    position: relative;

    &:hover {
        border-color: ${primaryColor};
        box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.05);
    }
`;

type ChartProps = {
    cid: symbol;
};

const Chart: FunctionComponent<ChartProps & WithStyled> = ({cid, className, children}) => {
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
        <Div maximized={maximized} className={className}>
            {children}
        </Div>
    );
};

export default Chart;
