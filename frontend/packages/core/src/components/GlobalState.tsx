import {GlobalDispatchContext, GlobalStateContext, globalState} from '~/hooks/useGlobalState';
import React, {useReducer} from 'react';

import type {FunctionComponent} from 'react';
import type {GlobalState as GlobalStateType} from '~/hooks/useGlobalState';

interface GlobalDispatch {
    (state: GlobalStateType, newState: Partial<GlobalStateType>): GlobalStateType;
}

// TODO: use redux
const GlobalState: FunctionComponent = ({children}) => {
    const [state, dispatch] = useReducer<GlobalDispatch>(
        (state, newState) =>
            Object.entries(newState).reduce(
                (m, [key, value]) => {
                    if (m.hasOwnProperty(key)) {
                        m[key] = {...m[key], ...value};
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

    return (
        <GlobalStateContext.Provider value={state}>
            <GlobalDispatchContext.Provider value={dispatch}>{children}</GlobalDispatchContext.Provider>
        </GlobalStateContext.Provider>
    );
};

export default GlobalState;
