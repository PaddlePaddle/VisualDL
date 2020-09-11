import {ActionTypes} from './types';
import type {Model} from './types';

export function setModel(model: Model) {
    return {
        type: ActionTypes.SET_MODEL,
        model
    };
}
