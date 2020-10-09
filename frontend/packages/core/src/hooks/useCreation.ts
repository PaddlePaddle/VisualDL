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

import {useRef} from 'react';

export default function useCreation<T>(factory: () => T, deps: unknown[]) {
    const {current} = useRef({
        deps,
        obj: undefined as undefined | T,
        initialized: false
    });
    if (current.initialized === false || !depsAreSame(current.deps, deps)) {
        current.deps = deps;
        current.obj = factory();
        current.initialized = true;
    }
    return current.obj as T;
}

function depsAreSame(oldDeps: unknown[], deps: unknown[]): boolean {
    if (oldDeps === deps) return true;
    for (const i in oldDeps) {
        if (oldDeps[i] !== deps[i]) return false;
    }
    return true;
}
