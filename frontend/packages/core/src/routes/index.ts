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

import type {FunctionComponent, LazyExoticComponent} from 'react';

import React from 'react';

export enum Pages {
    Scalar = 'scalar',
    Histogram = 'histogram',
    Image = 'image',
    Audio = 'audio',
    Text = 'text',
    Graph = 'graph',
    x2paddle = 'x2paddle',
    HighDimensional = 'high-dimensional',
    PRCurve = 'pr-curve',
    ROCCurve = 'roc-curve',
    Profiler = 'profiler',
    HyperParameter = 'hyper-parameter',
    fastdeploy_server = 'fastdeploy_server',
    fastdeploy_client = 'fastdeploy_client'
}

export interface Route {
    id: Pages | string;
    default?: boolean;
    visible?: boolean;
    path?: string;
    // component?: LazyExoticComponent<FunctionComponent>;
    component?: any;
    children?: Pick<Route, 'id' | 'path' | 'component'>[];
}

const routes: Route[] = [
    {
        id: 'index',
        default: true,
        visible: false,
        path: '/index',
        component: React.lazy(() => import('~/pages/index'))
    },
    {
        id: Pages.Scalar,
        path: '/scalar',
        component: React.lazy(() => import('~/pages/scalar'))
    },
    {
        id: 'sample',
        children: [
            {
                id: Pages.Image,
                path: '/sample/image',
                component: React.lazy(() => import('~/pages/sample/image'))
            },
            {
                id: Pages.Audio,
                path: '/sample/audio',
                component: React.lazy(() => import('~/pages/sample/audio'))
            },
            {
                id: Pages.Text,
                path: '/sample/text',
                component: React.lazy(() => import('~/pages/sample/text'))
            }
        ]
    },
    {
        id: Pages.Graph,
        children: [
            {
                id: 'dynamic_graph',
                path: '/graph/dynamic_graph',
                component: React.lazy(() => import('~/pages/graphDynamic'))
            },
            {
                id: 'static_graph',
                path: '/graph/static_graph',
                component: React.lazy(() => import('~/pages/graphStatic'))
            }
        ]
    },
    {
        id: Pages.x2paddle,
        path: '/x2paddle',
        component: React.lazy(() => import('~/pages/x2paddle'))
    },
    {
        id: Pages.Histogram,
        path: '/histogram',
        component: React.lazy(() => import('~/pages/histogram'))
    },
    {
        id: Pages.HyperParameter,
        path: '/hyper-parameter',
        component: React.lazy(() => import('~/pages/hyper-parameter'))
    },
    {
        id: Pages.Profiler,
        path: '/profiler',
        component: React.lazy(() => import('~/pages/profiler'))
    },
    {
        id: Pages.HighDimensional,
        path: '/high-dimensional',
        component: React.lazy(() => import('~/pages/high-dimensional'))
    },
    {
        id: Pages.PRCurve,
        path: '/pr-curve',
        component: React.lazy(() => import('~/pages/curves/pr'))
    },
    {
        id: Pages.ROCCurve,
        path: '/roc-curve',
        component: React.lazy(() => import('~/pages/curves/roc'))
    },
    {
        id: Pages.fastdeploy_server,
        path: '/fastdeploy_server',
        component: React.lazy(() => import('~/pages/Fastdeploy'))
    },
    {
        id: Pages.fastdeploy_client,
        path: '/fastdeploy_client',
        component: React.lazy(() => import('~/pages/FastdeployClient'))
    }
];

export default routes;
