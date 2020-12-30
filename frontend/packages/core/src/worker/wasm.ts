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

import * as funcs from '@visualdl/wasm';

import type {Runner} from '~/worker/types';
import initWasm from '@visualdl/wasm';

type FuncNames = Exclude<keyof typeof funcs, 'default'>;

const runner: Runner = async worker => {
    const PUBLIC_PATH = worker.env.SNOWPACK_PUBLIC_PATH;

    await initWasm(`${PUBLIC_PATH}/wasm/visualdl.wasm`);

    worker.on<{name: FuncNames; params: unknown[]}>('RUN', ({name, params}) => {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-types
            const result = (funcs[name] as Function)(...params);
            worker.emit('RESULT', result);
        } catch (e) {
            if (e.message !== 'unreachable') {
                throw e;
            }
        }
    });

    worker.emit('INITIALIZED');
};

export default runner;
