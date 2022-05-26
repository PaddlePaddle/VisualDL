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

import type {Key, SWRConfiguration, SWRResponse} from 'swr';
import {useEffect, useMemo} from 'react';

import type {Fetcher} from 'swr/dist/types';
import ee from '~/utils/event';
import {toast} from 'react-toastify';
import useSWR from 'swr';

type RequestConfig<D, E> = SWRConfiguration<D, E, Fetcher<D>>;
type RunningRequestConfig<D, E> = Omit<RequestConfig<D, E>, 'dedupingInterval' | 'errorRetryInterval'>;
type Response<D, E> = SWRResponse<D, E> & {
    loading: boolean;
};

function useRequest<D = unknown, E extends Error = Error>(key: Key): Response<D, E>;
function useRequest<D = unknown, E extends Error = Error>(key: Key, fetcher: Fetcher<D> | null): Response<D, E>;
function useRequest<D = unknown, E extends Error = Error>(
    key: Key,
    config: RequestConfig<D, E> | undefined
): Response<D, E>;
function useRequest<D = unknown, E extends Error = Error>(
    key: Key,
    fetcher: Fetcher<D> | null,
    config: RequestConfig<D, E> | undefined
): Response<D, E>;
function useRequest<D = unknown, E extends Error = Error>(
    ...args:
        | readonly [Key]
        | readonly [Key, Fetcher<D> | null]
        | readonly [Key, RequestConfig<D, E> | undefined]
        | readonly [Key, Fetcher<D> | null, RequestConfig<D, E> | undefined]
): Response<D, E> {
    const key = args[0];
    const {data, error, ...other} = useSWR<D, E>(...args);
    // loading referrers to first loading
    // if you want to check if there is an active request
    // please use `isValidating` instead
    const loading = useMemo(() => !!key && data === void 0 && !error, [key, data, error]);

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);
    console.log('useRequest请求数据', key,loading,data);
    return {data, error, loading, ...other};
}

function useRunningRequest<D = unknown, E extends Error = Error>(key: Key, running: boolean): Response<D, E>;
function useRunningRequest<D = unknown, E extends Error = Error>(
    key: Key,
    running: boolean,
    fetcher: Fetcher<D> | null
): Response<D, E>;
function useRunningRequest<D = unknown, E extends Error = Error>(
    key: Key,
    running: boolean,
    config: RunningRequestConfig<D, E> | undefined
): Response<D, E>;
function useRunningRequest<D = unknown, E extends Error = Error>(
    key: Key,
    running: boolean,
    fetcher: Fetcher<D> | null,
    config: RunningRequestConfig<D, E> | undefined
): Response<D, E>;
function useRunningRequest<D = unknown, E extends Error = Error>(
    ...args:
        | readonly [Key, boolean]
        | readonly [Key, boolean, Fetcher<D> | null]
        | readonly [Key, boolean, RequestConfig<D, E> | undefined]
        | readonly [Key, boolean, Fetcher<D> | null, RequestConfig<D, E> | undefined]
) {
    const [key, running, ...options] = args;
    let fetcher: Fetcher<D> | null | undefined = undefined;
    let config: RequestConfig<D, E> | undefined = undefined;
    if (options.length > 1) {
        fetcher = options[0] as Fetcher<D> | null;
        config = options[1];
    } else if (options[0] != null) {
        if (typeof options[0] === 'object') {
            config = options[0];
        } else if (typeof options[0] === 'function') {
            fetcher = options[0];
        }
    }
    const c = useMemo<SWRConfiguration<D, E, Fetcher<D>>>(
        () => ({
            ...config,
            refreshInterval: running ? config?.refreshInterval ?? 15 * 1000 : 0,
            dedupingInterval: config?.refreshInterval ?? 15 * 1000,
            errorRetryInterval: config?.refreshInterval ?? 15 * 1000
        }),
        [config, running]
    );

    const requestArgs = useMemo<
        readonly [Key, RequestConfig<D, E>] | readonly [Key, Fetcher<D> | null, RequestConfig<D, E>]
    >(() => {
        if (fetcher === undefined) {
            return [key, c];
        }
        return [key, fetcher, c];
    }, [key, fetcher, c]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {mutate, ...others} = (useRequest as any)(...requestArgs);
    console.log('mutate处理前', mutate, others);
    // revalidate immediately when running is set to true
    useEffect(() => {
        if (running) {
            mutate();
        }
    }, [running, mutate]);

    useEffect(() => {
        ee.on('refresh', mutate);
        return () => {
            ee.off('refresh', mutate);
        };
    }, [mutate]);
    console.log('mutate处理后', mutate, others);
    return {mutate, ...others};
}

export default useRequest;
export {useRunningRequest};
