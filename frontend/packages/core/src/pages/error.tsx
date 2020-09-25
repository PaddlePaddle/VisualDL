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

import React, {FunctionComponent} from 'react';

import Content from '~/components/Content';
import ErrorComponent from '~/components/Error';
import {useTranslation} from 'react-i18next';

type ErrorProps = {
    title?: string;
    desc?: string;
};

const Error: FunctionComponent<ErrorProps> = ({title, desc, children}) => {
    const {t} = useTranslation('errors');

    return (
        <Content>
            <ErrorComponent>
                {children || (
                    <>
                        <h4>{title ?? t('errors:error')}</h4>
                        <p>{desc}</p>
                    </>
                )}
            </ErrorComponent>
        </Content>
    );
};

export default Error;
