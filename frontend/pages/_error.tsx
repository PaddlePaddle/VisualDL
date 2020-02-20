import React from 'react';
import {NextPageContext} from 'next';
import {WithTranslation} from 'next-i18next';
import {withTranslation} from '~/utils/i18n';

interface ErrorProps {
    statusCode: number | null;
}

class Error extends React.Component<ErrorProps & WithTranslation> {
    static getInitialProps({res, err}: NextPageContext) {
        let statusCode = null;
        if (res) {
            ({statusCode} = res);
        } else if (err) {
            ({statusCode} = err);
        }
        return {
            namespacesRequired: ['common'],
            statusCode
        };
    }

    render() {
        const {statusCode, t} = this.props;
        return <p>{statusCode ? t('error-with-status', {statusCode}) : t('error-without-status')}</p>
    }
}

export default withTranslation('common')(Error);
