import type {ConfigInterface, keyInterface, responseInterface} from 'swr';
import {useEffect, useMemo} from 'react';

import ee from '~/utils/event';
import type {fetcherFn} from 'swr/dist/types';
import {toast} from 'react-toastify';
import useSWR from 'swr';

type Response<D, E> = responseInterface<D, E> & {
    loading: boolean;
};

function useRequest<D = unknown, E extends Error = Error>(key: keyInterface): Response<D, E>;
function useRequest<D = unknown, E extends Error = Error>(key: keyInterface, fetcher?: fetcherFn<D>): Response<D, E>;
function useRequest<D = unknown, E extends Error = Error>(
    key: keyInterface,
    fetcher?: fetcherFn<D>,
    config?: ConfigInterface<D, E, fetcherFn<D>>
): Response<D, E>;
function useRequest<D = unknown, E extends Error = Error>(
    key: keyInterface,
    fetcher?: fetcherFn<D>,
    config?: ConfigInterface<D, E, fetcherFn<D>>
): Response<D, E> {
    const {data, error, ...other} = useSWR<D, E>(key, fetcher, config);
    const loading = useMemo(() => !!key && !data && !error, [key, data, error]);

    useEffect(() => {
        if (error) {
            toast(error.message, {
                position: toast.POSITION.TOP_CENTER,
                type: toast.TYPE.ERROR
            });
        }
    }, [error]);

    return {data, error, loading, ...other};
}

function useRunningRequest<D = unknown, E extends Error = Error>(key: keyInterface, running: boolean): Response<D, E>;
function useRunningRequest<D = unknown, E extends Error = Error>(
    key: keyInterface,
    running: boolean,
    fetcher?: fetcherFn<D>
): Response<D, E>;
function useRunningRequest<D = unknown, E extends Error = Error>(
    key: keyInterface,
    running: boolean,
    fetcher?: fetcherFn<D>,
    config?: Omit<ConfigInterface<D, E, fetcherFn<D>>, 'dedupingInterval' | 'errorRetryInterval'>
): Response<D, E>;
function useRunningRequest<D = unknown, E extends Error = Error>(
    key: keyInterface,
    running: boolean,
    fetcher?: fetcherFn<D>,
    config?: Omit<ConfigInterface<D, E, fetcherFn<D>>, 'dedupingInterval' | 'errorRetryInterval'>
) {
    const c = useMemo<ConfigInterface<D, E, fetcherFn<D>>>(
        () => ({
            ...config,
            refreshInterval: running ? config?.refreshInterval ?? 15 * 1000 : 0,
            dedupingInterval: config?.refreshInterval ?? 15 * 1000,
            errorRetryInterval: config?.refreshInterval ?? 15 * 1000
        }),
        [running, config]
    );

    const {mutate, ...others} = useRequest(key, fetcher, c);

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

    return {mutate, ...others};
}

export default useRequest;
export {useRunningRequest};
