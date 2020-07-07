import * as polished from 'polished';

import {createGlobalStyle, keyframes} from 'styled-components';

import {css} from 'styled-components';
import getConfig from 'next/config';
import tippy from '!!css-loader!tippy.js/dist/tippy.css';
import toast from '!!css-loader!react-toastify/dist/ReactToastify.css';
import vdlIcon from '!!css-loader!~/public/style/vdl-icon.css';

const PUBLIC_PATH: string = getConfig()?.publicRuntimeConfig?.PUBLIC_PATH ?? '';

export {default as styled} from 'styled-components';
export * from 'styled-components';
export * from 'polished';
// rename conflict shorthands
export {borderRadius as borderRadiusShortHand, borderColor as borderColorShortHand} from 'polished';

const {math, size, lighten, darken, normalize, fontFace, transitions, border, position} = polished;

export const iconFontPath = `${PUBLIC_PATH}/style/fonts/vdl-icon`;

// sizes
const fontSize = '14px';
export const rem = (pxval: string | number): string => polished.rem(pxval, fontSize);
export const em = (pxval: string | number, base?: string | number): string => polished.em(pxval, base || fontSize);
export const half = (value: string | number): string => math(`(${value}) / 2`);
export const headerHeight = rem(60);
export const contentMargin = rem(20);
export const contentHeight = `calc(100vh - ${math(`${contentMargin} * 2 + ${headerHeight}`)})`;
export const asideWidth = rem(260);
export const borderRadius = '4px';
export const progressSpinnerSize = '20px';

// colors
export const primaryColor = '#2932E1';
export const dangerColor = '#FF3912';
export const primaryFocusedColor = lighten(0.08, primaryColor);
export const primaryActiveColor = lighten(0.12, primaryColor);
export const dangerFocusedColor = lighten(0.08, dangerColor);
export const dangerActiveColor = lighten(0.12, dangerColor);
export const selectedColor = '#1A73E8';
export const lightColor = '#F4F5FC';
export const lightFocusedColor = darken(0.03, lightColor);
export const lightActiveColor = darken(0.06, lightColor);
export const textColor = '#333';
export const textLightColor = '#666';
export const textLighterColor = '#999';
export const textInvertColor = '#FFF';
export const bodyBackgroundColor = '#F4F4F4';
export const backgroundColor = '#FFF';
export const backgroundFocusedColor = '#F6F6F6';
export const borderColor = '#DDD';
export const borderFocusedColor = darken(0.15, borderColor);
export const borderActiveColor = darken(0.3, borderColor);
export const navbarBackgroundColor = '#1527C2';
export const navbarHoverBackgroundColor = lighten(0.05, navbarBackgroundColor);
export const navbarHighlightColor = '#596cd6';
export const progressBarColor = '#FFF';
export const maskColor = 'rgba(255, 255, 255, 0.8)';
export const tooltipBackgroundColor = 'rgba(0, 0, 0, 0.6)';
export const tooltipTextColor = '#FFF';

// transitions
export const duration = '75ms';
export const easing = 'ease-in';

// mixins
export const sameBorder = (
    width = '1px' as
        | string
        | number
        | {width?: string | number; type?: string; color?: string; radius?: string | boolean},
    type = 'solid',
    color = borderColor,
    radius?: string | boolean
) => {
    if ('object' === typeof width) {
        type = width.type ?? 'solid';
        color = width.color ?? borderColor;
        radius = width.radius === true ? borderRadius : width.radius;
        width = width.width ?? '1px';
    }
    return Object.assign(
        {},
        border(width, type, color),
        radius ? {borderRadius: radius === true ? borderRadius : radius} : undefined
    );
};
export const transitionProps = (props: string | string[], args?: string) => {
    if ('string' === typeof props) {
        props = [props];
    }
    if (!args) {
        args = `${duration} ${easing}`;
    }
    return transitions(props, args);
};
export const link = css`
    a {
        color: ${primaryColor};
        cursor: pointer;
        ${transitionProps('color')};

        &:hover {
            color: ${primaryFocusedColor};
        }

        &:active {
            color: ${primaryActiveColor};
        }
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

    ${fontFace({
        fontFamily: 'vdl-icon',
        fontFilePath: iconFontPath,
        fileFormats: ['ttf', 'woff', 'svg'],
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontDisplay: 'block'
    })}

    ${vdlIcon.toString()}
    ${toast.toString()}
    ${tippy.toString()}

    html {
        font-size: ${fontSize};
        font-family: 'Merriweather Sans', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    html,
    body {
        height: 100%;
        background-color: ${bodyBackgroundColor};
        color: ${textColor};
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
        background: ${progressBarColor};
        z-index: 99999;
        ${position('fixed', 0, null, null, 0)}
        ${size('2px', '100%')}
    }

    #nprogress .peg {
        display: block;
        ${position('absolute', null, 0, null, null)}
        ${size('100%', rem(100))}
        box-shadow: 0 0 rem(10) ${progressBarColor}, 0 0 ${rem(5)} ${progressBarColor};
        opacity: 1;
        transform: rotate(3deg) translate(0px, -${rem(4)});
    }

    #nprogress .spinner {
        display: block;
        z-index: 99999;
        ${position('fixed', progressSpinnerSize, progressSpinnerSize, null, null)}
    }

    #nprogress .spinner-icon {
        ${size(`calc(${half(headerHeight)} - ${half(progressSpinnerSize)})`)}
        box-sizing: border-box;

        border: solid 2px transparent;
        border-top-color: ${progressBarColor};
        border-left-color: ${progressBarColor};
        border-radius: 50%;

        animation: ${spinner} 400ms linear infinite;
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
        z-index: 10001;

        .Toastify__toast {
            border-radius: ${borderRadius};
        }

        .Toastify__toast--default {
            color: ${textColor};
        }

        .Toastify__toast-body {
            padding: 0 1.428571429em;
        }
    }

    .tippy-box {
        z-index: 10002;
        color: ${tooltipTextColor};
        background-color: ${tooltipBackgroundColor};

        &[data-placement^='top'] > .tippy-arrow::before {
            border-top-color: ${tooltipBackgroundColor};
        }
        &[data-placement^='bottom'] > .tippy-arrow::before {
            border-bottom-color: ${tooltipBackgroundColor};
        }
        &[data-placement^='left'] > .tippy-arrow::before {
            border-left-color: ${tooltipBackgroundColor};
        }
        &[data-placement^='right'] > .tippy-arrow::before {
            border-right-color: ${tooltipBackgroundColor};
        }
    }
`;
