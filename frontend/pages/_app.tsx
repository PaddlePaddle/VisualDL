import React from 'react';
import {NextComponentType, NextPageContext} from 'next';
import App from 'next/app';
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
