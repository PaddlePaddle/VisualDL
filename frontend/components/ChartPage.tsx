import React, {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {WithStyled, rem, primaryColor} from '~/utils/style';
import BarLoader from 'react-spinners/BarLoader';
import Chart from '~/components/Chart';
import Pagination from '~/components/Pagination';

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

// TODO: add types
// eslint-disable-next-line
type ChartPageProps<T = any> = {
    items?: T[];
    loading?: boolean;
    withChart?: (item: T) => React.ReactNode;
};

const ChartPage: FunctionComponent<ChartPageProps & WithStyled> = ({items, loading, withChart, className}) => {
    const pageSize = 12;
    const total = Math.ceil((items?.length ?? 0) / pageSize);

    const [page, setPage] = useState(1);

    const pageItems = items?.slice((page - 1) * pageSize, page * pageSize) ?? [];

    return (
        <div className={className}>
            {loading ? (
                <Loading>
                    <BarLoader color={primaryColor} width="20%" height="4px" />
                </Loading>
            ) : (
                <Wrapper>
                    {pageItems.map((item, index) => (
                        <Chart key={index}>{withChart?.(item)}</Chart>
                    ))}
                </Wrapper>
            )}
            <Pagination page={page} total={total} onChange={setPage} />
        </div>
    );
};

export default ChartPage;
