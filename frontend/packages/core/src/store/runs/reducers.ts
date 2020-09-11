import type {RunsActionTypes, RunsState} from './types';

import {ActionTypes} from './types';

const initState: RunsState = {
    scalar: [],
    histogram: [],
    image: [],
    audio: [],
    'pr-curve': []
};

function runsReducer(state = initState, action: RunsActionTypes): RunsState {
    switch (action.type) {
        case ActionTypes.SET_SELECTED_RUNS:
            return {
                ...state,
                [action.page]: action.runs
            };
        default:
            return state;
    }
}

export default runsReducer;
