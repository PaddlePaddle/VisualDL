import {useEffect, useState} from 'react';

import ee from '~/utils/event';
import {fetcher} from '~/utils/fetch';
import intersection from 'lodash/intersection';
import useRequest from '~/hooks/useRequest';

enum Pages {
    Scalar = 'scalar',
    Histogram = 'histogram',
    Samples = 'samples',
    Graph = 'graph',
    HighDimensional = 'high-dimensional',
    PRCurve = 'pr-curve'
}

const pages = [
    Pages.Scalar,
    Pages.Histogram,
    Pages.Samples,
    Pages.Graph,
    Pages.HighDimensional,
    Pages.PRCurve
] as const;

export const navMap = {
    scalar: Pages.Scalar,
    histogram: Pages.Histogram,
    image: Pages.Samples,
    graph: Pages.Graph,
    embeddings: Pages.HighDimensional,
    pr_curve: Pages.PRCurve
} as const;

const useNavItems = () => {
    const [components, setComponents] = useState<Pages[]>([]);

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
        setComponents(intersection(pages, data?.map(component => navMap[component]) ?? []));
    }, [data]);

    return components;
};

export default useNavItems;
