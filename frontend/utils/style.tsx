import {createGlobalStyle, keyframes} from 'styled-components';
import {rem as rem16, em as em16, math, normalize, darken} from 'polished';

export {default as styled} from 'styled-components';
export * from 'styled-components';
export * from 'polished';

const fontSize = '14px';
export const rem = (pxval: string | number): string => rem16(pxval, fontSize);
export const em = (pxval: string | number): string => em16(pxval, fontSize);

// sizes
export const headerHeight = rem(60);
export const asideWidth = rem(260);
export const borderRadius = '4px';
export const progressSpinnerSize = '20px';

// colors
export const headerColor = '#1527C2';
export const primaryColor = '#2932E1';
export const selectedColor = '#1A73E8';
export const lightColor = '#F4F5FC';
export const textColor = '#333';
export const textLightColor = '#999';
export const bodyBackgroundColor = '#F4F4F4';
export const backgroundColor = '#FFF';
export const backgroundFocusedColor = '#F6F6F6';
export const borderColor = '#DDD';
export const borderFocusedColor = darken(0.15, borderColor);
export const progressBarColor = '#FFF';

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

export const GlobalStyle = createGlobalStyle`
    ${normalize}

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
        z-index: 1031;
        top: 0;
        left: 0;

        width: 100%;
        height: 2px;
    }

    #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px ${progressBarColor}, 0 0 5px ${progressBarColor};
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
    }

    #nprogress .spinner {
        display: block;
        position: fixed;
        z-index: 1031;
        top: ${progressSpinnerSize};
        right: ${progressSpinnerSize};
    }

    #nprogress .spinner-icon {
        width: calc(${math(`${headerHeight} / 2`)} - ${math(`${progressSpinnerSize} / 2`)});
        height: calc(${math(`${headerHeight} / 2`)} - ${math(`${progressSpinnerSize} / 2`)});
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
