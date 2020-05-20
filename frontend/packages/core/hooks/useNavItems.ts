import {useEffect, useState} from 'react';

import ee from '~/utils/event';
import {fetcher} from '~/utils/fetch';
import intersection from 'lodash/intersection';
import useRequest from '~/hooks/useRequest';

const allNavItems = ['scalars', 'samples', 'high-dimensional'];
export const navMap = {
    scalar: 'scalars',
    image: 'samples',
    embeddings: 'high-dimensional'
} as const;

const useNavItems = () => {
    const [components, setComponents] = useState<string[]>([]);

    const {data, mutate} = useRequest<(keyof typeof navMap)[]>('/components', fetcher, {
        refreshInterval: components.length ? 61 * 1000 : 15 * 1000,
        dedupingInterval: 14 * 1000,
        errorRetryInterval: 15 * 1000,
        errorRetryCount: Number.POSITIVE_INFINITY,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshWhenHidden: false,
        refreshWhenOffline: false
    });

    useEffect(() => {
        ee.on('refresh', mutate);
        return () => {
            ee.off('refresh', mutate);
        };
    }, [mutate]);

    useEffect(() => {
        setComponents(intersection(allNavItems, data?.map(component => navMap[component]) ?? []));
    }, [data]);

    return components;
};

export default useNavItems;
