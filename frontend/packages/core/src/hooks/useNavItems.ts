/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    const {data, loading, error, mutate} = useRequest<(keyof typeof navMap)[]>('/components', fetcher, {
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
    }, [filterPages]);

    return [components, loading, error] as const;
};

export default useNavItems;
