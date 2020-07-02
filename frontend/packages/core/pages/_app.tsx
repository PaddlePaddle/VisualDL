import App, {AppContext, AppProps} from 'next/app';
import {Router, appWithTranslation} from '~/utils/i18n';
import {fetcher, getApiToken, setApiToken} from '~/utils/fetch';

import {GlobalStyle} from '~/utils/style';
import Head from 'next/head';
import Layout from '~/components/Layout';
import NProgress from 'nprogress';
import React from 'react';
import {SWRConfig} from 'swr';
import {ToastContainer} from 'react-toastify';
import queryString from 'query-string';
import {withRouter} from 'next/router';

const API_TOKEN_KEY: string = globalThis.__vdl_api_token_key__ || '';

class VDLApp extends App {
    constructor(props: AppProps) {
        super(props);
        if (process.browser && API_TOKEN_KEY) {
            const query = queryString.parse(window.location.search);
            setApiToken(query[API_TOKEN_KEY]);
        }
    }

    componentDidMount() {
        Router.events.on('routeChangeStart', () => NProgress.start());
        Router.events.on('routeChangeComplete', (url: string) => {
            NProgress.done();
            if (API_TOKEN_KEY) {
                const id = getApiToken();
                const parsed = queryString.parseUrl(url);
                if (id && !parsed.query[API_TOKEN_KEY]) {
                    this.props.router.replace(
                        queryString.stringifyUrl({
                            url: parsed.url,
                            query: {
                                ...parsed.query,
                                [API_TOKEN_KEY]: id
                            }
                        }),
                        undefined,
                        {shallow: true}
                    );
                }
            }
        });
        Router.events.on('routeChangeError', () => NProgress.done());
    }

    render() {
        const {Component, pageProps} = this.props;

        return (
            <>
                <Head>
                    <title>{process.env.title}</title>
                    <link rel="shortcut icon" href={`${process.env.PUBLIC_PATH}/favicon.ico`} />
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
                    <ToastContainer position="top-center" hideProgressBar closeOnClick={false} />
                </SWRConfig>
            </>
        );
    }

    static async getInitialProps(appContext: AppContext) {
        const appProps = await App.getInitialProps(appContext);

        if (API_TOKEN_KEY) {
            setApiToken(appContext.router.query[API_TOKEN_KEY]);
        }
        return {...appProps};
    }
}

export default appWithTranslation(withRouter(VDLApp));
