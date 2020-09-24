import {ActionTypes} from './types';
import type {Theme} from './types';

export function setTheme(theme: Theme) {
    return {
        type: ActionTypes.SET_THEME,
        theme
    };
}

export function selectTheme(theme: Theme | 'auto') {
    return {
        type: ActionTypes.SELECT_THEME,
        theme
    };
}
