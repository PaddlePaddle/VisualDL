import {darken, lighten} from 'polished';

import {css} from 'styled-components';
import kebabCase from 'lodash/kebabCase';

export type Theme = 'light' | 'dark';

export const THEME: Theme | undefined = import.meta.env.SNOWPACK_PUBLIC_THEME;

export const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

export const autoTheme: Theme = matchMedia.matches ? 'dark' : 'light';

export const theme = THEME || autoTheme;

export const colors = {
    primary: {
        default: '#2932e1',
        focused: lighten(0.08, '#2932e1'),
        active: lighten(0.12, '#2932e1'),
        text: '#fff'
    },
    danger: {
        default: '#ff3912',
        focused: lighten(0.08, '#ff3912'),
        active: lighten(0.12, '#ff3912'),
        text: '#fff'
    }
} as const;

export const themes = {
    light: {
        textColor: '#333',
        textLightColor: '#666',
        textLighterColor: '#999',
        textInvertColor: '#fff',

        backgroundColor: '#fff',
        backgroundFocusedColor: '#f6f6f6',
        bodyBackgroundColor: '#f4f4f4',

        borderColor: '#ddd',
        borderFocusedColor: darken(0.15, '#ddd'),
        borderActiveColor: darken(0.3, '#ddd'),

        navbarTextColor: '#fff',
        navbarBackgroundColor: '#1527c2',
        navbarHoverBackgroundColor: lighten(0.05, '#1527c2'),
        navbarHighlightColor: '#596cd6',

        tagBackgroundColor: '#f4f5fc',
        tagFocusedBackgroundColor: darken(0.03, '#f4f5fc'),
        tagActiveBackgroundColor: darken(0.06, '#f4f5fc'),
        inputBackgroundColor: '#fff',
        selectSelectedTextColor: '#1a73e8',
        sliderRailColor: '#dbdeeb',
        sliderGripperColor: '#fff',
        modelHeaderBackgroundColor: '#eee',
        codeColor: '#666',
        codeBackgroundColor: 'rgba(216, 216, 216, 0.5)',
        audioBackgroundColor: '#f2f6ff',
        tooltipTextColor: '#fff',
        tooltipBackgroundColor: 'rgba(0, 0, 0, 0.6)',
        progressBarColor: '#fff',
        maskColor: 'rgba(255, 255, 255, 0.8)',

        samplePreviewMaskColor: 'rgba(0, 0, 0, 0.5)',

        graphUploaderBackgroundColor: '#f9f9f9',
        graphUploaderActiveBackgroundColor: '#f2f6ff',
        graphCopyrightColor: '#ddd',
        graphCopyrightLogoFilter: 'opacity(25%)'
    },
    dark: {
        textColor: '#cfcfd1',
        textLightColor: '#575757',
        textLighterColor: '#757575',
        textInvertColor: '#000',

        backgroundColor: '#1d1d1f',
        backgroundFocusedColor: '#333',
        bodyBackgroundColor: '#121214',

        borderColor: '#3f3f42',
        borderFocusedColor: lighten(0.15, '#3f3f42'),
        borderActiveColor: lighten(0.3, '#3f3f42'),

        navbarTextColor: '#fff',
        navbarBackgroundColor: '#262629',
        navbarHoverBackgroundColor: lighten(0.05, '#262629'),
        navbarHighlightColor: '#fff',

        tagBackgroundColor: '#333',
        tagFocusedBackgroundColor: lighten(0.3, '#333'),
        tagActiveBackgroundColor: lighten(0.4, '#333'),
        inputBackgroundColor: '#262629',
        selectSelectedTextColor: '#1a73e8',
        sliderRailColor: '#727275',
        sliderGripperColor: '#cfcfd1',
        modelHeaderBackgroundColor: '#303033',
        codeColor: '#cfcfd1',
        codeBackgroundColor: '#3f3f42',
        audioBackgroundColor: '#303033',
        tooltipTextColor: '#d1d1d1',
        tooltipBackgroundColor: '#292929',
        progressBarColor: '#fff',
        maskColor: 'rgba(0, 0, 0, 0.8)',

        samplePreviewMaskColor: 'rgba(0, 0, 0, 0.8)',

        graphUploaderBackgroundColor: '#262629',
        graphUploaderActiveBackgroundColor: '#303033',
        graphCopyrightColor: '#565657',
        graphCopyrightLogoFilter: 'invert(35%) sepia(5%) saturate(79%) hue-rotate(202deg) brightness(88%) contrast(86%)'
    }
} as const;

function generateColorVariables(color: typeof colors) {
    return Object.entries(color)
        .map(([name, variant]) =>
            Object.entries(variant)
                .map(([key, value]) => {
                    if (key === 'default') {
                        return `--${kebabCase(name)}-color: ${value};`;
                    }
                    return `--${kebabCase(name)}-${kebabCase(key)}-color: ${value};`;
                })
                .join('\n')
        )
        .join('\n');
}

function generateThemeVariables(theme: Record<string, string>) {
    return Object.entries(theme)
        .map(([key, value]) => `--${kebabCase(key)}: ${value};`)
        .join('\n');
}

export const variables = css`
    :root {
        ${generateColorVariables(colors)}

        ${generateThemeVariables(themes[THEME || 'light'])}

        body.auto {
            ${generateThemeVariables(themes.light)}
            @media (prefers-color-scheme: dark) {
                ${generateThemeVariables(themes.dark)}
            }
        }
        body.light {
            ${generateThemeVariables(themes.light)}
        }
        body.dark {
            ${generateThemeVariables(themes.dark)}
        }
    }
`;
