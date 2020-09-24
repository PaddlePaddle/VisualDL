import {THEME, autoTheme} from '~/utils/theme';
import type {ThemeActionTypes, ThemeState} from './types';

import {ActionTypes} from './types';
import type {Theme} from '~/utils/theme';

const STORAGE_KEY = 'theme';

const theme = THEME || (window.localStorage.getItem(STORAGE_KEY) as Theme | undefined) || 'auto';

const initState: ThemeState = {
    theme: theme === 'auto' ? autoTheme : theme,
    selected: theme
};

window.document.body.classList.remove('light', 'dark', 'auto');
window.document.body.classList.add(initState.selected);

function themeReducer(state = initState, action: ThemeActionTypes): ThemeState {
    switch (action.type) {
        case ActionTypes.SET_THEME:
            return {
                ...state,
                theme: action.theme
            };
        case ActionTypes.SELECT_THEME:
            window.localStorage.setItem(STORAGE_KEY, action.theme);
            window.document.body.classList.remove('light', 'dark', 'auto');
            window.document.body.classList.add(action.theme);
            return {
                ...state,
                theme: action.theme === 'auto' ? autoTheme : action.theme,
                selected: action.theme
            };
        default:
            return state;
    }
}

export default themeReducer;
