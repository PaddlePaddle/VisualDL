import routes, {Pages, Route} from '~/routes';
import {useCallback, useEffect, useState} from 'react';

import ee from '~/utils/event';
import {fetcher} from '~/utils/fetch';
import useRequest from '~/hooks/useRequest';

export const navMap = {
    scalar: Pages.Scalar,
    histogram: Pages.Histogram,
    image: Pages.Image,
    audio: Pages.Audio,
    graph: Pages.Graph,
    embeddings: Pages.HighDimensional,
    pr_curve: Pages.PRCurve
} as const;

const useNavItems = () => {
    const [components, setComponents] = useState<Route[]>([]);

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

    const filterPages = useCallback(
        (pages: Route[]) => {
            const items: string[] = data?.map(item => navMap[item]) ?? [];
            return pages.reduce<Route[]>((m, page) => {
                if (page.children) {
                    const children = filterPages(page.children);
                    if (children.length) {
                        m.push({
                            ...page,
                            children: children as Route['children']
                        });
                    }
                } else if (page.visible !== false && items.includes(page.id)) {
                    m.push(page);
                }
                return m;
            }, []);
        },
        [data]
    );

    useEffect(() => {
        setComponents(filterPages(routes));
    }, [data, filterPages]);

    return components;
};

export default useNavItems;
