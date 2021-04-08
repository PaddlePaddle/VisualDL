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

import React, {FunctionComponent, useCallback, useLayoutEffect, useRef, useState} from 'react';
import {WithStyled, asideWidth, rem, transitionProps} from '~/utils/style';

import styled from 'styled-components';

export const AsideSection = styled.section`
    margin: ${rem(20)};

    &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: ${rem(20)};
        margin-bottom: 0;
        ${transitionProps('border-color')}
    }
`;

const Wrapper = styled.div.attrs<{width: string | number}>(({width}) => ({
    style: {
        width: 'number' === typeof width ? `${width}px` : width
    }
}))<{width: string | number}>`
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;

    > .aside-top {
        flex: auto;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: auto;
        overflow-x: hidden;
        overflow-y: auto;

        > ${AsideSection} {
            flex: none;
        }
    }

    > .aside-bottom {
        flex: none;
        box-shadow: 0 -${rem(5)} ${rem(16)} 0 rgba(0, 0, 0, 0.03);
        padding: ${rem(20)};
    }

    > .aside-resize-bar-left,
    > .aside-resize-bar-right {
        position: absolute;
        width: ${rem(8)};
        height: 100%;
        top: 0;
        cursor: col-resize;
        user-select: none;

        &.aside-resize-bar-left {
            left: 0;
        }
        &.aside-resize-bar-right {
            right: 0;
        }
    }
`;

type AsideProps = {
    width?: string | number;
    bottom?: React.ReactNode;
    resizable?: 'left' | 'right';
    minWidth?: number;
    maxWidth?: number;
    onResized?: (width: number) => unknown;
};

const Aside: FunctionComponent<AsideProps & WithStyled> = ({
    width,
    bottom,
    resizable,
    minWidth,
    maxWidth,
    onResized,
    className,
    children
}) => {
    const [sideWidth, setSideWidth] = useState<NonNullable<typeof width>>(width ?? asideWidth);
    const ref = useRef<HTMLDivElement>(null);
    const resizing = useRef<boolean>(false);
    const range = useRef({
        min: minWidth ?? null,
        max: maxWidth ?? null
    });

    useLayoutEffect(() => {
        range.current.min = minWidth ?? null;
    }, [minWidth]);
    useLayoutEffect(() => {
        range.current.max = maxWidth ?? null;
    }, [maxWidth]);

    useLayoutEffect(() => {
        if (range.current.min == null && ref.current) {
            const {width} = ref.current.getBoundingClientRect();
            range.current.min = width;
        }
    }, []);

    const mousedown = useCallback(() => {
        resizing.current = true;
    }, []);

    const mousemove = useCallback(
        (event: MouseEvent) => {
            if (ref.current && resizing.current) {
                const clientX = event.clientX;
                const {left, right} = ref.current.getBoundingClientRect();
                let w = 0;
                if (resizable === 'left') {
                    w = Math.max(range.current.min ?? 0, right - clientX);
                } else if (resizable === 'right') {
                    w = Math.max(range.current.min ?? 0, clientX - left);
                }
                w = Math.min(range.current.max ?? document.body.clientWidth / 2, w);
                setSideWidth(w);
            }
        },
        [resizable]
    );

    const mouseup = useCallback(() => {
        resizing.current = false;
        if (ref.current) {
            onResized?.(ref.current.getBoundingClientRect().width);
        }
    }, [onResized]);

    useLayoutEffect(() => {
        document.addEventListener('mousemove', mousemove);
        return () => document.removeEventListener('mousemove', mousemove);
    }, [mousemove]);
    useLayoutEffect(() => {
        document.addEventListener('mouseup', mouseup);
        return () => document.removeEventListener('mouseup', mouseup);
    }, [mouseup]);

    return (
        <Wrapper width={sideWidth} className={className} ref={ref}>
            {resizable ? <div className={`aside-resize-bar-${resizable}`} onMouseDown={mousedown}></div> : null}
            <div className="aside-top">{children}</div>
            {bottom && <div className="aside-bottom">{bottom}</div>}
        </Wrapper>
    );
};

export default Aside;
