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

import {useCallback, useEffect, useRef, useState} from 'react';

const useHeavyWork = <T = unknown, P = unknown>(
    createWasm: (() => Promise<(arg: P) => T> | null) | null,
    createWorker: (() => Worker | null) | null,
    fallback: ((arg: P) => T) | null,
    params: P
) => {
    const wasm = useRef<ReturnType<NonNullable<typeof createWasm>>>(null);
    const worker = useRef<ReturnType<NonNullable<typeof createWorker>>>(null);

    const [result, setResult] = useState<T | undefined>(undefined);

    const runFallback = useCallback((p: P) => fallback && setResult(fallback(p)), [fallback]);

    useEffect(() => {
        try {
            if (createWasm && typeof WebAssembly !== 'undefined') {
                if (!wasm.current) {
                    wasm.current = createWasm();
                }
                wasm.current?.then((work: (arg: P) => T) => setResult(work(params))).catch(() => runFallback(params));
                return;
            }

            if (createWorker && typeof Worker !== 'undefined') {
                if (!worker.current) {
                    worker.current = createWorker();
                }
                worker.current?.postMessage(params);
                worker.current?.addEventListener('message', ({data}: MessageEvent & {data: T}) => setResult(data));
                worker.current?.addEventListener('error', () => runFallback(params));
                return;
            }
        } catch (e) {
            if (import.meta.env.MODE === 'development') {
                // eslint-disable-next-line no-console
                console.error('Error during heavy work, trying to use fallback');
                // eslint-disable-next-line no-console
                console.error(e);
            }
            runFallback(params);
        }

        runFallback(params);
    }, [createWasm, createWorker, runFallback, params]);

    return result;
};

export default useHeavyWork;
