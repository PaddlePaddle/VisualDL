import React, {FunctionComponent} from 'react';
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
    maximized?: boolean;
};

const Chart: FunctionComponent<ChartProps & WithStyled> = ({maximized, className, children}) => {
    return (
        <Div maximized={maximized} className={className}>
            {children}
        </Div>
    );
};

export default Chart;
