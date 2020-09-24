import type {RootState} from '../index';

export const theme = (state: RootState) => state.theme.theme;

export const selected = (state: RootState) => state.theme.selected;
