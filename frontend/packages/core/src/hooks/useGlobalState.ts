import {createContext, useContext} from 'react';

import type {Dispatch} from 'react';
import type {Theme} from '~/utils/theme';
import {theme} from '~/utils/theme';

export interface GlobalState {
    theme: Theme;
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
    theme,
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
