import React, {FunctionComponent} from 'react';
import {
    WithStyled,
    backgroundColor,
    borderRadius,
    math,
    primaryColor,
    sameBorder,
    transitionProps
} from '~/utils/style';

import styled from 'styled-components';

const Div = styled.div`
    background-color: ${backgroundColor};
    ${sameBorder({radius: math(`${borderRadius} * 2`)})}
    ${transitionProps(['border-color', 'box-shadow'])}

    &:hover {
        border-color: ${primaryColor};
        box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.05);
    }
`;

const Chart: FunctionComponent<WithStyled> = ({className, children}) => {
    return <Div className={className}>{children}</Div>;
};

export default Chart;
