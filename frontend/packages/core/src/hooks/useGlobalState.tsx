import {createContext, useContext} from 'react';

import type {Dispatch} from 'react';

export interface GlobalState {
    runs: string[];
}

export const globalState: GlobalState = {
    runs: []
};

export const GlobalStateContext = createContext<GlobalState>(globalState);
export const GlobalDispatchContext = createContext<Dispatch<Partial<GlobalState>>>(() => void 0);

const useGlobalState = () => [useContext(GlobalStateContext), useContext(GlobalDispatchContext)] as const;

export default useGlobalState;
