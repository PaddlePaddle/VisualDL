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

import React, {FunctionComponent, useCallback, useMemo} from 'react';
import {WithStyled, borderRadius, ellipsis, em, half, transitionProps} from '~/utils/style';

import type {Icons} from '~/components/Icon';
import RawIcon from '~/components/Icon';
import {colors} from '~/utils/theme';
import styled from 'styled-components';

const height = em(36);

const buttonColors = {
    ...colors,
    default: {
        default: 'var(--border-color)',
        focused: 'var(--border-focused-color)',
        active: 'var(--border-active-color)',
        text: 'var(--text-color)'
    } as const
} as const;

type colorTypes = keyof typeof buttonColors;

const Wrapper = styled.a<{type: colorTypes}>`
    height: ${height};
    line-height: ${height};
    border-radius: ${borderRadius};
    background-color: ${props => buttonColors[props.type].default};
    color: ${props => buttonColors[props.type].text};
    cursor: pointer;
    display: inline-block;
    vertical-align: top;
    text-align: center;
    padding: 0 ${em(20)};
    ${transitionProps(['background-color', 'border-color', 'color'])}
    ${ellipsis()}

    &:hover,
    &:focus {
        background-color: ${props => buttonColors[props.type].focused};
    }

    &:active {
        background-color: ${props => buttonColors[props.type].active};
    }

    &.rounded {
        border-radius: ${half(height)};
    }

    &.outline {
        color: ${props => buttonColors[props.type][props.type === 'default' ? 'text' : 'default']};
        background-color: transparent;
        border: 1px solid ${props => buttonColors[props.type].default};

        &:hover,
        &:focus {
            color: ${props => buttonColors[props.type][props.type === 'default' ? 'text' : 'focused']};
            border-color: ${props => buttonColors[props.type].focused};
        }

        &:active {
            color: ${props => buttonColors[props.type][props.type === 'default' ? 'text' : 'active']};
            border-color: ${props => buttonColors[props.type].active};
        }
    }

    &.disabled {
        &,
        &:hover,
        &:focus,
        &:active {
            color: var(--text-lighter-color);
            background-color: var(--border-color);

            &.outline {
                border-color: var(--border-color);
            }
        }
        cursor: not-allowed;
    }
`;

const Icon = styled(RawIcon)`
    margin-right: 4px;
`;

type ButtonProps = {
    rounded?: boolean;
    outline?: boolean;
    icon?: Icons;
    type?: colorTypes;
    disabled?: boolean;
    onClick?: () => unknown;
};

const Button: FunctionComponent<ButtonProps & WithStyled> = ({
    disabled,
    rounded,
    outline,
    icon,
    type,
    children,
    className,
    onClick
}) => {
    const click = useCallback(() => {
        if (disabled) {
            return;
        }
        onClick?.();
    }, [disabled, onClick]);

    const buttonType = useMemo(() => type || 'default', [type]);

    return (
        <Wrapper
            className={`${className ?? ''} ${rounded ? 'rounded' : ''} ${disabled ? 'disabled' : ''} ${
                buttonType === 'default' || outline ? 'outline' : ''
            }`}
            type={buttonType}
            onClick={click}
        >
            {icon && <Icon type={icon}></Icon>}
            {children}
        </Wrapper>
    );
};

export default Button;
