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

import type {Column, TableKeyedProps} from 'react-table';
import {DEFAULT_ORDER_INDICATOR, OrderDirection} from '~/resource/hyper-parameter';
import {ExpandContainer, TBody, THead, Table, Td, Tr} from '~/components/Table';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useColumnOrder, useExpanded, useFlexLayout, useResizeColumns, useSortBy, useTable} from 'react-table';

import {DndProvider} from 'react-dnd';
import DraggableTh from './DraggableTh';
import {HTML5Backend} from 'react-dnd-html5-backend';
import Header from './Header';
import MetricsHeader from './MetricsHeader';
import NameCell from './NameCell';
import NameHeader from './NameHeader';
import Select from '~/components/Select';
import type {ViewData} from '~/resource/hyper-parameter';
import classNames from 'classnames';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import {useSticky} from 'react-table-sticky';
import {useTranslation} from 'react-i18next';

const Wrapper = styled.div`
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

type TableViewProps = ViewData<string>;
type Data = TableViewProps['list'][number];

const TableView: FunctionComponent<TableViewProps> = ({indicators, list: data}) => {
    const {t} = useTranslation('hyper-parameter');

    const table = useRef<HTMLDivElement>(null);

    const indicatorList = useMemo(
        () => [...indicators.hparams.map(({name}) => name), ...indicators.metrics.map(({name}) => name)],
        [indicators.hparams, indicators.metrics]
    );

    const orderIndicatorList = useMemo(
        () => [
            {value: DEFAULT_ORDER_INDICATOR, label: t('hyper-parameter.order-default')},
            ...indicatorList.map(value => ({value, label: value}))
        ],
        [indicatorList, t]
    );
    const [orderIndicator, setOrderIndicator] = useState<string | symbol>(DEFAULT_ORDER_INDICATOR);

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
            orderIndicator === DEFAULT_ORDER_INDICATOR
                ? []
                : [{id: orderIndicator as string, desc: orderDirection === OrderDirection.DESCENDING}],
        [orderDirection, orderIndicator]
    );

    const defaultColumn = useMemo(
        () => ({
            minWidth: 100,
            draggable: true
        }),
        []
    );

    const columns: Column<Data>[] = useMemo(
        () => [
            {
                accessor: 'name',
                Header: NameHeader,
                Cell: NameCell,
                width: 200,
                sticky: 'left',
                draggable: false
            },
            ...indicators.hparams.map(({name}) => ({
                accessor: `hparams.${name}` as 'hparams',
                id: name,
                Header: Header,
                minWidth: 200
            })),
            ...indicators.metrics.map(({name}) => ({
                accessor: `metrics.${name}` as 'metrics',
                id: name,
                Header: MetricsHeader,
                minWidth: 200
            }))
        ],
        [indicators.hparams, indicators.metrics]
    );

    const {
        getTableProps,
        headerGroups,
        rows,
        prepareRow,
        setSortBy,
        setColumnOrder,
        state,
        totalColumnsWidth,
        columns: tableColumns
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            initialState: {
                sortBy
            }
        },
        useFlexLayout,
        useSticky,
        useResizeColumns,
        useSortBy,
        useColumnOrder,
        useExpanded
    );

    useEffect(() => setSortBy(sortBy), [setSortBy, sortBy]);

    const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
    const [droppableColumn, setDroppableColumn] = useState<[string, 'before' | 'after'] | null>(null);
    const startDrag = useCallback((id: string) => setDraggingColumnId(id), []);
    const stopDrag = useCallback(() => setDraggingColumnId(null), []);
    const changeDropSide = useCallback((id: string, side: 'before' | 'after') => setDroppableColumn([id, side]), []);
    const orderedColumnIds = useMemo(
        () => (state.columnOrder.length ? state.columnOrder : tableColumns.map(c => c.id)),
        [state.columnOrder, tableColumns]
    );
    const droppableColumnId = useMemo(() => {
        if (draggingColumnId != null && droppableColumn != null) {
            const [id, side] = droppableColumn;
            const index = orderedColumnIds.findIndex(c => c === id);
            if (side === 'before' && index > 0) {
                return orderedColumnIds[index - 1];
            } else if (side === 'after' && index < orderedColumnIds.length - 1) {
                return orderedColumnIds[index];
            }
        }
        return null;
    }, [draggingColumnId, droppableColumn, orderedColumnIds]);
    const isTableDroppableLeft = useMemo(
        () =>
            draggingColumnId != null &&
            droppableColumn &&
            droppableColumn[1] === 'before' &&
            tableColumns[0]?.id === droppableColumn[0],
        [draggingColumnId, droppableColumn, tableColumns]
    );
    const isTableDroppableRight = useMemo(
        () =>
            draggingColumnId != null &&
            droppableColumn &&
            droppableColumn[1] === 'after' &&
            tableColumns[tableColumns.length - 1]?.id === droppableColumn[0],
        [draggingColumnId, droppableColumn, tableColumns]
    );
    const drop = useCallback(
        (id: string, side: 'before' | 'after') => {
            if (draggingColumnId == null) {
                return;
            }
            const ids = orderedColumnIds.filter(id => id !== draggingColumnId);
            const originalIndex = tableColumns.findIndex(c => c.id === draggingColumnId);
            const index = ids.findIndex(c => c === id);
            let insert: number | null = null;
            if (index === -1) {
                insert = originalIndex;
            } else if (side === 'before') {
                insert = index;
            } else if (side === 'after') {
                insert = index + 1;
            }
            if (insert != null) {
                ids.splice(insert, 0, draggingColumnId);
                setColumnOrder(ids);
            }
        },
        [draggingColumnId, orderedColumnIds, setColumnOrder, tableColumns]
    );

    const tableProps = useMemo(
        () => ({
            className: classNames({
                sticky: true,
                'is-droppable-left': isTableDroppableLeft,
                'is-droppable-right': isTableDroppableRight
            })
        }),
        [isTableDroppableLeft, isTableDroppableRight]
    );
    const getColumnProps = useCallback<(column: Column<Data>) => Partial<TableKeyedProps>>(
        column => ({
            className: classNames({
                'is-sticky': !!column.sticky,
                'is-resizing': state.columnResizing.isResizingColumn === column.id,
                'is-dragging': draggingColumnId === column.id,
                'is-droppable': droppableColumnId === column.id
            })
        }),
        [draggingColumnId, droppableColumnId, state.columnResizing.isResizingColumn]
    );
    const getGroupWidthProps = useCallback(() => {
        if (table.current) {
            const rect = table.current.getBoundingClientRect();
            if (totalColumnsWidth > rect.width) {
                return {
                    style: {
                        width: 'fit-content'
                    }
                };
            }
        }
        return {
            style: {
                width: 'auto'
            }
        };
    }, [totalColumnsWidth]);

    return (
        <Wrapper>
            <OrderSection>
                <span>{t('hyper-parameter:order-by')}</span>
                <Select
                    className="order-select"
                    list={orderIndicatorList}
                    value={orderIndicator}
                    onChange={setOrderIndicator}
                />
                {orderIndicator !== DEFAULT_ORDER_INDICATOR ? (
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
                <DndProvider backend={HTML5Backend}>
                    <Table {...getTableProps()} {...tableProps} ref={table}>
                        <THead {...getGroupWidthProps()}>
                            {headerGroups.map(headerGroup => (
                                // eslint-disable-next-line react/jsx-key
                                <Tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        // eslint-disable-next-line react/jsx-key
                                        <DraggableTh
                                            {...column.getHeaderProps([
                                                {
                                                    className: column.className,
                                                    style: column.style
                                                },
                                                getColumnProps(column)
                                            ])}
                                            id={column.id}
                                            draggable={column.draggable}
                                            onDragStart={startDrag}
                                            onDragEnd={stopDrag}
                                            onChangeDropSide={changeDropSide}
                                            onDrop={drop}
                                        >
                                            {column.render('Header')}
                                        </DraggableTh>
                                    ))}
                                </Tr>
                            ))}
                        </THead>
                        <TBody {...getGroupWidthProps()}>
                            {rows.map(row => {
                                prepareRow(row);
                                const {key, ...rowProps} = row.getRowProps();
                                return (
                                    <React.Fragment key={key}>
                                        <Tr {...rowProps}>
                                            {row.cells.map(cell => (
                                                // eslint-disable-next-line react/jsx-key
                                                <Td
                                                    {...cell.getCellProps([
                                                        {
                                                            className: cell.column.className,
                                                            style: cell.column.style
                                                        },
                                                        getColumnProps(cell.column)
                                                    ])}
                                                >
                                                    {cell.render('Cell')}
                                                </Td>
                                            ))}
                                        </Tr>
                                        {row.isExpanded ? <ExpandContainer>aaaa</ExpandContainer> : null}
                                    </React.Fragment>
                                );
                            })}
                        </TBody>
                    </Table>
                </DndProvider>
            </TableSection>
        </Wrapper>
    );
};

export default TableView;
