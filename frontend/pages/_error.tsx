import React from 'react';
import PropTypes from 'prop-types';
import {NextPageContext} from 'next';
import {WithTranslation} from 'next-i18next';
import {withTranslation} from '~/utils/i18n';

interface ErrorProps extends WithTranslation {
    statusCode: number | null;
}

class Error extends React.Component<ErrorProps> {
    static propTypes = {
        statusCode: PropTypes.number,
        t: PropTypes.func.isRequired
    };

    static defaultProps = {
        statusCode: null
    }

    render() {
        const {statusCode, t} = this.props;
        return <p>{statusCode ? t('error-with-status', {statusCode}) : t('error-without-status')}</p>
    }

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
}

export default withTranslation('common')(Error);
