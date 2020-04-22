import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import {Trans, useTranslation} from '~/utils/i18n';
import {WithStyled, link, primaryColor, rem, textLighterColor} from '~/utils/style';

import BarLoader from 'react-spinners/BarLoader';
import Chart from '~/components/Chart';
import ChartCollapse from '~/components/ChartCollapse';
import Pagination from '~/components/Pagination';
import SearchInput from '~/components/SearchInput';
import {Tag} from '~/types';
import groupBy from 'lodash/groupBy';
import styled from 'styled-components';
import useSearchValue from '~/hooks/useSearchValue';

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
    }
`;

const Search = styled.div`
    width: ${rem(280)};
    margin-bottom: ${rem(16)};
`;

const Loading = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: ${rem(200)};
    padding: ${rem(40)} 0;
`;

const Empty = styled.div`
    width: 100%;
    text-align: center;
    font-size: ${rem(16)};
    color: ${textLighterColor};
    line-height: ${rem(24)};
    height: ${rem(500)};
    padding-top: ${rem(320)};
    background-image: url(${`${process.env.PUBLIC_PATH}/images/empty.svg`});
    background-repeat: no-repeat;
    background-position: calc(50% + ${rem(25)}) ${rem(70)};
    background-size: ${rem(280)} ${rem(244)};
    ${link}
`;

export interface WithChart<T> {
    (item: T & {cid: symbol}, index: number): React.ReactNode;
}

type ChartPageProps<T extends Tag = Tag> = {
    items?: T[];
    running?: boolean;
    loading?: boolean;
    withChart?: WithChart<T>;
};

const ChartPage: FunctionComponent<ChartPageProps & WithStyled> = ({items, loading, withChart, className}) => {
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
            Object.entries(groupBy<Tag>(items ?? [], (item: Tag) => item.label.split('/')[0])).sort(([a], [b]) => {
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

    const withCharts = useCallback(
        (charts: Tag[], search?: boolean) =>
            loading ? (
                <Loading>
                    <BarLoader color={primaryColor} width="20%" height="4px" />
                </Loading>
            ) : (
                <Wrapper>
                    {charts.length ? (
                        charts.map((item, j) => {
                            const cid = Symbol(item.label);
                            return (
                                <Chart cid={cid} key={item.label}>
                                    {withChart?.({...item, cid}, j)}
                                </Chart>
                            );
                        })
                    ) : (
                        <Empty>
                            {search ? (
                                <Trans i18nKey="search-empty">
                                    Nothing found. Please try again with another word.
                                    <br />
                                    Or you can <a onClick={() => setInputValue('')}>see all charts</a>.
                                </Trans>
                            ) : (
                                t('empty')
                            )}
                        </Empty>
                    )}
                </Wrapper>
            ),
        [withChart, loading, t]
    );

    return (
        <div className={className}>
            <Search>
                <SearchInput
                    placeholder={t('search-tags')}
                    rounded
                    value={inputValue}
                    onChange={(value: string) => setInputValue(value)}
                />
            </Search>
            {searchValue ? (
                <ChartCollapse title={t('search-result')} total={matchedTags.length}>
                    {withCharts(pageMatchedTags, true)}
                    {pageMatchedTags.length ? <StyledPagination page={page} total={total} onChange={setPage} /> : null}
                </ChartCollapse>
            ) : (
                groupedItems.map((groupedItem, i) => (
                    <ChartCollapse
                        title={groupedItem[0]}
                        key={groupedItem[0]}
                        total={groupedItem[1].length}
                        opened={i === 0}
                    >
                        {withCharts(groupedItem[1])}
                    </ChartCollapse>
                ))
            )}
        </div>
    );
};

export default ChartPage;
