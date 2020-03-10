import {useMemo} from 'react';
import useSWR, {responseInterface, keyInterface, ConfigInterface} from 'swr';
import {fetcherFn} from 'swr/dist/types';

type Response<D, E> = responseInterface<D, E> & {
    loading: boolean;
};

function useRequest<D = unknown, E = unknown>(key: keyInterface): Response<D, E>;
function useRequest<D = unknown, E = unknown>(key: keyInterface, fetcher?: fetcherFn<D>): Response<D, E>;
function useRequest<D = unknown, E = unknown>(
    key: keyInterface,
    fetcher?: fetcherFn<D>,
    config?: ConfigInterface<D, E>
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

export default useRequest;
