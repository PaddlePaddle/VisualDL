export type Runs = string[];

export enum ActionTypes {
    SET_SELECTED_RUNS = 'SET_SELECTED_RUNS'
}

export interface RunsState {
    scalar: Runs;
    histogram: Runs;
    image: Runs;
    audio: Runs;
    'pr-curve': Runs;
}

export type Page = keyof RunsState;

interface SetSelectedRunsAction {
    type: ActionTypes.SET_SELECTED_RUNS;
    page: Page;
    runs: Runs;
}

export type RunsActionTypes = SetSelectedRunsAction;
