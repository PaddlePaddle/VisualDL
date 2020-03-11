import {useMemo, useEffect} from 'react';
import useSWR, {mutate, responseInterface, keyInterface, ConfigInterface} from 'swr';
import {fetcherFn} from 'swr/dist/types';

type Response<D, E> = responseInterface<D, E> & {
    loading: boolean;
};

function useRequest<D = unknown, E = unknown>(key: keyInterface): Response<D, E>;
function useRequest<D = unknown, E = unknown>(key: keyInterface, fetcher?: fetcherFn<D>): Response<D, E>;
function useRequest<D = unknown, E = unknown>(
    key: keyInterface,
    fetcher?: fetcherFn<D>,
    config?: ConfigInterface<D, E, fetcherFn<D>>
): Response<D, E>;
function useRequest<D = unknown, E = unknown>(
    key: keyInterface,
    fetcher?: fetcherFn<D>,
    config?: ConfigInterface<D, E, fetcherFn<D>>
): Response<D, E> {
    const {data, error, ...other} = useSWR<D, E>(key, fetcher, config);
    const loading = useMemo(() => !data && !error, [data, error]);
    return {data, error, loading, ...other};
}

function useRunningRequest<D = unknown, E = unknown>(key: keyInterface, running: boolean): Response<D, E>;
function useRunningRequest<D = unknown, E = unknown>(
    key: keyInterface,
    running: boolean,
    fetcher?: fetcherFn<D>
): Response<D, E>;
function useRunningRequest<D = unknown, E = unknown>(
    key: keyInterface,
    running: boolean,
    fetcher?: fetcherFn<D>,
    config?: Omit<ConfigInterface<D, E, fetcherFn<D>>, 'refreshInterval'>
): Response<D, E>;
function useRunningRequest<D = unknown, E = unknown>(
    key: keyInterface,
    running: boolean,
    fetcher?: fetcherFn<D>,
    config?: Omit<ConfigInterface<D, E, fetcherFn<D>>, 'refreshInterval'>
) {
    const c = useMemo(
        () => ({
            ...config,
            refreshInterval: running ? 15 * 1000 : 0
        }),
        [running, config]
    );

    // revalidate immediately when running is set to true
    useEffect(() => {
        if (running) {
            mutate(key);
        }
    }, [running, key]);

    return useRequest(key, fetcher, c);
}

export default useRequest;
export {useRunningRequest};
