import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {
    WithStyled,
    em,
    primaryColor,
    backgroundColor,
    borderColor,
    borderRadius,
    duration,
    easing,
    transitions,
    size,
    math
} from '~/utils/style';

const width = em(430);
const height = em(320);

const Div = styled.div`
    ${size(height, width)}
    background-color: ${backgroundColor};
    border: 1px solid ${borderColor};
    border-radius: ${math(`${borderRadius} * 2`)};
    ${transitions(['border-color', 'box-shadow'], `${duration} ${easing}`)}

    &:hover {
        border-color: ${primaryColor};
        box-shadow: 0 5px 6px 0 rgba(0,0,0,0.05);
    }
`;

const Chart: FunctionComponent<WithStyled> = ({className, children}) => {
    return <Div className={className}>{children}</Div>;
};

export default Chart;
