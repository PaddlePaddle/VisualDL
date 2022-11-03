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

// cSpell:words pxval mixins grayscale

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away-subtle.css';
import 'react-toastify/dist/ReactToastify.css';

import * as polished from 'polished';

import {colors, variables} from '~/utils/theme';
import {createGlobalStyle, keyframes} from 'styled-components';

import {css} from 'styled-components';

export * from 'styled-components';
export * from 'polished';
// rename conflict shorthands
export {
    borderRadius as borderRadiusShortHand,
    borderColor as borderColorShortHand,
    fontFace as fontFaceShortHand
} from 'polished';

const {math, size, normalize, transitions, border, position} = polished;

// sizes
export const fontSize = '14px';
export const setRem = () => {
    //  PC端
    // 基准大小
    const baseSize = 14;
    const scale = document.documentElement.clientWidth / 1220;
    document.documentElement.style.fontSize = baseSize * scale + 'px';
};
// 初始化
// setRem(fontSize);
// 改变窗口大小时重新设置 rem
// window.onresize = function () {
//     setRem(fontSize);
// };
export const rem = (pxval: string | number): string => polished.rem(pxval, fontSize);
export const em = (pxval: string | number, base?: string | number): string => polished.em(pxval, base || fontSize);
export const half = (value: string | number): string => math(`(${value}) / 2`);
export const headerHeight = rem(60);
export const contentMargin = rem(20);
export const contentHeight = `calc(100vh - ${math(`${contentMargin} * 2 + ${headerHeight}`)})`;
export const asideWidth = rem(260);
export const borderRadius = '4px';
export const progressSpinnerSize = '20px';

export const zIndexes = {
    progress: 99999,
    toast: 90000,
    tooltip: 80000,
    component: 30000,
    dialog: 20000,
    header: 10000
};

// shims
// TODO: remove and use colors in theme instead
export const primaryColor = colors.primary.default;
export const primaryFocusedColor = colors.primary.focused;
export const primaryActiveColor = colors.primary.active;

// transitions
export const duration = '75ms';
export const easing = 'ease-in';

// mixins
export const sameBorder = (
    width = '1px' as
        | string
        | number
        | true
        | {width?: string | number; type?: string; color?: string; radius?: string | boolean},
    type = 'solid',
    color = 'var(--border-color)',
    radius?: string | boolean
) => {
    if ('object' === typeof width) {
        type = width.type ?? 'solid';
        color = width.color ?? 'var(--border-color)';
        radius = width.radius === true ? borderRadius : width.radius;
        width = width.width ?? '1px';
    } else if (width === true) {
        width = '1px';
        radius = true;
    }
    return Object.assign(
        {},
        border(width, type, color),
        radius ? {borderRadius: radius === true ? borderRadius : radius} : undefined
    );
};
export const transitionProps = (props: string | string[], args?: string | {duration?: string; easing?: string}) => {
    if ('string' === typeof props) {
        props = [props];
    }
    if ('string' !== typeof args) {
        args = `${args?.duration ?? duration} ${args?.easing ?? easing}`;
    }
    return transitions(props, args);
};

export const link = css`
    a {
        color: var(--primary-color);
        cursor: pointer;
        ${transitionProps('color')};

        &:hover {
            color: var(--primary-focused-color);
        }

        &:active {
            color: var(--primary-active-color);
        }
    }
`;

export const dragger = css`
    --padding-v: ${em(8, 14)};
    --padding-h: ${em(6, 14)};

    width: ${em(6, 14)};
    height: ${em(10, 14)};
    box-sizing: content-box;
    padding: var(--padding-v) var(--padding-h);
    cursor: grab;
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

const spinner = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

export type WithStyled = {
    className?: string;
};

// prettier-ignore
export const GlobalStyle = createGlobalStyle`
    ${normalize}

    ${variables}

    html {
        font-size: ${fontSize};
        font-family: 'Merriweather Sans', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    html,
    body {
        min-height: 100%;
        background-color: var(--body-background-color);
        color: var(--text-color);
        ${transitionProps(['background-color', 'color'])}
    }

    body {
        overflow-anchor: none;
    }

    a {
        text-decoration: none;
        color: inherit;

        &:visited {
            color: currentColor;
        }
    }

    * {
        box-sizing: border-box;
    }

    #nprogress {
        pointer-events: none;
    }

    #nprogress .bar {
        background-color: var(--progress-bar-color);
        z-index: ${zIndexes.progress};
        ${position('fixed', 0, null, null, 0)}
        ${size('2px', '100%')}
        ${transitionProps('background-color')}
    }

    #nprogress .peg {
        display: block;
        ${position('absolute', null, 0, null, null)}
        ${size('100%', rem(100))}
        box-shadow: 0 0 rem(10) var(--progress-bar-color), 0 0 ${rem(5)} var(--progress-bar-color);
        opacity: 1;
        transform: rotate(3deg) translate(0px, -${rem(4)});
        ${transitionProps('box-shadow')}
    }

    #nprogress .spinner {
        display: block;
        z-index: ${zIndexes.progress};
        ${position('fixed', progressSpinnerSize, progressSpinnerSize, null, null)}
    }

    #nprogress .spinner-icon {
        ${size(`calc(${half(headerHeight)} - ${half(progressSpinnerSize)})`)}
        box-sizing: border-box;

        border: solid 2px transparent;
        border-top-color: var(--progress-bar-color);
        border-left-color: var(--progress-bar-color);
        border-radius: 50%;

        animation: ${spinner} 400ms linear infinite;

        ${transitionProps('border-color')}
    }

    .nprogress-custom-parent {
        overflow: hidden;
        position: relative;
    }

    .nprogress-custom-parent #nprogress .spinner,
    .nprogress-custom-parent #nprogress .bar {
        position: absolute;
    }

    .Toastify__toast-container {
        z-index: ${zIndexes.toast};
    }

    [data-tippy-root] .tippy-box {
        z-index: ${zIndexes.tooltip};
        color: var(--text-color);
        background-color: var(--background-color);
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        border-radius: ${borderRadius};
        ${transitionProps(['color', 'background-color'])}

        > .tippy-content {
            padding: 0;
            /* trigger bfc */
            display: flow-root;
        }

        > .tippy-arrow {
            ${transitionProps('border-color')}
        }

        &[data-placement^='top'] > .tippy-arrow::before {
            border-top-color: var(--background-color);
        }
        &[data-placement^='bottom'] > .tippy-arrow::before {
            border-bottom-color: var(--background-color);
        }
        &[data-placement^='left'] > .tippy-arrow::before {
            border-left-color: var(--background-color);
        }
        &[data-placement^='right'] > .tippy-arrow::before {
            border-right-color: var(--background-color);
        }

        &[data-theme~='tooltip'] {
            color: var(--tooltip-text-color);
            background-color: var(--tooltip-background-color);
            box-shadow: none;

            > .tippy-content {
                padding: ${rem(5)} ${rem(9)};
            }

            &[data-placement^='top'] > .tippy-arrow::before {
                border-top-color: var(--tooltip-background-color);
            }
            &[data-placement^='bottom'] > .tippy-arrow::before {
                border-bottom-color: var(--tooltip-background-color);
            }
            &[data-placement^='left'] > .tippy-arrow::before {
                border-left-color: var(--tooltip-background-color);
            }
            &[data-placement^='right'] > .tippy-arrow::before {
                border-right-color: var(--tooltip-background-color);
            }
        }
    }
`;
