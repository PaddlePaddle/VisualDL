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

import React, {CSSProperties, FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';
import {useDrag, useDrop} from 'react-dnd';

import {DND_TYPE} from '~/resource/hyper-parameter';
import {Dragger} from '~/components/Table';
import {Th} from '~/components/Table';
import type {WithStyled} from '~/utils/style';

interface DraggableHeaderProps {
    style?: CSSProperties;
    id?: string;
    draggable?: boolean;
    onDragStart?: (id: string) => unknown;
    onDragEnd?: (id: string) => unknown;
    onChangeDropSide?: (id: string, side: 'before' | 'after') => unknown;
    onDrop?: (id: string, side: 'before' | 'after') => unknown;
}

interface DragItem {
    id: string;
}

const DraggableHeader: FunctionComponent<DraggableHeaderProps & WithStyled> = ({
    id,
    draggable,
    onDragStart,
    onDragEnd,
    onChangeDropSide,
    onDrop,
    className,
    style,
    children
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{isDragging}, drag, preview] = useDrag(() => ({
        type: DND_TYPE,
        item: {
            id: id ?? ''
        },
        options: {
            dropEffect: 'move'
        },
        previewOptions: {
            offsetX: 8,
            offsetY: 25
        },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    }));
    const start = useRef(onDragStart);
    useEffect(() => {
        start.current = onDragStart;
    }, [onDragStart]);
    const end = useRef(onDragEnd);
    useEffect(() => {
        end.current = onDragEnd;
    }, [onDragEnd]);
    useEffect(() => {
        if (isDragging) {
            start.current?.(id ?? '');
        } else {
            end.current?.(id ?? '');
        }
    }, [id, isDragging]);

    const [dropSide, setDropSide] = useState<'before' | 'after' | null>(null);
    const dropFn = useCallback(() => {
        if (dropSide) {
            onDrop?.(id ?? '', dropSide);
        }
    }, [dropSide, id, onDrop]);
    const dropFnRef = useRef(dropFn);
    useEffect(() => {
        dropFnRef.current = dropFn;
    }, [dropFn]);
    const [{handlerId}, drop] = useDrop(() => ({
        accept: DND_TYPE,
        collect: monitor => ({
            handlerId: monitor.getHandlerId()
        }),
        canDrop: () => !!draggable,
        hover: (item: DragItem, monitor) => {
            if (!ref.current) {
                return;
            }
            if (!monitor.canDrop()) {
                return;
            }
            const rect = ref.current?.getBoundingClientRect();
            if (rect) {
                const middle = (rect.right - rect.left) / 2;
                const clientOffset = monitor.getClientOffset();
                if (clientOffset) {
                    const offsetX = clientOffset.x - rect.left;
                    if (offsetX < middle) {
                        setDropSide('before');
                    } else {
                        setDropSide('after');
                    }
                }
            }
        },
        drop: (item: DragItem) => {
            dropFnRef.current();
            return item;
        }
    }));
    const changeSide = useRef(onChangeDropSide);
    useEffect(() => {
        changeSide.current = onChangeDropSide;
    }, [onChangeDropSide]);
    useEffect(() => {
        if (dropSide && id) {
            changeSide.current?.(id, dropSide);
        }
    }, [dropSide, id]);

    preview(drop(ref));

    return (
        <Th ref={ref} data-handler-id={handlerId} className={className} style={style}>
            {draggable ? <Dragger ref={drag} /> : null}
            {children}
        </Th>
    );
};

export default DraggableHeader;
