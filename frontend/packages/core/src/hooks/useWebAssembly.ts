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

import type * as funcs from '@visualdl/wasm';

import {useMemo} from 'react';
import useWorker from '~/hooks/useWorker';

type FuncNames = Exclude<keyof typeof funcs, 'default'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useWebAssembly = <D, P extends Array<unknown> = any, E extends Error = Error>(name: FuncNames, params: P) => {
    const p = useMemo(() => ({name, params}), [name, params]);
    return useWorker<D, typeof p, E>('wasm', p);
};

export default useWebAssembly;
