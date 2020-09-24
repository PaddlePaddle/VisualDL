import type {Theme} from '~/utils/theme';

export type {Theme} from '~/utils/theme';

export enum ActionTypes {
    SET_THEME = 'SET_THEME',
    SELECT_THEME = 'SELECT_THEME'
}

export interface ThemeState {
    theme: Theme;
    selected: Theme | 'auto';
}

interface SetThemeAction {
    type: ActionTypes.SET_THEME;
    theme: Theme;
}

interface SelectThemeAction {
    type: ActionTypes.SELECT_THEME;
    theme: Theme | 'auto';
}

export type ThemeActionTypes = SetThemeAction | SelectThemeAction;
