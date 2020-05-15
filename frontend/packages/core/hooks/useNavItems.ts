import {fetcher} from '~/utils/fetch';
import intersection from 'lodash/intersection';
import {useMemo} from 'react';
import useRequest from '~/hooks/useRequest';

const allNavItems = ['scalars', 'samples', 'high-dimensional'];
export const navMap = {
    scalar: 'scalars',
    image: 'samples',
    embeddings: 'high-dimensional'
} as const;

const useNavItems = () => {
    const {data: components} = useRequest<(keyof typeof navMap)[]>('/components', fetcher, {
        refreshInterval: 61 * 1000,
        dedupingInterval: 29 * 1000,
        errorRetryInterval: 29 * 1000,
        errorRetryCount: Number.POSITIVE_INFINITY,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshWhenHidden: false,
        refreshWhenOffline: false
    });

    const navItems = useMemo(() => intersection(components?.map(component => navMap[component]) ?? [], allNavItems), [
        components
    ]);

    return navItems;
};

export default useNavItems;
