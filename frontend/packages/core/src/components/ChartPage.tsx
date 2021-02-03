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

import React, {FunctionComponent, PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {WithStyled, headerHeight, link, rem, transitionProps} from '~/utils/style';

import ChartCollapse from '~/components/ChartCollapse';
import {ChartCollapseTitle as ChartCollapseTitleLoader} from '~/components/Loader/ChartPage';
import Pagination from '~/components/Pagination';
import SearchInput from '~/components/SearchInput';
import groupBy from 'lodash/groupBy';
import styled from 'styled-components';
import useSearchValue from '~/hooks/useSearchValue';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const StyledPagination = styled(Pagination)`
    margin-top: ${rem(20)};
`;

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: flex-start;
    margin-bottom: -${rem(20)};

    > * {
        margin: 0 ${rem(20)} ${rem(20)} 0;
        flex-shrink: 0;
        flex-grow: 0;

        &.maximized {
            margin-right: 0;
        }
    }
`;

const Search = styled.div`
    width: ${rem(280)};
    margin-bottom: ${rem(16)};
`;

const Empty = styled.div<{height?: string}>`
    width: 100%;
    text-align: center;
    font-size: ${rem(16)};
    color: var(--text-lighter-color);
    line-height: ${rem(24)};
    height: ${props => props.height ?? 'auto'};
    padding: ${rem(320)} 0 ${rem(70)};
    background-color: var(--background-color);
    background-image: url(${`${PUBLIC_PATH}/images/empty.svg`});
    background-repeat: no-repeat;
    background-position: calc(50% + ${rem(25)}) ${rem(70)};
    background-size: ${rem(280)} ${rem(244)};
    ${transitionProps(['color', 'background-color'])}
    ${link}
`;

type Item = {
    id?: string;
    label: string;
};

export interface RenderChart<T extends Item> {
    (item: T, index: number): React.ReactNode;
}

type ChartPageProps<T extends Item> = {
    items?: T[];
    running?: boolean;
    loading?: boolean;
    loader: React.ReactNode;
    renderChart?: RenderChart<T>;
};

const ChartPage = <T extends Item>({
    items,
    loading,
    loader,
    renderChart,
    className
}: PropsWithChildren<ChartPageProps<T> & WithStyled>): ReturnType<FunctionComponent> => {
    const {t} = useTranslation('common');

    const [page, setPage] = useState(1);
    const pageSize = 12;

    const [inputValue, setInputValue] = useState('');
    const searchValue = useSearchValue(inputValue);

    const matchedTags = useMemo(() => {
        try {
            const pattern = new RegExp(searchValue);
            return items?.filter(tag => pattern.test(tag.label)) ?? [];
        } catch {
            return [];
        }
    }, [items, searchValue]);

    const pageMatchedTags = useMemo(() => matchedTags?.slice((page - 1) * pageSize, page * pageSize) ?? [], [
        matchedTags,
        page
    ]);

    useEffect(() => {
        setPage(1);
    }, [searchValue]);

    const groupedItems = useMemo(
        () =>
            Object.entries(groupBy<T>(items ?? [], item => item.label.split('/')[0])).sort(([a], [b]) => {
                const ua = a.toUpperCase();
                const ub = b.toUpperCase();
                if (ua < ub) {
                    return -1;
                }
                if (ua > ub) {
                    return 1;
                }
                return 0;
            }),
        [items]
    );

    const total = useMemo(() => Math.ceil(matchedTags.length / pageSize), [matchedTags]);

    const renderCharts = useCallback(
        (charts: T[], search?: boolean) => (
            <Wrapper>
                {loading ? (
                    loader
                ) : charts.length ? (
                    charts.map((item, j) => {
                        return <React.Fragment key={item.id || item.label}>{renderChart?.(item, j)}</React.Fragment>;
                    })
                ) : (
                    <Empty height={rem(500)}>
                        {search ? (
                            <Trans i18nKey="common:search-empty">
                                Nothing found. Please try again with another word.
                                <br />
                                Or you can <a onClick={() => setInputValue('')}>see all charts</a>.
                            </Trans>
                        ) : (
                            t('common:empty')
                        )}
                    </Empty>
                )}
            </Wrapper>
        ),
        [loading, t, loader, renderChart]
    );

    const content = useMemo(() => {
        if (loading) {
            return Array.from({length: 3}).map((_, index) => (
                <ChartCollapse key={index} title={<ChartCollapseTitleLoader />} opened={!index}>
                    {renderCharts([])}
                </ChartCollapse>
            ));
        }
        if (searchValue) {
            return (
                <ChartCollapse title={t('common:search-result')} total={matchedTags.length}>
                    {renderCharts(pageMatchedTags, true)}
                    {pageMatchedTags.length ? <StyledPagination page={page} total={total} onChange={setPage} /> : null}
                </ChartCollapse>
            );
        }
        if (groupedItems.length) {
            return groupedItems.map((groupedItem, i) => (
                <ChartCollapse
                    title={groupedItem[0]}
                    key={groupedItem[0]}
                    total={groupedItem[1].length}
                    opened={i === 0}
                >
                    {renderCharts(groupedItem[1])}
                </ChartCollapse>
            ));
        }
        return (
            <Empty height={`calc(100vh - ${headerHeight} - ${rem(96)})`}>
                <Trans i18nKey="common:unselected-empty">
                    Nothing selected.
                    <br />
                    Please select display data from right side.
                </Trans>
            </Empty>
        );
    }, [groupedItems, loading, matchedTags.length, page, pageMatchedTags, searchValue, t, total, renderCharts]);

    return (
        <div className={className}>
            <Search>
                <SearchInput
                    placeholder={t('common:search-tags')}
                    rounded
                    value={inputValue}
                    onChange={(value: string) => setInputValue(value)}
                />
            </Search>
            {content}
        </div>
    );
};

export default ChartPage;
