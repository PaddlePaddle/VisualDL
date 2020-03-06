import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import useSWR from 'swr';
import {primaryColor} from '~/utils/style';
import {blobFetcher} from '~/utils/fetch';
import GridLoader from 'react-spinners/GridLoader';

type ImageProps = {
    src?: string;
};

const Image: FunctionComponent<ImageProps> = ({src}) => {
    const [url, setUrl] = useState('');

    const {data} = useSWR(src ?? null, blobFetcher);

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

    return !data ? <GridLoader color={primaryColor} size="10px" /> : <img src={url} />;
};

export default Image;
