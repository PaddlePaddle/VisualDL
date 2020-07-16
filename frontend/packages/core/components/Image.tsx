import {BlobResponse, blobFetcher} from '~/utils/fetch';
import React, {useImperativeHandle, useLayoutEffect, useState} from 'react';
import {WithStyled, primaryColor} from '~/utils/style';

import GridLoader from 'react-spinners/GridLoader';
import mime from 'mime-types';
import {saveAs} from 'file-saver';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from '~/utils/i18n';

export type ImageRef = {
    save(filename: string): void;
};

type ImageProps = {
    src?: string;
    cache?: number;
};

const Image = React.forwardRef<ImageRef, ImageProps & WithStyled>(({src, cache, className}, ref) => {
    const {t} = useTranslation('common');

    const [url, setUrl] = useState('');

    const {data, error, loading} = useRequest<BlobResponse>(src ?? null, blobFetcher, {
        dedupingInterval: cache ?? 2000
    });

    useImperativeHandle(ref, () => ({
        save: (filename: string) => {
            if (data) {
                const ext = data.type ? mime.extension(data.type) : null;
                saveAs(data.data, filename.replace(/[/\\?%*:|"<>]/g, '_') + (ext ? `.${ext}` : ''));
            }
        }
    }));

    // use useLayoutEffect hook to prevent image render after url revoked
    useLayoutEffect(() => {
        if (process.browser && data) {
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

    return <img className={className} src={url} />;
});

export default Image;
