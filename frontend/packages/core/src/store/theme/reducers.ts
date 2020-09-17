import type {ThemeActionTypes, ThemeState} from './types';

import {ActionTypes} from './types';
import {theme} from '~/utils/theme';

const initState: ThemeState = {
    theme
};

function themeReducer(state = initState, action: ThemeActionTypes): ThemeState {
    switch (action.type) {
        case ActionTypes.SET_THEME:
            return {
                ...state,
                theme: action.theme
            };
        default:
            return state;
    }
}

export default themeReducer;
