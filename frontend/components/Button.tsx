import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {
    WithStyled,
    em,
    half,
    textInvertColor,
    primaryColor,
    primaryFocusedColor,
    primaryActiveColor,
    duration,
    easing,
    ellipsis,
    transitions
} from '~/utils/style';
import RawIcon from '~/components/Icon';

const height = em(36);

const Wrapper = styled.a`
    cursor: pointer;
    height: ${height};
    line-height: ${height};
    border-radius: ${half(height)};
    background-color: ${primaryColor};
    color: ${textInvertColor};
    display: block;
    text-align: center;
    ${transitions('background-color', `${duration} ${easing}`)}
    ${ellipsis()}

    &:hover,
    &:focus {
        background-color: ${primaryFocusedColor};
    }

    &:active {
        background-color: ${primaryActiveColor};
    }
`;

const Icon = styled(RawIcon)`
    margin-right: 4px;
`;

type ButtonProps = {
    icon?: string;
    onClick?: () => unknown;
};

const Button: FunctionComponent<ButtonProps & WithStyled> = ({icon, children, className, onClick}) => (
    <Wrapper className={className} onClick={onClick}>
        {icon && <Icon type={icon}></Icon>}
        {children}
    </Wrapper>
);

export default Button;
