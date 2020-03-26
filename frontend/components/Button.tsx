import React, {FunctionComponent} from 'react';
import {
    WithStyled,
    dangerActiveColor,
    dangerColor,
    dangerFocusedColor,
    ellipsis,
    em,
    half,
    primaryActiveColor,
    primaryColor,
    primaryFocusedColor,
    textInvertColor,
    transitionProps
} from '~/utils/style';

import RawIcon from '~/components/Icon';
import styled from 'styled-components';

const height = em(36);
const colors = {
    primary: {
        default: primaryColor,
        active: primaryActiveColor,
        focused: primaryFocusedColor
    },
    danger: {
        default: dangerColor,
        active: dangerActiveColor,
        focused: dangerFocusedColor
    }
};

const Wrapper = styled.a<{type: keyof typeof colors}>`
    cursor: pointer;
    height: ${height};
    line-height: ${height};
    border-radius: ${half(height)};
    background-color: ${props => colors[props.type].default};
    color: ${textInvertColor};
    display: block;
    text-align: center;
    ${transitionProps('background-color')}
    ${ellipsis()}

    &:hover,
    &:focus {
        background-color: ${props => colors[props.type].focused};
    }

    &:active {
        background-color: ${props => colors[props.type].active};
    }
`;

const Icon = styled(RawIcon)`
    margin-right: 4px;
`;

type ButtonProps = {
    icon?: string;
    type?: keyof typeof colors;
    onClick?: () => unknown;
};

const Button: FunctionComponent<ButtonProps & WithStyled> = ({icon, type, children, className, onClick}) => (
    <Wrapper className={className} onClick={onClick} type={type || 'primary'}>
        {icon && <Icon type={icon}></Icon>}
        {children}
    </Wrapper>
);

export default Button;
