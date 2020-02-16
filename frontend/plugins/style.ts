import {injectGlobal} from 'vue-styled-components';
import {rem as rem16} from 'polished';

const fontSize = '14px';
export const rem = (pxval: string | number): string => rem16(pxval, fontSize);

// sizes


// colors
export const primaryColor = '#1527C2';
export const bodyBackground = '#F4F4F4';

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
    }

    a {
        text-decoration: none;

        &:visited {
            color: currentColor;
        }
    }
`;
