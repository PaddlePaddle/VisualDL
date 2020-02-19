import React from 'react';
import PropTypes from 'prop-types';
import {NextPageContext} from 'next';
import {WithTranslation} from 'next-i18next';
import i18n from '../i18n';

interface ErrorProps extends WithTranslation {
    statusCode: number | null;
}

const Error = ({statusCode, t}: ErrorProps) => (
    <p>{statusCode ? t('error-with-status', {statusCode}) : t('error-without-status')}</p>
);

Error.getInitialProps = async ({res, err}: NextPageContext) => {
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
};

Error.defaultProps = {
    statusCode: null
};

Error.propTypes = {
    statusCode: PropTypes.number,
    t: PropTypes.func.isRequired
};

export default i18n.withTranslation('common')<ErrorProps>(Error);
