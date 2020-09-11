import type {Theme} from '~/utils/theme';

export type {Theme} from '~/utils/theme';

export enum ActionTypes {
    SET_THEME = 'SET_THEME'
}

export interface ThemeState {
    theme: Theme;
}

interface SetThemeAction {
    type: ActionTypes.SET_THEME;
    theme: Theme;
}

export type ThemeActionTypes = SetThemeAction;
