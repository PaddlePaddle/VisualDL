/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {FunctionComponent} from 'react';
import {WithStyled, borderRadius, css, ellipsis, em, half, sameBorder, transitionProps} from '~/utils/style';

import type {Icons} from '~/components/Icon';
import RawIcon from '~/components/Icon';
import {colors} from '~/utils/theme';
import styled from 'styled-components';

const height = em(36);

const defaultColor = {
    default: 'var(--border-color)',
    focused: 'var(--border-focused-color)',
    active: 'var(--border-active-color)'
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
    color: ${props =>
        props.disabled ? 'var(--text-lighter-color)' : props.type ? colors[props.type].text : 'var(--text-color)'};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    display: inline-block;
    vertical-align: top;
    text-align: center;
    padding: 0 ${em(20)};
    ${transitionProps(['background-color', 'border-color', 'color'])}
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
    icon?: Icons;
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
