import React, {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {WithStyled, rem} from '~/utils/style';
import Chart from '~/components/Chart';
import Pagination from '~/components/Pagination';

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;

    > * {
        margin: 0 ${rem(20)} ${rem(20)} 0;
        flex-shrink: 0;
        flex-grow: 0;
    }
`;

type ChartPageProps = {
    // TODO: add types
    // eslint-disable-next-line
    items?: any[];
    // eslint-disable-next-line
    withChart?: (item: any) => React.ReactNode;
};

const ChartPage: FunctionComponent<ChartPageProps & WithStyled> = ({items, withChart, className}) => {
    const pageSize = 12;
    const total = Math.ceil((items?.length ?? 0) / pageSize);

    const [page, setPage] = useState(1);

    const pageItems = items?.slice((page - 1) * pageSize, page * pageSize + 1) ?? [];

    return (
        <div className={className}>
            <Wrapper>
                {pageItems.map((item, index) => (
                    <Chart key={index}>{withChart?.(item)}</Chart>
                ))}
            </Wrapper>
            <Pagination page={page} total={total} onChange={setPage} />
        </div>
    );
};

export default ChartPage;
