import {GlobalDispatchContext, GlobalStateContext, globalState} from '~/hooks/useGlobalState';
import React, {useCallback, useEffect, useReducer} from 'react';
import {THEME, matchMedia} from '~/utils/theme';

import type {FunctionComponent} from 'react';
import type {GlobalState as GlobalStateType} from '~/hooks/useGlobalState';
import isObject from 'lodash/isObject';

interface GlobalDispatch {
    (state: GlobalStateType, newState: Partial<GlobalStateType>): GlobalStateType;
}

// TODO: use redux
const GlobalState: FunctionComponent = ({children}) => {
    const [state, dispatch] = useReducer<GlobalDispatch>(
        (state, newState) =>
            Object.entries(newState).reduce(
                (m, [key, value]) => {
                    if (m.hasOwnProperty(key) && isObject(m[key])) {
                        m[key] = {...m[key], ...(value as any)};
                    } else {
                        m[key] = value;
                    }
                    return m;
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...state} as any
            ),
        globalState
    );

    const toggleTheme = useCallback((e: MediaQueryListEvent) => dispatch({theme: e.matches ? 'dark' : 'light'}), [
        dispatch
    ]);

    useEffect(() => {
        if (!THEME) {
            matchMedia.addEventListener('change', toggleTheme);
            return () => {
                matchMedia.removeEventListener('change', toggleTheme);
            };
        }
    }, [toggleTheme]);

    return (
        <GlobalStateContext.Provider value={state}>
            <GlobalDispatchContext.Provider value={dispatch}>{children}</GlobalDispatchContext.Provider>
        </GlobalStateContext.Provider>
    );
};

export default GlobalState;
