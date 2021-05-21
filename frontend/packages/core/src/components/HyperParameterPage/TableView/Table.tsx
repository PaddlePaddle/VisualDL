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

import type {Column, Row, SortingRule, TableKeyedProps} from 'react-table';
import {ExpandContainer, TBody, THead, Table, Td, Tr} from '~/components/Table';
import type {IndicatorGroup, ViewData} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {color, colorAlt} from '~/utils/chart';
import {useColumnOrder, useExpanded, useFlexLayout, useResizeColumns, useSortBy, useTable} from 'react-table';

import Cell from './Cell';
import {DndProvider} from 'react-dnd';
import DraggableTh from './DraggableTh';
import {HTML5Backend} from 'react-dnd-html5-backend';
import Header from './Header';
import MetricGraphs from '~/components/HyperParameterPage/MetricGraphs';
import type {MetricGraphsProps} from '~/components/HyperParameterPage/MetricGraphs';
import MetricsHeader from './MetricsHeader';
import NameCell from './NameCell';
import NameHeader from './NameHeader';
import classNames from 'classnames';
import useClassNames from '~/hooks/useClassNames';
import {useSticky} from 'react-table-sticky';

type TableViewTableProps = ViewData & {
    sortBy?: SortingRule<string>[];
    expand?: boolean;
    expandAll?: boolean;
};
type Data = TableViewTableProps['list'][number];

const TableViewTable: FunctionComponent<TableViewTableProps> = ({
    indicators,
    list: data,
    sortBy,
    expand,
    expandAll
}) => {
    const table = useRef<HTMLDivElement>(null);

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
                Header: expand ? NameHeader : Header,
                Cell: expand ? NameCell : Cell,
                width: 200,
                sticky: 'left',
                draggable: false
            },
            ...indicators.map(({name, group}) => ({
                accessor: `${group}.${name}` as IndicatorGroup, // fix react-table's type error
                id: name,
                Header: group === 'metrics' ? MetricsHeader : Header,
                minWidth: 200
            }))
        ],
        [expand, indicators]
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
        columns: tableColumns,
        allColumns
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            initialState: {
                sortBy: sortBy ?? []
            },
            autoResetExpanded: false
        },
        useFlexLayout,
        useSticky,
        useResizeColumns,
        useSortBy,
        useColumnOrder,
        useExpanded
    );

    useEffect(() => {
        allColumns.forEach(column => {
            const indicator = indicators.find(i => i.name === column.id);
            if (indicator) {
                column.toggleHidden(!indicator.selected);
            }
        });
    }, [allColumns, indicators]);
    useEffect(() => setSortBy(sortBy ?? []), [setSortBy, sortBy]);

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
            const originalIndex = orderedColumnIds.findIndex(id => id === draggingColumnId);
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
        [draggingColumnId, orderedColumnIds, setColumnOrder]
    );

    const [tableWidth, setTableWidth] = useState(0);
    useLayoutEffect(() => {
        const t = table.current;
        if (t) {
            const observer = new ResizeObserver(() => {
                const rect = t.getBoundingClientRect();
                setTableWidth(rect.width);
            });
            observer.observe(t);
            return () => observer.unobserve(t);
        }
    }, []);
    const tableClassNames = useClassNames(
        'sticky',
        {
            'is-droppable-left': isTableDroppableLeft,
            'is-droppable-right': isTableDroppableRight
        },
        [isTableDroppableLeft, isTableDroppableRight]
    );
    const getColumnProps = useCallback<(column: Column<Data>) => Partial<TableKeyedProps>>(
        column => ({
            className: classNames({
                'is-sticky': !!column.sticky,
                'is-resizing': state.columnResizing.isResizingColumn === column.id,
                'is-dragging': draggingColumnId === column.id,
                'is-droppable': droppableColumnId === column.id
            }),
            style: {
                position: column.sticky ? 'sticky' : 'relative'
            }
        }),
        [draggingColumnId, droppableColumnId, state.columnResizing.isResizingColumn]
    );
    const getGroupWidthProps = useCallback(() => {
        if (totalColumnsWidth > tableWidth) {
            return {
                style: {
                    width: 'fit-content'
                }
            };
        }
        return {
            style: {
                width: 'auto'
            }
        };
    }, [tableWidth, totalColumnsWidth]);
    const getExpanderWidthProps = useCallback(() => {
        if (totalColumnsWidth > tableWidth) {
            return {
                style: {
                    width: tableWidth - 2
                }
            };
        }
        return {
            style: {
                width: 'auto'
            }
        };
    }, [tableWidth, totalColumnsWidth]);

    const getRowMetricGraphsProps = useCallback<(row: Row<ViewData['list'][number]>) => MetricGraphsProps>(
        ({index, values}) => {
            return {
                metrics: indicators.filter(i => i.group === 'metrics' && i.selected).map(i => i.name),
                run: {
                    label: values.name,
                    colors: [color[index % color.length], colorAlt[index % colorAlt.length]]
                }
            };
        },
        [indicators]
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <Table
                {...getTableProps({
                    className: tableClassNames,
                    style: {
                        // sticky table doesn't need min-width in table style
                        minWidth: 'unset'
                    }
                })}
                ref={table}
            >
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
                                {row.isExpanded || expandAll ? (
                                    <ExpandContainer {...getExpanderWidthProps()}>
                                        <MetricGraphs {...getRowMetricGraphsProps(row)} />
                                    </ExpandContainer>
                                ) : null}
                            </React.Fragment>
                        );
                    })}
                </TBody>
            </Table>
        </DndProvider>
    );
};

export default TableViewTable;
