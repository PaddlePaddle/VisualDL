export type Model = FileList | File[] | null;

export enum ActionTypes {
    SET_MODEL = 'SET_MODEL'
}

export interface GraphState {
    model: Model;
}

export type Page = keyof GraphState;

interface SetModelAction {
    type: ActionTypes.SET_MODEL;
    model: Model;
}

export type GraphActionTypes = SetModelAction;
