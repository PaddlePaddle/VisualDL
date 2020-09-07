import React, {FunctionComponent, LazyExoticComponent} from 'react';

export enum Pages {
    Scalar = 'scalar',
    Histogram = 'histogram',
    Image = 'image',
    Audio = 'audio',
    Graph = 'graph',
    HighDimensional = 'high-dimensional',
    PRCurve = 'pr-curve'
}

export interface Route {
    id: Pages | string;
    default?: boolean;
    visible?: boolean;
    path?: string;
    component?: LazyExoticComponent<FunctionComponent>;
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
        id: Pages.Histogram,
        path: '/histogram',
        component: React.lazy(() => import('~/pages/histogram'))
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
            }
        ]
    },
    {
        id: Pages.Graph,
        path: '/graph',
        component: React.lazy(() => import('~/pages/graph'))
    },
    {
        id: Pages.HighDimensional,
        path: '/high-dimensional',
        component: React.lazy(() => import('~/pages/high-dimensional'))
    },
    {
        id: Pages.PRCurve,
        path: '/pr-curve',
        component: React.lazy(() => import('~/pages/pr-curve'))
    }
];

export default routes;
