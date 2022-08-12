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

// cSpell:words pageview inited
import 'antd/dist/antd.css';
import React, {FunctionComponent, Suspense, useCallback, useEffect, useMemo} from 'react';
import {Redirect, Route, BrowserRouter as Router, Switch, useLocation} from 'react-router-dom';
import {THEME, matchMedia} from '~/utils/theme';
import {actions, selectors} from '~/store';
import {headerHeight, position, size, zIndexes, setRem} from '~/utils/style';
import {useDispatch, useSelector} from 'react-redux';

import ErrorBoundary from '~/components/ErrorBoundary';
import ErrorPage from '~/pages/error';
import {Helmet} from 'react-helmet';
import NProgress from 'nprogress';
import Navbar from '~/components/Navbar';
import {SWRConfig} from 'swr';
import {ToastContainer} from 'react-toastify';
import {fetcher} from '~/utils/fetch';
import routes from '~/routes';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const BASE_URI: string = import.meta.env.SNOWPACK_PUBLIC_BASE_URI;

const Main = styled.main`
    padding-top: ${headerHeight};
`;

const Header = styled.header`
    z-index: ${zIndexes.header};

    ${size(headerHeight, '100%')}
    ${position('fixed', 0, 0, null, 0)}
`;

const defaultRoute = routes.find(route => route.default);
const routers = routes.reduce<Omit<typeof routes[number], 'children'>[]>((m, route) => {
    if (route.children) {
        m.push(...route.children);
    } else {
        m.push(route);
    }
    return m;
}, []);

const Progress: FunctionComponent = () => {
    useEffect(() => {
        NProgress.start();
        return () => {
            NProgress.done();
        };
    }, []);

    return null;
};

const Telemetry: FunctionComponent = () => {
    const location = useLocation();
    useEffect(() => {
        window._hmt.push(['_trackPageview', BASE_URI + location.pathname]);
    }, [location.pathname]);
    return null;
};

const App: FunctionComponent = () => {
    const {t, i18n} = useTranslation('errors');

    const dir = useMemo(() => (i18n.language ? i18n.dir(i18n.language) : ''), [i18n]);

    const dispatch = useDispatch();
    const selectedTheme = useSelector(selectors.theme.selected);

    const toggleTheme = useCallback(
        (e: MediaQueryListEvent) => {
            if (selectedTheme === 'auto') {
                dispatch(actions.theme.setTheme(e.matches ? 'dark' : 'light'));
            }
        },
        [dispatch, selectedTheme]
    );
    // useEffect(() => {
    //     setRem();
    //     window.onresize = function () {
    //         setRem();
    //     };
    // }, []);
    useEffect(() => {
        if (!THEME) {
            matchMedia.addEventListener('change', toggleTheme);
            return () => {
                matchMedia.removeEventListener('change', toggleTheme);
            };
        }
    }, [toggleTheme]);

    return (
        <div className="app">
            <Helmet defaultTitle="VisualDL" titleTemplate="%s - VisualDL">
                <html lang={i18n.language} dir={dir} />
            </Helmet>
            <SWRConfig
                value={{
                    fetcher,
                    revalidateOnFocus: false,
                    revalidateOnReconnect: false
                }}
            >
                <Main>
                    <Router basename={BASE_URI || '/'}>
                        <Telemetry />
                        <Header>
                            <Navbar />
                        </Header>
                        <ErrorBoundary fallback={<ErrorPage />}>
                            <Suspense fallback={<Progress />}>
                                <Switch>
                                    <Redirect exact from="/" to={defaultRoute?.path ?? '/index'} />
                                    {routers.map(route => (
                                        <Route key={route.id} path={route.path} component={route.component} />
                                    ))}
                                    <Route path="*">
                                        <ErrorPage title={t('errors:page-not-found')} />
                                    </Route>
                                </Switch>
                            </Suspense>
                        </ErrorBoundary>
                    </Router>
                </Main>
                <ToastContainer />
            </SWRConfig>
        </div>
    );
};

export default App;
