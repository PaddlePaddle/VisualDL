import {useEffect, useState} from 'react';

import ee from '~/utils/event';
import {fetcher} from '~/utils/fetch';
import intersection from 'lodash/intersection';
import useRequest from '~/hooks/useRequest';

enum Pages {
    Scalars = 'scalars',
    Histogram = 'histogram',
    Samples = 'samples',
    Graphs = 'graphs',
    HighDimensional = 'high-dimensional',
    PRCurve = 'pr-curve'
}

const pages = [
    Pages.Scalars,
    Pages.Histogram,
    Pages.Samples,
    Pages.Graphs,
    Pages.HighDimensional,
    Pages.PRCurve
] as const;

export const navMap = {
    scalar: Pages.Scalars,
    histogram: Pages.Histogram,
    image: Pages.Samples,
    graph: Pages.Graphs,
    embeddings: Pages.HighDimensional,
    'pr-curve': Pages.PRCurve
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
