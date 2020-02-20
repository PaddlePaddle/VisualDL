import React from 'react';
import App from 'next/app';
import NProgress from 'nprogress';
import {Router, appWithTranslation} from '~/utils/i18n';
import {GlobalStyle} from '~/utils/style';
import Layout from '~/components/Layout';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

class VDLApp extends App {
    render() {
        const {Component, pageProps} = this.props;

        return (
            <>
                <GlobalStyle />
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </>
        );
    }
}

export default appWithTranslation(VDLApp);
