import Vue from 'vue';
import {createComponent} from '@vue/composition-api';
import vueStyled, {injectGlobal, StyledComponent, Styled, VueProps} from 'vue-styled-components';
import {rem as rem16, em as em16} from 'polished';

const fontSize = '14px';
export const rem = (pxval: string | number): string => rem16(pxval, fontSize);
export const em = (pxval: string | number): string => em16(pxval, fontSize);
export * from 'polished';

// sizes
export const headerHeight = rem(60);
export const asideWidth = rem(260);
export const borderRadius = '4px';

// colors
export const headerColor = '#1527C2';
export const primaryColor = '#2932E1';
export const lightColor = '#F4F5FC';
export const textColor = '#333';
export const bodyBackground = '#F4F4F4';
export const borderColor = '#DDD';

// transitions
export const duration = '75ms';
export const easing = 'ease-in';

const myStyled: any = (component: ReturnType<typeof createComponent> | string, props: VueProps) => {
    if ('string' === typeof component) {
        return vueStyled(component, props);
    }
    return vueStyled(
        {
            template: '',
            ...component
        },
        props
    );
};

for (const el of Object.keys(vueStyled)) {
    myStyled[el] = vueStyled[el];
}

export const styled = myStyled as Styled;

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

    * {
        box-sizing: border-box;
    }
`;

export const styledNuxtLink = <T extends {}>(styledComponent: StyledComponent<T>): StyledComponent<T> =>
    styledComponent.withComponent(Vue.component('NuxtLink').options);
