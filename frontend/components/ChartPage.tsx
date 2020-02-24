import React, {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {WithStyled, rem} from '~/utils/style';
import Chart from '~/components/Chart';
import LineChart from '~/components/LineChart';
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
    value?: any[];
};

const ChartPage: FunctionComponent<ChartPageProps & WithStyled> = ({value, className}) => {
    const pageSize = 12;
    const total = Math.ceil((value?.length ?? 0) / pageSize);

    const [page, setPage] = useState(1);

    const items = value?.slice((page - 1) * pageSize, page * pageSize + 1) ?? [];

    return (
        <div className={className}>
            <Wrapper>
                {items.map((item, index) => (
                    <Chart key={index}>
                        <LineChart value={item} />
                    </Chart>
                ))}
            </Wrapper>
            <Pagination page={page} total={total} onChange={setPage} />
        </div>
    );
};

export default ChartPage;
