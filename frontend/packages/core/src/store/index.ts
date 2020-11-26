/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
