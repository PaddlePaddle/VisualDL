import Vue from 'vue';
import {injectGlobal, StyledComponent} from 'vue-styled-components';
import {rem as rem16} from 'polished';

const fontSize = '14px';
export const rem = (pxval: string | number): string => rem16(pxval, fontSize);

// sizes
export const headerHeight = rem(60);
export const asideWidth = rem(260);

// colors
export const primaryColor = '#1527C2';
export const textColor = '#333';
export const bodyBackground = '#F4F4F4';

// transitions
export const duration = '75ms';
export const easing = 'ease-in';

injectGlobal`
    @import url('https://fonts.googleapis.com/css?family=Merriweather+Sans:400,700');

    html {
        font-size: ${fontSize};
        font-family: 'Merriweather Sans', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    html,
    body {
        height: 100%;
        background: ${bodyBackground};
        color: ${textColor};
    }

    a {
        text-decoration: none;
        color: inherit;

        &:visited {
            color: currentColor;
        }
    }
`;

export const styledNuxtLink = <T extends {}>(styledComponent: StyledComponent<T>): StyledComponent<T> =>
    styledComponent.withComponent(Vue.component('NuxtLink').options);
