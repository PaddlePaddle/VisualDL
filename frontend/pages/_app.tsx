import React from 'react';
import App from 'next/app';
import {appWithTranslation} from '~/utils/i18n';
import {GlobalStyle} from '~/utils/style';

class VDLApp extends App {
    render() {
        const {Component, pageProps} = this.props;
        return (
            <React.Fragment>
                <GlobalStyle />
                <Component {...pageProps} />
            </React.Fragment>
        );
    }
}

export default appWithTranslation(VDLApp);
