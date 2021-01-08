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

import {THEME, autoTheme} from '~/utils/theme';
import type {ThemeActionTypes, ThemeState} from './types';

import {ActionTypes} from './types';
import type {Theme} from '~/utils/theme';

const STORAGE_KEY = 'theme';

const theme = THEME || (window.localStorage.getItem(STORAGE_KEY) as Theme | undefined) || 'auto';

const initState: ThemeState = {
    theme: theme === 'auto' ? autoTheme : theme,
    selected: theme
};

window.document.documentElement.classList.remove('light', 'dark', 'auto');
window.document.documentElement.classList.add(initState.selected);

function themeReducer(state = initState, action: ThemeActionTypes): ThemeState {
    switch (action.type) {
        case ActionTypes.SET_THEME:
            return {
                ...state,
                theme: action.theme
            };
        case ActionTypes.SELECT_THEME:
            window.localStorage.setItem(STORAGE_KEY, action.theme);
            window.document.documentElement.classList.remove('light', 'dark', 'auto');
            window.document.documentElement.classList.add(action.theme);
            return {
                ...state,
                theme: action.theme === 'auto' ? autoTheme : action.theme,
                selected: action.theme
            };
        default:
            return state;
    }
}

export default themeReducer;
