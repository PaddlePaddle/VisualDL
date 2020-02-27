import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {
    WithStyled,
    primaryColor,
    backgroundColor,
    borderColor,
    borderRadius,
    duration,
    easing,
    transitions,
    math
} from '~/utils/style';

const Div = styled.div`
    background-color: ${backgroundColor};
    border: 1px solid ${borderColor};
    border-radius: ${math(`${borderRadius} * 2`)};
    ${transitions(['border-color', 'box-shadow'], `${duration} ${easing}`)}

    &:hover {
        border-color: ${primaryColor};
        box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.05);
    }
`;

const Chart: FunctionComponent<WithStyled> = ({className, children}) => {
    return <Div className={className}>{children}</Div>;
};

export default Chart;
