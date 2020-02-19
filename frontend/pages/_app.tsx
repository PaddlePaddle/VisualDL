import React from 'react';
import App from 'next/app';
import i18n from '~/i18n';

class MyApp extends App {
    render() {
        const {Component, pageProps} = this.props;
        return <Component {...pageProps} />;
    }
}

export default i18n.appWithTranslation(MyApp);
