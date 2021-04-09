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

import routes, {Pages} from '~/routes';
import {useCallback, useEffect, useMemo, useState} from 'react';

import type {Route} from '~/routes';
import ee from '~/utils/event';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

interface RouteWithName extends Route {
    name: string;
    children?: Pick<RouteWithName, 'id' | 'path' | 'component' | 'name'>[];
}

export const navMap = {
    scalar: Pages.Scalar,
    histogram: Pages.Histogram,
    image: Pages.Image,
    audio: Pages.Audio,
    text: Pages.Text,
    graph: Pages.Graph,
    embeddings: Pages.HighDimensional,
    pr_curve: Pages.PRCurve,
    roc_curve: Pages.ROCCurve,
    hyper_parameters: Pages.HyperParameter
} as const;

const useAvailableComponents = () => {
    const {t} = useTranslation('common');

    const [components, setComponents] = useState<RouteWithName[]>([]);
    const [inactiveComponents, setInactiveComponents] = useState<RouteWithName[]>([]);

    const {data, loading, error, mutate} = useRequest<(keyof typeof navMap)[]>('/components', {
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

    const filterRoutes = useCallback(
        (pages: Route[], filter: (page: Route) => boolean) => {
            const iterator = (pages: Route[], parent?: Route) => {
                const parentName = parent ? t(parent.id) + ' - ' : '';
                return pages.reduce<RouteWithName[]>((m, page) => {
                    const name = parentName + t(page.id);
                    if (page.children) {
                        const children = iterator(page.children, page);
                        if (children.length) {
                            m.push({
                                ...page,
                                name,
                                children: children as RouteWithName['children']
                            });
                        }
                    } else if (page.visible !== false && filter(page)) {
                        m.push({
                            ...page,
                            name,
                            children: undefined
                        });
                    }
                    return m;
                }, []);
            };
            return iterator(pages);
        },
        [t]
    );

    const legalAvailableComponentIdArray: string[] = useMemo(() => data?.map(item => navMap[item]) ?? [], [data]);

    const findAvailableComponents = useCallback(
        (pages: Route[]) => filterRoutes(pages, page => legalAvailableComponentIdArray.includes(page.id)),
        [filterRoutes, legalAvailableComponentIdArray]
    );
    const findInactiveComponents = useCallback(
        (pages: Route[]) => filterRoutes(pages, page => !legalAvailableComponentIdArray.includes(page.id)),
        [filterRoutes, legalAvailableComponentIdArray]
    );

    useEffect(() => {
        setComponents(findAvailableComponents(routes));
    }, [findAvailableComponents]);
    useEffect(() => {
        setInactiveComponents(findInactiveComponents(routes));
    }, [findInactiveComponents]);

    return [components, inactiveComponents, loading, error] as const;
};

export default useAvailableComponents;
