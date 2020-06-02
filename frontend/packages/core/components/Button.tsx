import React, {FunctionComponent} from 'react';
import {
    WithStyled,
    borderActiveColor,
    borderColor,
    borderFocusedColor,
    borderRadius,
    css,
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

const defaultColor = {
    default: borderColor,
    active: borderActiveColor,
    focused: borderFocusedColor
} as const;

type colorTypes = keyof typeof colors;

const statusButtonColor: (
    status: 'focused' | 'active'
) => (props: {disabled?: boolean; type?: colorTypes}) => ReturnType<typeof css> = status => ({disabled, type}) => css`
    ${disabled || type ? '' : sameBorder({color: defaultColor[status]})}
    background-color: ${disabled ? '' : type ? colors[type][status] : 'transparent'};
`;

const Wrapper = styled.a<{type?: colorTypes; rounded?: boolean; disabled?: boolean}>`
    height: ${height};
    line-height: ${height};
    border-radius: ${props => (props.rounded ? half(height) : borderRadius)};
    ${props => (props.type ? '' : sameBorder({color: defaultColor.default}))}
    background-color: ${props => (props.type ? colors[props.type].default : 'transparent')};
    color: ${props => (props.disabled ? textLighterColor : props.type ? textInvertColor : textColor)};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    display: inline-block;
    vertical-align: top;
    text-align: center;
    padding: 0 ${em(20)};
    ${transitionProps(['background-color', 'border-color'])}
    ${ellipsis()}

    &:hover,
    &:focus {
        ${statusButtonColor('focused')}
    }

    &:active {
        ${statusButtonColor('active')}
    }
`;

const Icon = styled(RawIcon)`
    margin-right: 4px;
`;

type ButtonProps = {
    rounded?: boolean;
    icon?: string;
    type?: colorTypes;
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
