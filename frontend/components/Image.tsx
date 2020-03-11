import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import useRequest from '~/hooks/useRequest';
import {primaryColor} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
import {blobFetcher} from '~/utils/fetch';
import GridLoader from 'react-spinners/GridLoader';

type ImageProps = {
    src?: string;
};

const Image: FunctionComponent<ImageProps> = ({src}) => {
    const {t} = useTranslation('common');

    const [url, setUrl] = useState('');

    const {data, error, loading} = useRequest<Blob>(src ?? null, blobFetcher, {
        // cache image for 5 minutes
        dedupingInterval: 5 * 60 * 1000
    });

    // use useLayoutEffect hook to prevent image render after url revoked
    useLayoutEffect(() => {
        if (process.browser && data) {
            let objectUrl: string | null = null;
            objectUrl = URL.createObjectURL(data);
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
        return <div>{t('error')}</div>;
    }

    return <img src={url} />;
};

export default Image;
