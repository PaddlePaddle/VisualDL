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

import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import {WithStyled, borderRadius, rem, transitionProps} from '~/utils/style';

import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: flex-start;

    &.fullWidth {
        justify-content: space-between;
    }

    &.centered {
        justify-content: center;
    }

    > a {
        cursor: pointer;
        display: block;
        font-size: ${rem(16)};
        background-color: var(--tab-inactive-background-color);
        padding: 0.75em 1.25em;
        position: relative;

        &:first-child {
            border-top-left-radius: ${borderRadius};
        }
        &:last-child {
            border-top-right-radius: ${borderRadius};
        }

        &:not(.active) + a:not(.active)::before {
            content: '';
            display: block;
            width: 1px;
            height: calc(100% - 1.5em);
            background-color: var(--border-color);
            position: absolute;
            left: 0;
            top: 0.75em;
        }

        &.active {
            color: var(--primary-color);
            background-color: var(--background-color);
        }

        &:hover {
            color: var(--primary-color);
        }
    }

    &.underscore > a {
        border-bottom: 2px solid transparent;
        ${transitionProps(['border-color', 'color'])}
        background-color: transparent;
        padding: 0;
        padding-bottom: 0.4em;

        &:first-child {
            border-top-left-radius: 0;
        }
        &:last-child {
            border-top-right-radius: 0;
        }

        &:not(:last-child) {
            margin-right: 1.25em;
        }

        &:not(.active) + a:not(.active)::before {
            display: none;
        }

        &.active {
            border-bottom-color: var(--primary-color);
            background-color: transparent;
        }
    }
`;

export type TabProps<T> = {
    list?: {
        value: T;
        label: string;
    }[];
    value?: T;
    variant?: 'fullWidth' | 'centered';
    appearance?: 'underscore';
    onChange?: (value: T) => unknown;
};

const Tab = <T extends unknown>({
    list,
    value,
    variant,
    appearance,
    className,
    onChange
}: TabProps<T> & WithStyled): ReturnType<FunctionComponent> => {
    const [selected, setSelected] = useState<T | undefined>(value);
    useEffect(() => setSelected(value), [value]);
    const change = useCallback(
        (v: T) => {
            if (selected !== v) {
                setSelected(v);
                onChange?.(v);
            }
        },
        [selected, onChange]
    );

    const classNames = useMemo(() => [className, variant, appearance].filter(i => i != null).join(' '), [
        appearance,
        className,
        variant
    ]);

    return (
        <Wrapper className={classNames}>
            {list?.map((item, index) => (
                <a
                    key={index}
                    className={(selected === item.value && 'active') || ''}
                    onClick={() => change(item.value)}
                >
                    {item.label}
                </a>
            ))}
        </Wrapper>
    );
};

export default Tab;
