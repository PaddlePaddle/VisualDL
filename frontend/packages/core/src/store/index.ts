import * as graphActions from './graph/actions';
import * as graphSelectors from './graph/selectors';
import * as runsActions from './runs/actions';
import * as runsSelectors from './runs/selectors';
import * as themeActions from './theme/actions';
import * as themeSelectors from './theme/selectors';

import {combineReducers, createStore} from 'redux';

import graphReducer from './graph/reducers';
import runsReducer from './runs/reducers';
import themeReducer from './theme/reducers';

const rootReducer = combineReducers({
    graph: graphReducer,
    theme: themeReducer,
    runs: runsReducer
});

export default createStore(rootReducer);

export const selectors = {
    graph: graphSelectors,
    runs: runsSelectors,
    theme: themeSelectors
};

export const actions = {
    graph: graphActions,
    runs: runsActions,
    theme: themeActions
};

export type RootState = ReturnType<typeof rootReducer>;
