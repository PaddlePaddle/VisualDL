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

import {WithStyled, em, half, sameBorder, transitionProps} from '~/utils/style';

import React from 'react';
import styled from 'styled-components';

export const padding = em(10);
export const height = em(36);

const StyledInput = styled.input<{rounded?: boolean}>`
    padding: ${padding};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    outline: none;
    ${props => sameBorder({radius: !props.rounded || half(height)})};
    background-color: var(--input-background-color);
    color: var(--text-color);
    caret-color: var(--text-color);
    ${transitionProps(['border-color', 'background-color', 'caret-color', 'color'])}

    &:hover,
    &:focus {
        border-color: var(--border-focused-color);
    }

    &::placeholder {
        color: var(--text-lighter-color);
        ${transitionProps('color')}
    }
`;

type CustomeInputProps = {
    rounded?: boolean;
    value?: string;
    onChange?: (value: string) => unknown;
};

export type InputProps = Omit<React.ComponentPropsWithoutRef<'input'>, keyof CustomeInputProps | 'type' | 'className'> &
    CustomeInputProps;

const Input = React.forwardRef<HTMLInputElement, InputProps & WithStyled>(
    ({rounded, value, onChange, className, ...props}, ref) => (
        <StyledInput
            ref={ref}
            rounded={rounded}
            value={value}
            type="text"
            className={className}
            onChange={e => onChange?.(e.target.value)}
            {...props}
        />
    )
);

Input.displayName = 'Input';

export default Input;
