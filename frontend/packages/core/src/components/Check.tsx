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

import React, {FunctionComponent, useCallback} from 'react';
import {ellipsis, em, half, math, position, sameBorder, size, transitionProps} from '~/utils/style';

import styled from 'styled-components';
const height = em(20);
const checkSize = em(16);
const checkMark =
    // eslint-disable-next-line
    'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCAxMSA4IiB3aWR0aD0iMTEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTkuNDc5NDI3MDggMTAuMTg3NWgtNS4yNXYtMS4zMTI1aDMuOTM3bC4wMDA1LTcuODc1aDEuMzEyNXoiIGZpbGw9IiNmNWY1ZjUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdHJhbnNmb3JtPSJtYXRyaXgoLjcwNzEwNjc4IC43MDcxMDY3OCAtLjcwNzEwNjc4IC43MDcxMDY3OCA0Ljk2Mjk5NCAtNi4yMDg0NCkiLz48L3N2Zz4=';

const Wrapper = styled.label<{disabled?: boolean}>`
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;
const Input = styled.input.attrs<{disabled?: boolean}>(props => ({
    type: 'checkbox',
    disabled: !!props.disabled
}))`
    ${size(0)}
    ${position('absolute', 0, null, null, 0)}
     opacity: 0;
    pointer-events: none;
`;

const Inner = styled.div<{checked?: boolean; size?: string; disabled?: boolean}>`
    color: ${props => (props.checked ? 'var(--text-invert-color)' : 'transparent')};
    flex-shrink: 0;
    ${props => size(math(`${checkSize} * ${props.size === 'small' ? 0.875 : 1}`))}
    margin: ${half(`${height} - ${checkSize}`)} 0;
    margin-right: ${em(10)};
    ${props =>
        sameBorder({color: props.disabled || !props.checked ? 'var(--text-lighter-color)' : 'var(--primary-color)'})};
    background-color: ${props =>
        props.disabled
            ? props.checked
                ? 'var(--text-lighter-color)'
                : 'transparent'
            : props.checked
            ? 'var(--primary-color)'
            : 'var(--background-color)'};
    background-image: ${props => (props.checked ? `url("${checkMark}")` : 'none')};
    background-repeat: no-repeat;
    background-position: center center;
    background-size: ${em(10)} ${em(8)};
    position: relative;
    ${transitionProps(['border-color', 'background-color', 'color'])}

    ${Wrapper}:hover > & {
        border-color: ${props =>
            props.disabled
                ? 'var(--text-lighter-color)'
                : props.checked
                ? 'var(--primary-color)'
                : 'var(--text-lighter-color)'};
    }
`;

const Content = styled.div<{disabled?: boolean}>`
    line-height: ${height};
    flex-grow: 1;
    ${props => (props.disabled ? 'color: var(--text-lighter-color);' : '')}
    ${transitionProps('color')}
     ${ellipsis()}
`;

type CheckboxProps = {
    value: string;
    checked?: boolean;
    className?: string;
    onChange?: (checked: string) => unknown;
    size?: 'small';
    title?: string;
    disabled?: boolean;
};

const Checkbox: FunctionComponent<CheckboxProps> = ({
    value,
    checked,
    children,
    size,
    disabled,
    className,
    title,
    onChange
}) => {
    const onChangeInput = useCallback(() => {
        if (disabled) {
            return;
        }
        if (onChange) {
            onChange(value);
        }
    }, [disabled, onChange]);

    return (
        <Wrapper disabled={disabled} className={className} title={title}>
            <Input onChange={onChangeInput} checked={checked} disabled={disabled} />
            <Inner checked={checked} size={size} disabled={disabled} />
            <Content disabled={disabled}>{children}</Content>
        </Wrapper>
    );
};

export default Checkbox;
