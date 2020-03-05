import '~/public/style/vdl-icon.css';
import React from 'react';
import {NextPageContext} from 'next';
import App, {AppContext} from 'next/app';
import Head from 'next/head';
import NProgress from 'nprogress';
import {SWRConfig} from 'swr';
import {i18n, Router, appWithTranslation} from '~/utils/i18n';
import {fetcher} from '~/utils/fetch';
import {GlobalStyle} from '~/utils/style';
import Layout from '~/components/Layout';
import {I18n} from 'next-i18next';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

type I18nReq = {
    i18n?: I18n;
    locale?: string;
    lng?: string;
    language?: string;
};

type I18nRes = {
    locals?: {
        language?: string;
        languageDir?: string;
    };
};

class VDLApp extends App {
    static async getInitialProps(appContext: AppContext) {
        const req = appContext.ctx.req as (NextPageContext['req'] & I18nReq) | undefined;
        if (req && !req.i18n) {
            const {router} = appContext;
            const result = router.asPath.match(/^\/(.*?)\//);
            const lng = result ? result[1] : process.env.DEFAULT_LANGUAGE;
            req.i18n = i18n.cloneInstance({initImmediate: false, lng});
            const res = appContext.ctx.res as (NextPageContext['res'] & I18nRes) | undefined;
            const setContextLocale = (lng?: string) => {
                // SEE: i18n-express-middleware
                req.language = req.locale = req.lng = lng;
                if (res) {
                    res.locals = res.locals || {};
                    res.locals.language = lng;
                    res.locals.languageDir = i18n.dir(lng);
                }
            };
            setContextLocale(lng);
            i18n.on('languageChanged', setContextLocale);
        }
        const appProps = await App.getInitialProps(appContext);
        return {...appProps};
    }

    render() {
        const {Component, pageProps} = this.props;

        return (
            <>
                <Head>
                    <title>{process.env.title}</title>
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <meta
                        name="viewport"
                        content="width=device-width,minimum-scale=1,maximum-scale=1,initial-scale=1,user-scalable=no,shrink-to-fit=no"
                    />
                    <meta name="description" content={process.env.description} />
                    <meta name="keywords" content={process.env.keywords} />
                    <meta name="author" content={process.env.author} />
                </Head>
                <GlobalStyle />
                <SWRConfig
                    value={{
                        fetcher,
                        revalidateOnFocus: false,
                        revalidateOnReconnect: false
                    }}
                >
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </SWRConfig>
            </>
        );
    }
}

export default appWithTranslation(VDLApp);
