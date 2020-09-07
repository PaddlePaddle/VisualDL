import {GlobalDispatchContext, GlobalStateContext, globalState} from '~/hooks/useGlobalState';
import React, {useReducer} from 'react';

import type {FunctionComponent} from 'react';
import type {GlobalState as GlobalStateType} from '~/hooks/useGlobalState';

interface GlobalDispatch {
    (state: GlobalStateType, newState: Partial<GlobalStateType>): GlobalStateType;
}

const GlobalState: FunctionComponent = ({children}) => {
    const [state, dispatch] = useReducer<GlobalDispatch>((state, newState) => ({...state, ...newState}), globalState);

    return (
        <GlobalStateContext.Provider value={state}>
            <GlobalDispatchContext.Provider value={dispatch}>{children}</GlobalDispatchContext.Provider>
        </GlobalStateContext.Provider>
    );
};

export default GlobalState;
