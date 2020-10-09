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
import type {SearchItem, SearchResult} from '~/resource/graph/types';
import {css, ellipsis, em, rem, sameBorder, size, transitionProps, triangle} from '~/utils/style';

import Field from '~/components/Field';
import SearchInput from '~/components/SearchInput';
import styled from 'styled-components';
import useSearchValue from '~/hooks/useSearchValue';
import {useTranslation} from 'react-i18next';

const SearchField = styled(Field)`
    margin-bottom: ${rem(20)};
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
    overflow: auto;
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const Item = styled.li`
    padding: ${em(10)} ${em(12)};
    cursor: pointer;
    width: 100%;
    background-color: var(--background-color);
    display: flex;
    align-items: center;
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

const icon = css`
    color: #979797;
    flex: none;
    width: ${em(8)};
`;

const EdgeIcon = styled.i`
    ${icon}
    position: relative;
    height: ${em(11)};
    overflow: hidden;

    &::before {
        content: '';
        display: block;
        ${size(em(6), em(1))}
        background-color: currentColor;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    &::after {
        content: '';
        display: block;
        ${triangle({
            pointingDirection: 'bottom',
            height: em(5),
            width: em(7),
            foregroundColor: 'currentColor'
        })}
        position: absolute;
        top: ${em(6)};
        left: 50%;
        transform: translateX(-50%);
    }
`;

const NodeIcon = styled.i`
    ${icon}
    height: ${em(7)};
    ${sameBorder({radius: em(2), color: 'currentColor'})}
    background-color: #f7f7f7;
`;

const InitializerIcon = styled.i`
    ${icon}
    height: ${em(8)};
    ${sameBorder({radius: em(4), color: 'currentColor'})}
    background-color: #f7f7f7;
`;

const icons = {
    input: EdgeIcon,
    output: EdgeIcon,
    node: NodeIcon,
    initializer: InitializerIcon
} as const;

type SearchProps = {
    text?: string;
    data: SearchResult;
    onChange?: (value: string) => unknown;
    onSelect?: (item: SearchItem) => unknown;
    onActive?: () => unknown;
    onDeactive?: () => unknown;
};

const Search: FunctionComponent<SearchProps> = ({text, data, onChange, onSelect, onActive, onDeactive}) => {
    const {t} = useTranslation(['graph', 'common']);

    const [search, setSearch] = useState(text ?? '');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<SearchItem[]>(data.result);
    const debouncedSearchText = useSearchValue(search);
    useEffect(() => setSearch(text ?? ''), [text]);
    useEffect(() => {
        if (searching) {
            onChange?.(debouncedSearchText);
        } else {
            setSearchResult([]);
        }
    }, [debouncedSearchText, searching, onChange]);
    useEffect(() => {
        if (data.text === search) {
            setSearchResult(data.result);
        }
    }, [data, search]);

    const focus = useCallback(() => {
        setSearching(true);
        onActive?.();
    }, [onActive]);

    const cancel = useCallback(() => {
        setSearch('');
        onChange?.('');
        setSearching(false);
        onDeactive?.();
    }, [onChange, onDeactive]);

    const select = useCallback(
        (item: SearchItem) => {
            setSearch(item.name);
            onSelect?.(item);
            setSearching(false);
            onDeactive?.();
        },
        [onSelect, onDeactive]
    );

    return (
        <>
            <SearchField>
                <SearchInput placeholder={t('common:search')} value={search} onChange={setSearch} onFocus={focus} />
                {searching && <a onClick={cancel}>{t('common:cancel')}</a>}
            </SearchField>
            {searching &&
                (searchResult.length ? (
                    <Wrapper>
                        <List>
                            {searchResult.map(item => {
                                const Icon = icons[item.type];
                                return (
                                    <Item key={item.id} onClick={() => select(item)} title={item.name}>
                                        <Icon />
                                        <span>{item.name}</span>
                                    </Item>
                                );
                            })}
                        </List>
                    </Wrapper>
                ) : (
                    <Empty>{t('graph:nothing-matched')}</Empty>
                ))}
        </>
    );
};

export default Search;
