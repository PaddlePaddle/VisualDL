import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import {WithStyled, primaryColor} from '~/utils/style';

import type {BlobResponse} from '~/utils/fetch';
import GridLoader from 'react-spinners/GridLoader';
import {useTranslation} from 'react-i18next';

type ImageProps = {
    data?: BlobResponse;
    loading?: boolean;
    error?: Error;
    onClick?: () => unknown;
};

const Image: FunctionComponent<ImageProps & WithStyled> = ({data, loading, error, onClick, className}) => {
    const {t} = useTranslation('common');

    const [url, setUrl] = useState('');

    // use useLayoutEffect hook to prevent image render after url revoked
    useLayoutEffect(() => {
        if (data) {
            let objectUrl: string | null = null;
            objectUrl = URL.createObjectURL(data.data);
            setUrl(objectUrl);
            return () => {
                objectUrl && URL.revokeObjectURL(objectUrl);
            };
        }
    }, [data]);

    if (loading) {
        return <GridLoader color={primaryColor} size="10px" />;
    }

    if (error) {
        return <div>{t('common:error')}</div>;
    }

    return <img className={className} src={url} onClick={onClick} />;
};

export default Image;
