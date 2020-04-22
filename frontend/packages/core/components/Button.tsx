import React, {FunctionComponent} from 'react';
import {
    WithStyled,
    borderActiveColor,
    borderColor,
    borderFocusedColor,
    borderRadius,
    dangerActiveColor,
    dangerColor,
    dangerFocusedColor,
    ellipsis,
    em,
    half,
    primaryActiveColor,
    primaryColor,
    primaryFocusedColor,
    sameBorder,
    textColor,
    textInvertColor,
    textLighterColor,
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

const Wrapper = styled.a<{type?: keyof typeof colors; rounded?: boolean; disabled?: boolean}>`
    cursor: pointer;
    height: ${height};
    line-height: ${height};
    border-radius: ${props => (props.rounded ? half(height) : borderRadius)};
    ${props => (props.type ? '' : sameBorder({color: borderColor}))}
    background-color: ${props => (props.type ? colors[props.type].default : 'transparent')};
    color: ${props => (props.disabled ? textLighterColor : props.type ? textInvertColor : textColor)};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'cursor')};
    display: inline-block;
    vertical-align: top;
    text-align: center;
    padding: 0 ${em(20)};
    ${transitionProps(['background-color', 'border-color'])}
    ${ellipsis()}

    ${props =>
        props.disabled
            ? ''
            : `
                &:hover,
                &:focus {
                    ${props.type ? '' : sameBorder({color: borderFocusedColor})}
                    background-color: ${props.type ? colors[props.type].focused : 'transparent'};
                }

                &:active {
                    ${props.type ? '' : sameBorder({color: borderActiveColor})}
                    background-color: ${props.type ? colors[props.type].active : 'transparent'};
                }`}
`;

const Icon = styled(RawIcon)`
    margin-right: 4px;
`;

type ButtonProps = {
    rounded?: boolean;
    icon?: string;
    type?: keyof typeof colors;
    disabled?: boolean;
    onClick?: () => unknown;
};

const Button: FunctionComponent<ButtonProps & WithStyled> = ({
    disabled,
    rounded,
    icon,
    type,
    children,
    className,
    onClick
}) => (
    <Wrapper className={className} onClick={onClick} type={type} rounded={rounded} disabled={disabled}>
        {icon && <Icon type={icon}></Icon>}
        {children}
    </Wrapper>
);

export default Button;
