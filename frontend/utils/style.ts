import {createGlobalStyle, keyframes} from 'styled-components';
import {rem as rem16, em as em16, math, normalize, darken, lighten, size} from 'polished';
import vdlIcon from '!!css-loader!~/public/style/vdl-icon.css';
export {default as styled} from 'styled-components';
export * from 'styled-components';
export * from 'polished';

const fontSize = '14px';
export const rem = (pxval: string | number): string => rem16(pxval, fontSize);
export const em = (pxval: string | number, base?: string | number): string => em16(pxval, base || fontSize);
export const half = (value: string | number): string => math(`${value} / 2`);

// sizes
export const headerHeight = rem(60);
export const asideWidth = rem(260);
export const borderRadius = '4px';
export const progressSpinnerSize = '20px';

// colors
export const headerColor = '#1527C2';
export const primaryColor = '#2932E1';
export const primaryFocusedColor = lighten(0.08, primaryColor);
export const primaryActiveColor = lighten(0.12, primaryColor);
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
export const progressBarColor = '#FFF';
export const maskColor = 'rgba(255, 255, 255, 0.8)';

// transitions
export const duration = '75ms';
export const easing = 'ease-in';

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

    @font-face {
        font-family: 'vdl-icon';
        src: url("${process.env.PUBLIC_PATH}/style/fonts/vdl-icon.ttf?5sp5gl") format('truetype'),
            url("${process.env.PUBLIC_PATH}/style/fonts/vdl-icon.woff?5sp5gl") format('woff'),
            url("${process.env.PUBLIC_PATH}/style/fonts/vdl-icon.svg?5sp5gl#vdl-icon") format('svg');
        font-weight: normal;
        font-style: normal;
        font-display: block;
    }

    ${vdlIcon.toString()}

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

        position: fixed;
        z-index: 99999;
        top: 0;
        left: 0;

        width: 100%;
        height: 2px;
    }

    #nprogress .peg {
        display: block;
        position: absolute;
        right: 0;
        width: ${rem(100)};
        height: 100%;
        box-shadow: 0 0 rem(10) ${progressBarColor}, 0 0 ${rem(5)} ${progressBarColor};
        opacity: 1;
        transform: rotate(3deg) translate(0px, -${rem(4)});
    }

    #nprogress .spinner {
        display: block;
        position: fixed;
        z-index: 99999;
        top: ${progressSpinnerSize};
        right: ${progressSpinnerSize};
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
`;
