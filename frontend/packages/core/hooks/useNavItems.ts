import {useEffect, useMemo} from 'react';

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
    const {data: components, mutate} = useRequest<(keyof typeof navMap)[]>('/components', fetcher, {
        refreshInterval: 61 * 1000,
        dedupingInterval: 29 * 1000,
        errorRetryInterval: 29 * 1000,
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

    const navItems = useMemo(() => intersection(allNavItems, components?.map(component => navMap[component]) ?? []), [
        components
    ]);

    return navItems;
};

export default useNavItems;
