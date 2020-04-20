import React, {FunctionComponent, useMemo, useState} from 'react';
import {WithStyled, primaryColor, rem} from '~/utils/style';

import BarLoader from 'react-spinners/BarLoader';
import Chart from '~/components/Chart';
import Pagination from '~/components/Pagination';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: flex-start;

    > * {
        margin: 0 ${rem(20)} ${rem(20)} 0;
        flex-shrink: 0;
        flex-grow: 0;
    }
`;

const Loading = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: ${rem(200)};
    padding: ${rem(40)} 0;
`;

const Empty = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${rem(20)};
    height: ${rem(150)};
    flex-grow: 1;
`;

export interface WithChart<T> {
    (item: T, index: number): React.ReactNode;
}

// TODO: add types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartPageProps<T = any> = {
    items?: T[];
    loading?: boolean;
    maximized?: boolean[];
    withChart?: WithChart<T>;
};

const ChartPage: FunctionComponent<ChartPageProps & WithStyled> = ({
    items,
    maximized,
    loading,
    withChart,
    className
}) => {
    const {t} = useTranslation('common');

    const pageSize = 12;
    const total = Math.ceil((items?.length ?? 0) / pageSize);

    const [page, setPage] = useState(1);

    const pageItems = useMemo(() => items?.slice((page - 1) * pageSize, page * pageSize) ?? [], [items, page]);

    return (
        <div className={className}>
            {loading ? (
                <Loading>
                    <BarLoader color={primaryColor} width="20%" height="4px" />
                </Loading>
            ) : (
                <Wrapper>
                    {pageItems.length ? (
                        pageItems.map((item, index) => (
                            <Chart maximized={maximized?.[index]} key={index}>
                                {withChart?.(item, index)}
                            </Chart>
                        ))
                    ) : (
                        <Empty>{t('empty')}</Empty>
                    )}
                </Wrapper>
            )}
            <Pagination page={page} total={total} onChange={setPage} />
        </div>
    );
};

export default ChartPage;
