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

import {useEffect, useState} from 'react';

import WebWorker from '~/worker';

const BASE_URI: string = import.meta.env.SNOWPACK_PUBLIC_BASE_URI;

type WorkerResult<D, E extends Error> = {
    data?: D;
    error?: E;
    worker?: WebWorker;
};

const useWorker = <D, P = unknown, E extends Error = Error>(name: string, params: P): WorkerResult<D, E> => {
    const [result, setResult] = useState<WorkerResult<D, E>>({});

    useEffect(() => {
        const worker = new WebWorker(`${BASE_URI}/_dist_/worker/${name}.js`);
        worker.on('INITIALIZED', () => {
            setResult({worker});
            worker.emit('RUN', params);
        });
        worker.on<D>('RESULT', data => setResult({data, worker}));
        worker.on<E>('ERROR', error => setResult({error, worker}));
        return () => {
            worker.terminate();
        };
    }, [name, params]);

    return result;
};

export default useWorker;
