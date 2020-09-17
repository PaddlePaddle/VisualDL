import React, {FunctionComponent, Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {Redirect, Route, BrowserRouter as Router, Switch, useLocation} from 'react-router-dom';
import {THEME, matchMedia} from '~/utils/theme';
import {headerHeight, position, size} from '~/utils/style';

import BodyLoading from '~/components/BodyLoading';
import ErrorBoundary from '~/components/ErrorBoundary';
import ErrorPage from '~/pages/error';
import {Helmet} from 'react-helmet';
import NProgress from 'nprogress';
import Navbar from '~/components/Navbar';
import {SWRConfig} from 'swr';
import {ToastContainer} from 'react-toastify';
import {actions} from '~/store';
import {fetcher} from '~/utils/fetch';
import init from '@visualdl/wasm';
import routes from '~/routes';
import styled from 'styled-components';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

const BASE_URI: string = import.meta.env.SNOWPACK_PUBLIC_BASE_URI;
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const Main = styled.main`
    padding-top: ${headerHeight};
`;

const Header = styled.header`
    z-index: 10000;

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

    const [inited, setInited] = useState(false);
    useEffect(() => {
        (async () => {
            if (!inited) {
                await init(`${PUBLIC_PATH}/wasm/visualdl.wasm`);
                setInited(true);
            }
        })();
    }, [inited]);

    const dispatch = useDispatch();

    const toggleTheme = useCallback(
        (e: MediaQueryListEvent) => dispatch(actions.theme.setTheme(e.matches ? 'dark' : 'light')),
        [dispatch]
    );

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
                {!inited ? (
                    <BodyLoading />
                ) : (
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
                )}
                <ToastContainer />
            </SWRConfig>
        </div>
    );
};

export default App;
