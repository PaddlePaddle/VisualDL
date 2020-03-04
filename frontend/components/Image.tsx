import React, {FunctionComponent, useEffect, useState, useRef} from 'react';
import {useTranslation} from '~/utils/i18n';
import fetch from 'isomorphic-unfetch';

type ImageProps = {
    src?: string;
};

const Image: FunctionComponent<ImageProps> = ({src}) => {
    const {t} = useTranslation('common');

    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const controller = useRef(null as AbortController | null);

    useEffect(() => {
        if (process.browser) {
            let objectUrl: string | null = null;
            (async () => {
                setLoading(true);
                controller.current?.abort();
                controller.current = new AbortController();
                try {
                    const result = await fetch(src ?? '', {signal: controller.current.signal});
                    const blob = await result.blob();
                    objectUrl = URL.createObjectURL(blob);
                    setUrl(objectUrl);
                } catch {
                    // ignore abort error
                } finally {
                    setLoading(false);
                }
            })();
            return () => {
                objectUrl && URL.revokeObjectURL(objectUrl);
            };
        }
    }, [src]);

    return loading ? <span>{t('loading')}</span> : <img src={url} />;
};

export default Image;
