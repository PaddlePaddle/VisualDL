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
import {ellipsis, em, rem, zIndexes, transitionProps} from '~/utils/style';

import Field from '~/components/Field';
import SearchInput from '~/components/SearchInput';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const SearchSection = styled.section`
    width: 100%;
    position: relative;
`;

const SearchField = styled(Field)`
    margin-bottom: ${rem(10)};
    display: flex;
    justify-content: space-between;
    align-items: center;

    > :first-child {
        flex: auto;
    }

    > a:last-child {
        color: var(--primary-color);
        cursor: pointer;
        margin-left: ${rem(10)};
        flex: none;
        ${transitionProps('color')}
    }
`;

const Empty = styled.div`
    padding: ${rem(100)} 0;
    text-align: center;
    color: var(--text-light-color);
    ${transitionProps('color')}
`;

const Wrapper = styled.div`
    width: 100%;
    max-height: 250px;
    overflow-y: auto;
    position: absolute;
    z-index: ${zIndexes.dialog};
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 -${rem(5)} ${rem(16)} 0 rgba(0, 0, 0, 0.03);
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const Item = styled.li`
    width: 100%;
    padding: ${em(10)} ${em(12)};
    display: flex;
    align-items: center;
    cursor: pointer;
    background-color: var(--background-color);
    ${transitionProps('background-color')}

    > span {
        flex: auto;
        margin-left: ${em(10)};
        ${ellipsis()}
    }

    &:hover {
        background-color: var(--background-focused-color);
    }
`;

type NodeSearchProps = {
    text?: string;
    searchList: string[];
    onChange?: (value: string) => unknown;
    onSelect?: (item: string) => unknown;
};

const NodeSearch: FunctionComponent<NodeSearchProps> = ({text, searchList, onChange, onSelect}) => {
    const {t} = useTranslation(['model-visual', 'common']);

    const [search, setSearch] = useState(text ?? '');
    const [searching, setSearching] = useState(false);

    useEffect(() => setSearch(text ?? ''), [text]);

    const cancel = useCallback(
        () => {
            setSearch('');
            onChange?.('');
            setSearching(false);
        },
        [onChange]
    );

    return (
        <SearchSection>
            <SearchField>
                <SearchInput
                    placeholder={t('common:search')}
                    value={search}
                    onChange={setSearch}
                    onFocus={() => setSearching(true)}
                />
                {searching && <a onClick={cancel}>{t('common:cancel')}</a>}
            </SearchField>
            {searching &&
                (searchList.length ? (
                    <Wrapper>
                        <List>
                            {
                            searchList
                                .filter(item => (item.includes(search)))
                                .map((item, idx) => (
                                    <Item key={idx} onClick={() => {
                                        onSelect?.(item);
                                        setSearch(item);
                                        setSearching(false);
                                    }}>
                                        <span>{item}</span>
                                    </Item>
                                ))
                            }
                        </List>
                    </Wrapper>
                ) : (
                    <Empty>{t('model-visual:no-match')}</Empty>
                ))}
        </SearchSection>
    );
};

export default NodeSearch;
