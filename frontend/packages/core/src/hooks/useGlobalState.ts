import {createContext, useContext} from 'react';

import type {Dispatch} from 'react';

export interface GlobalState {
    scalar: {
        runs: string[];
    };
    histogram: {
        runs: string[];
    };
    image: {
        runs: string[];
    };
    audio: {
        runs: string[];
    };
    prCurve: {
        runs: string[];
    };
    graph: {
        model: FileList | File[] | null;
    };
}

export const globalState: GlobalState = {
    scalar: {
        runs: []
    },
    histogram: {
        runs: []
    },
    image: {
        runs: []
    },
    audio: {
        runs: []
    },
    prCurve: {
        runs: []
    },
    graph: {
        model: null
    }
};

export const GlobalStateContext = createContext<GlobalState>(globalState);
export const GlobalDispatchContext = createContext<Dispatch<Partial<GlobalState>>>(() => void 0);

const useGlobalState = () => [useContext(GlobalStateContext), useContext(GlobalDispatchContext)] as const;

export default useGlobalState;
