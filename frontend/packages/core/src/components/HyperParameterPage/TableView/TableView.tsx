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

import {DEFAULT_ORDER_INDICATOR, OrderDirection} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';

import Select from '~/components/Select';
import Table from './Table';
import View from '~/components/HyperParameterPage/View';
import type {ViewData} from '~/resource/hyper-parameter';
import {rem} from '~/utils/style';
import {safeSplit} from '~/utils';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const TABLE_ORDER_STORAGE_KEY = 'hyper-parameter-table-view-table-order';

const Wrapper = styled(View)`
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
`;

const OrderSection = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: ${rem(20)};

    > span {
        margin-right: 0.5em;

        &:not(:first-child) {
            margin-left: 1.5em;
        }
    }

    > .order-select {
        width: ${rem(160)};
    }
`;

const TableSection = styled.div`
    width: 100%;
`;

type TableViewProps = ViewData;

const TableView: FunctionComponent<TableViewProps> = ({indicators, list, data}) => {
    const {t} = useTranslation('hyper-parameter');

    const indicatorNameList = useMemo(() => indicators.map(({name}) => name), [indicators]);

    const indicatorOrderList = useMemo(
        () => [
            {value: DEFAULT_ORDER_INDICATOR, label: t('hyper-parameter.order-default')},
            ...indicatorNameList.map(value => ({value, label: value}))
        ],
        [indicatorNameList, t]
    );
    const [indicatorOrder, setIndicatorOrder] = useState<string | symbol>(DEFAULT_ORDER_INDICATOR);

    const orderDirectionList = useMemo(
        () =>
            [OrderDirection.ASCENDING, OrderDirection.DESCENDING].map(value => ({
                value,
                label: t(`hyper-parameter:order-direction-value.${value}`)
            })),
        [t]
    );
    const [orderDirection, setOrderDirection] = useState(OrderDirection.ASCENDING);

    const sortBy = useMemo(
        () =>
            indicatorOrder === DEFAULT_ORDER_INDICATOR
                ? []
                : [{id: indicatorOrder as string, desc: orderDirection === OrderDirection.DESCENDING}],
        [orderDirection, indicatorOrder]
    );

    const [columnOrder, setColumnOrder] = useState<string[]>(
        safeSplit(window.sessionStorage.getItem(TABLE_ORDER_STORAGE_KEY) ?? '', ',')
    );
    const changeOrder = useCallback(
        (order: string[]) => {
            const filterOrder = order.filter(o => indicatorNameList.includes(o));
            setColumnOrder(filterOrder);
            window.sessionStorage.setItem(TABLE_ORDER_STORAGE_KEY, filterOrder.join(','));
        },
        [indicatorNameList]
    );

    return (
        <Wrapper>
            <OrderSection>
                <span>{t('hyper-parameter:order-by')}</span>
                <Select
                    className="order-select"
                    list={indicatorOrderList}
                    value={indicatorOrder}
                    onChange={setIndicatorOrder}
                />
                {indicatorOrder !== DEFAULT_ORDER_INDICATOR ? (
                    <>
                        <span>{t('hyper-parameter:order-direction')}</span>
                        <Select
                            className="order-select"
                            list={orderDirectionList}
                            value={orderDirection}
                            onChange={setOrderDirection}
                        />
                    </>
                ) : null}
            </OrderSection>
            <TableSection>
                <Table
                    indicators={indicators}
                    list={list}
                    data={data}
                    sortBy={sortBy}
                    expand
                    columnOrder={columnOrder}
                    onOrderChange={changeOrder}
                />
            </TableSection>
        </Wrapper>
    );
};

export default TableView;
