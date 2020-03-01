import React from 'react';
import {useTranslation} from 'react-i18next';
import {NextPage} from 'next';

interface ErrorProps {
    statusCode?: number | null;
}

const Error: NextPage<ErrorProps> = ({statusCode}) => {
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
        statusCode
    };
};

export default Error;
