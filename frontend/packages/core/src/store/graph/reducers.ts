import type {GraphActionTypes, GraphState} from './types';

import {ActionTypes} from './types';

const initState: GraphState = {
    model: null
};

function graphReducer(state = initState, action: GraphActionTypes): GraphState {
    switch (action.type) {
        case ActionTypes.SET_MODEL:
            return {
                ...state,
                model: action.model
            };
        default:
            return state;
    }
}

export default graphReducer;
