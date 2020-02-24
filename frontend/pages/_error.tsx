import React from 'react';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';

interface ErrorProps {
    statusCode?: number | null;
}

const Error: NextI18NextPage<ErrorProps> = ({statusCode}) => {
    const {t} = useTranslation('errors');

    return <p>{statusCode ? t('error-with-status', {statusCode}) : t('error-without-status')}</p>;
};

Error.getInitialProps = ({res, err}) => {
    let statusCode = null;
    if (res) {
        ({statusCode} = res);
    } else if (err) {
        ({statusCode} = err);
    }
    return {
        namespacesRequired: ['errors'],
        statusCode
    };
};

export default Error;
