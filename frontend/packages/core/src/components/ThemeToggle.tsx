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
import {actions, selectors} from '~/store';
import {colors, themes} from '~/utils/theme';
import {rem, transitionProps} from '~/utils/style';
import {useDispatch, useSelector} from 'react-redux';

import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Wrapper = styled.dl`
    display: flex;
    align-items: center;
    background-color: var(--background-color);
    ${transitionProps('background-color')}
    margin: ${rem(10)};
`;

const Item = styled.div<{color: string; border: string; active?: boolean}>`
    margin: 0 ${rem(10)};
    padding: ${rem(6)} ${rem(10)};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;

    dd {
        display: block;
        width: ${rem(18)};
        height: ${rem(18)};
        margin: 0;
        position: relative;
        border-radius: 50%;
        ${props => props.color};

        &::before {
            content: ' ';
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: calc(100% - 2px);
            height: calc(100% - 2px);
            border: 1px solid ${props => props.border};
            border-radius: 50%;
        }

        &::after {
            content: ' ';
            display: ${props => (props.active ? 'block' : 'none')};
            position: absolute;
            top: 50%;
            left: 50%;
            background-color: #fff;
            width: ${rem(8)};
            height: ${rem(8)};
            transform: translate(-50%, -50%);
            border-radius: 50%;
        }
    }

    dt {
        display: block;
        margin-top: ${rem(12)};
    }
`;

const items = [
    {
        color: `background-color: ${colors.primary.default}`,
        border: 'rgba(255, 255, 255, 0.59)',
        label: 'light'
    },
    {
        color: `background-color: ${themes.dark.backgroundColor}`,
        border: 'rgba(255, 255, 255, 0.3)',
        label: 'dark'
    },
    {
        color: 'background-image: linear-gradient(133deg, #e9e9e9 5%, #a3a3a3 97%);',
        border: 'rgba(255, 255, 255, 0.3)',
        label: 'auto'
    }
] as const;

const ThemeToggle: FunctionComponent = () => {
    const {t} = useTranslation('common');

    const dispatch = useDispatch();
    const selected = useSelector(selectors.theme.selected);

    return (
        <Wrapper>
            {items.map(item => (
                <Item
                    color={item.color}
                    border={item.border}
                    active={selected === item.label}
                    key={item.label}
                    onClick={() => dispatch(actions.theme.selectTheme(item.label))}
                >
                    <dd></dd>
                    <dt>{t(`common:theme.${item.label}`)}</dt>
                </Item>
            ))}
        </Wrapper>
    );
};

export default ThemeToggle;
