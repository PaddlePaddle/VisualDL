import type {Page} from './types';
import type {RootState} from '../index';

export const getRunsByPage = (page: Page) => (state: RootState) => state.runs[page];
