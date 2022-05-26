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
import {useEffect, useMemo, useState} from 'react';

import type {Route} from '~/routes';
import ee from '~/utils/event';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

interface Component extends Route {
    name: string;
    inactive?: boolean;
    children?: Pick<Component, 'id' | 'path' | 'component' | 'name' | 'inactive'>[];
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

    const [refreshInterval, setRefreshInterval] = useState(15 * 1000);

    const {data, loading, error, mutate} = useRequest<(keyof typeof navMap)[]>('/components', {
        refreshInterval,
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

    const activeComponentIdArray: string[] = useMemo(() => {
        console.log('datasss',data);
        
       return data?.map(item => navMap[item]) ?? []
    }, [data]);

    const components = useMemo(() => {
        const iterator = (pages: Route[], parent?: Route) => {
            const parentName = parent ? t(parent.id) + ' - ' : '';
            return pages.reduce<Component[]>((m, page) => {
                const name = parentName + t(page.id);
                if (page.children) {
                    const children = iterator(page.children, page);
                    if (children.length) {
                        m.push({
                            ...page,
                            name,
                            children: children as Component['children']
                        });
                    }
                } else if (page.visible !== false) {
                    m.push({
                        ...page,
                        inactive: !activeComponentIdArray.includes(page.id),
                        name,
                        children: undefined
                    });
                }
                return m;
            }, []);
        };
        return iterator(routes);
    }, [activeComponentIdArray, t]);

    useEffect(() => setRefreshInterval((components.length ? 61 : 15) * 1000), [components]);

    return [components, loading, error] as const;
};

export default useAvailableComponents;
