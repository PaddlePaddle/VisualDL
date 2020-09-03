import React, {FunctionComponent, Suspense, useEffect, useMemo, useState} from 'react';
import {Redirect, Route, BrowserRouter as Router, Switch, useLocation} from 'react-router-dom';
import {headerHeight, position, size} from '~/utils/style';

import BodyLoading from '~/components/BodyLoading';
import {Helmet} from 'react-helmet';
import NProgress from 'nprogress';
import Navbar from '~/components/Navbar';
import {SWRConfig} from 'swr';
import {fetcher} from '~/utils/fetch';
import init from '@visualdl/wasm';
import routes from '~/routes';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

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
        globalThis._hmt.push(['_trackPageview', PUBLIC_PATH + location.pathname]);
    }, [location.pathname]);
    return null;
};

const App: FunctionComponent = () => {
    const {i18n} = useTranslation();

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
                        <Router basename={PUBLIC_PATH || '/'}>
                            <Telemetry />
                            <Header>
                                <Navbar />
                            </Header>
                            <Suspense fallback={<Progress />}>
                                <Switch>
                                    <Redirect exact from="/" to={defaultRoute?.path ?? '/index'} />
                                    {routers.map(route => (
                                        <Route key={route.id} path={route.path} component={route.component} />
                                    ))}
                                </Switch>
                            </Suspense>
                        </Router>
                    </Main>
                )}
            </SWRConfig>
        </div>
    );
};

export default App;
