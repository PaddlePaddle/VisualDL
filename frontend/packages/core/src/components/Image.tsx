/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
