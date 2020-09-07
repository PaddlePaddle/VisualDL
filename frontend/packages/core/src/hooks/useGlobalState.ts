import {createContext, useContext} from 'react';

import type {Dispatch} from 'react';

export interface GlobalState {
    runs: string[];
    model: FileList | File[] | null;
}

export const globalState: GlobalState = {
    runs: [],
    model: null
};

export const GlobalStateContext = createContext<GlobalState>(globalState);
export const GlobalDispatchContext = createContext<Dispatch<Partial<GlobalState>>>(() => void 0);

const useGlobalState = () => [useContext(GlobalStateContext), useContext(GlobalDispatchContext)] as const;

export default useGlobalState;
