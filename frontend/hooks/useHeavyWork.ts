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
        if (process.browser) {
            try {
                if (createWasm && typeof WebAssembly !== 'undefined') {
                    if (!wasm.current) {
                        wasm.current = createWasm();
                    }
                    wasm.current
                        ?.then((work: (arg: P) => T) => setResult(work(params)))
                        .catch(() => runFallback(params));
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
                if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-console
                    console.error('Error during heavy work, trying to use fallback');
                    // eslint-disable-next-line no-console
                    console.error(e);
                }
                runFallback(params);
            }
        }

        runFallback(params);
    }, [createWasm, createWorker, runFallback, params]);

    return result;
};

export default useHeavyWork;
