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

import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {em, rem, transitionProps} from '~/utils/style';

import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: space-between;

    > a {
        cursor: pointer;
        display: block;
        font-size: ${rem(16)};
        border-bottom: 2px solid transparent;
        ${transitionProps(['border-color', 'color'])}

        &:not(:last-child) {
            margin-right: ${em(20)};
        }

        &.active {
            color: var(--primary-color);
            border-bottom-color: var(--primary-color);
        }

        &:hover {
            color: var(--primary-color);
        }
    }
`;

type TabProps<T> = {
    list?: {
        value: T;
        label: string;
    }[];
    value?: T;
    onChange?: (value: T) => unknown;
};

const Tab = <T extends unknown>({list, value, onChange}: TabProps<T>): ReturnType<FunctionComponent> => {
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

    return (
        <Wrapper>
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
