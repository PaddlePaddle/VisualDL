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
import {ellipsis, rem, transitionProps} from '~/utils/style';

import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const Empty = styled.div`
    width: 100%;
    text-align: center;
    font-size: ${rem(14)};
    color: var(--text-lighter-color);
    line-height: ${rem(20)};
    height: auto;
    padding: ${rem(170)} 0 ${rem(50)};
    background-color: var(--background-color);
    background-image: url(${`${PUBLIC_PATH}/images/empty.svg`});
    background-repeat: no-repeat;
    background-position: calc(50% + ${rem(12)}) ${rem(50)};
    background-size: ${rem(140)} ${rem(122)};
    ${transitionProps(['color', 'background-color'])}
`;

const List = styled.ul`
    list-style: none;
    line-height: 2.3;
    padding-left: 0;
    margin: 0;

    > li {
        list-style: none;

        > a {
            cursor: pointer;
            ${ellipsis()}
            display: block;
            padding: 0 ${rem(20)};
            ${transitionProps('background-color')}

            &:hover {
                background-color: var(--background-focused-color);
            }
        }
    }
`;

type LabelSearchResultProps = {
    list: string[];
    onHovered?: (index?: number) => unknown;
};

const LabelSearchResult: FunctionComponent<LabelSearchResultProps> = ({list, onHovered}) => {
    const {t} = useTranslation('high-dimensional');

    if (!list.length) {
        return <Empty>{t('high-dimensional:search-empty')}</Empty>;
    }
    return (
        <List onMouseLeave={() => onHovered?.()}>
            {list.map((label, index) => (
                <li key={index}>
                    <a onMouseEnter={() => onHovered?.(index)}>{label}</a>
                </li>
            ))}
        </List>
    );
};

export default LabelSearchResult;
