import {useCallback, useEffect, useState} from 'react';

import ee from '~/utils/event';
import {fetcher} from '~/utils/fetch';
import useRequest from '~/hooks/useRequest';

enum Pages {
    Scalar = 'scalar',
    Histogram = 'histogram',
    Image = 'image',
    Audio = 'audio',
    Graph = 'graph',
    HighDimensional = 'high-dimensional',
    PRCurve = 'pr-curve'
}

export interface NavItem {
    id: Pages | string;
    visible?: boolean;
    path?: string;
    children?: {
        id: NavItem['id'];
        path: string;
    }[];
}

const pages: NavItem[] = [
    {
        id: Pages.Scalar,
        path: `/${Pages.Scalar}`
    },
    {
        id: Pages.Histogram,
        path: `/${Pages.Histogram}`
    },
    {
        id: 'sample',
        visible: true,
        children: [
            {
                id: Pages.Image,
                path: `/sample/${Pages.Image}`
            },
            {
                id: Pages.Audio,
                path: `/sample/${Pages.Audio}`
            }
        ]
    },
    {
        id: Pages.Graph,
        path: `/${Pages.Graph}`
    },
    {
        id: Pages.HighDimensional,
        path: `/${Pages.HighDimensional}`
    },
    {
        id: Pages.PRCurve,
        path: `/${Pages.PRCurve}`
    }
];

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
    const [components, setComponents] = useState<NavItem[]>([]);

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
        (pages: NavItem[]) => {
            const items: string[] = data?.map(item => navMap[item]) ?? [];
            return pages.reduce<NavItem[]>((m, page) => {
                if (!page.visible && !items.includes(page.id)) {
                    return m;
                }
                if (page.children) {
                    const children = filterPages(page.children);
                    if (children.length) {
                        m.push({
                            ...page,
                            children: children as NavItem['children']
                        });
                    }
                } else {
                    m.push(page);
                }
                return m;
            }, []);
        },
        [data]
    );

    useEffect(() => {
        setComponents(filterPages(pages));
    }, [data, filterPages]);

    return components;
};

export default useNavItems;
