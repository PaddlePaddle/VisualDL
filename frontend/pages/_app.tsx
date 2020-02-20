import React from 'react';
import {NextComponentType, NextPageContext} from 'next';
import App from 'next/app';
import Head from 'next/head';
import NProgress from 'nprogress';
import {Router, appWithTranslation} from '~/utils/i18n';
import {GlobalStyle} from '~/utils/style';
import Title from '~/components/Title';
import Layout from '~/components/Layout';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

type AppProps<P = {}> = {
    Component: {title?: string} & NextComponentType<NextPageContext, any, P>
};

class VDLApp extends App<AppProps> {
    render() {
        const {Component, pageProps} = this.props;

        return (
            <>
                <Head>
                    <title>{process.env.title}</title>
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <meta name="viewport" content="width=device-width,minimum-scale=1,maximum-scale=1,initial-scale=1,user-scalable=no,shrink-to-fit=no" />
                    <meta name="description" content={process.env.description} />
                    <meta name="keywords" content={process.env.keywords} />
                    <meta name="author" content={process.env.author} />
                </Head>
                <Title>{Component.title}</Title>
                <GlobalStyle />
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </>
        );
    }
}

export default appWithTranslation(VDLApp);
