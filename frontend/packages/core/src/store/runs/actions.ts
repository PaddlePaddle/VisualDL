import type {Page, Runs} from './types';

import {ActionTypes} from './types';

export function setSelectedRuns(page: Page, runs: Runs) {
    return {
        type: ActionTypes.SET_SELECTED_RUNS,
        page,
        runs
    };
}
