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

import {css, em, rem, sameBorder} from '~/utils/style';

import styled from 'styled-components';

const Dragger = styled.span<{dragging?: boolean}>`
    --padding-v: ${em(8, 14)};
    --padding-h: ${em(6, 14)};

    width: ${em(6, 14)};
    height: ${em(10, 14)};
    box-sizing: content-box;
    padding: var(--padding-v) var(--padding-h);
    cursor: ${props => (props.dragging ? 'grabbing' : 'grab')};
    display: inline-block;
    position: relative;

    &::before {
        --dot-size: ${em(2, 14)};
        content: '';
        display: block;
        position: absolute;
        width: var(--dot-size);
        height: var(--dot-size);
        background-color: currentColor;
        top: var(--padding-v);
        left: var(--padding-h);
        box-shadow: 0 0, calc(var(--dot-size) * 2) 0, 0 calc(var(--dot-size) * 2),
            calc(var(--dot-size) * 2) calc(var(--dot-size) * 2), 0 calc(var(--dot-size) * 4),
            calc(var(--dot-size) * 2) calc(var(--dot-size) * 4);
    }
`;

const table = css`
    border-spacing: 0;
    ${sameBorder({radius: true})};
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    &.is-droppable-left {
        border-left-color: var(--primary-color);
    }
    &.is-droppable-right {
        border-right-color: var(--primary-color);
    }

    &.sticky {
        overflow: auto;
    }
`;

const group = css``;

const row = css``;

const cell = css`
    --resizer-pad: ${rem(2)};

    margin: 0;
    padding: ${rem(15)} ${rem(20)};
    border-bottom: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
    position: relative;

    &:last-child {
        border-right: none;
    }

    &.is-sticky {
        position: sticky;
    }

    &.is-resizing {
        border-right-color: var(--primary-color);
    }

    &.is-dragging {
        opacity: 0.4;
    }

    &.is-droppable:not(:last-child) {
        border-right-color: var(--primary-color);
    }

    &[data-sticky-td] {
        position: sticky;
    }

    &[data-sticky-last-left-td] {
        box-shadow: 5px 0 3px -3px var(--table-sticky-shadow-color);

        &:not(.is-resizing):not(.is-droppable) {
            border-right-color: var(--table-sticky-shadow-color);
        }
    }
`;

const th = css`
    background-color: var(--table-header-background-color);

    ${Dragger} {
        position: absolute;
        left: var(--resizer-pad);
        top: 50%;
        transform: translateY(-50%);
        color: var(--table-dragger-color);
        opacity: 0;
    }

    &:hover ${Dragger} {
        opacity: 1;
    }
`;

const td = css`
    background-color: var(--table-background-color);

    .tr:hover > & {
        background-color: var(--table-row-hover-background-color);
    }

    .tr:last-child > & {
        border-bottom: none;
    }
`;

const thead = css`
    background-color: var(--table-header-background-color);

    .sticky > & {
        top: 0;
        position: sticky;
        z-index: 1;
    }
`;

const tbody = css`
    .sticky > & {
        position: relative;
        z-index: 0;
    }
`;

const createStyledTableComponent = (name: string) =>
    styled.div.attrs(({className}) => ({
        className: className ? [className, name].join(' ') : name
    }));

// keep next line to fix coding highlight
//``

const Table = createStyledTableComponent('table')`
    ${table};
`;

const THead = createStyledTableComponent('thead')`
    ${group}
    ${thead}
`;

const TBody = createStyledTableComponent('tbody')`
    ${group}
    ${tbody}
`;

const TFoot = createStyledTableComponent('tfoot')`
    ${group}
`;

const Tr = createStyledTableComponent('tr')`
    ${row}
`;

const Th = createStyledTableComponent('th')`
    ${cell}
    ${th}
`;

const Td = createStyledTableComponent('td')`
    ${cell}
    ${td}
`;

const Resizer = styled.span`
    box-sizing: content-box;
    background-clip: content-box;
    width: 1px;
    height: 100%;
    position: absolute;
    top: 0;
    right: calc(var(--resizer-pad) * -1 - 1px);
    z-index: 1;
    touch-action: none;
    border-left: var(--resizer-pad) solid transparent;
    border-right: var(--resizer-pad) solid transparent;

    &:hover {
        background-color: var(--primary-color);
    }

    &.is-resizing {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
    }

    .th:last-child > & {
        display: none;
    }
`;

const Expander = styled.span<{isExpanded: boolean}>`
    display: inline-block;
    position: relative;
    font-size: ${em(16)};
    width: 1em;
    height: 1em;
    ${sameBorder({
        color: 'var(--table-expander-border-color)',
        radius: '0.125em'
    })}
    margin-right: 0.75em;
    color: var(--table-expander-color);

    &::before,
    &::after {
        content: '';
        display: block;
        background-color: currentColor;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    &::before {
        width: 0.5em;
        height: 0.0625em;
    }

    &::after {
        width: 0.0625em;
        height: 0.5em;
        display: ${props => (props.isExpanded ? 'none' : 'block')};
    }

    &:hover {
        color: var(--table-expander-hover-color);
        border-color: var(--table-expander-hover-border-color);
    }
`;

const ExpandContainer = styled.div`
    ${cell}
    background-color: var(--table-header-background-color);
    border-right: none;

    &:last-child {
        border-bottom: none;
    }

    .sticky > .tbody > & {
        position: sticky;
        left: 0;
    }
`;

export {Table, THead, TBody, TFoot, Tr, Th, Td, Resizer, Expander, ExpandContainer, Dragger};
