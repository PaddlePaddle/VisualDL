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

import React, {FunctionComponent, useEffect} from 'react';
import {headerHeight, primaryColor, rem, size} from '~/utils/style';
import {useHistory, useLocation} from 'react-router-dom';

import Error from '~/components/Error';
import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import useAvailableComponents from '~/hooks/useAvailableComponents';
import {useTranslation} from 'react-i18next';

const CenterWrapper = styled.div`
    ${size(`calc(100vh - ${headerHeight})`, '100vw')}
    overscroll-behavior: none;
`;

const Loading = styled.div`
    font-size: ${rem(16)};
    height: 100%;
    line-height: ${rem(60)};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const IndexPage: FunctionComponent = () => {
    const [components, , loading] = useAvailableComponents();
    const history = useHistory();

    const {t} = useTranslation('common');

    const location = useLocation();

    useEffect(() => {
        if (components.length) {
            if (components[0].path) {
                history.replace(components[0].path + location.search);
            } else if (components[0].children?.length && components[0].children[0].path) {
                history.replace(components[0].children[0].path + location.search);
            }
        } else {
            // TODO: no component available, add a error tip
        }
    }, [components, history, location.search]);

    return (
        <CenterWrapper>
            {loading || components.length ? (
                <Loading>
                    <HashLoader size="60px" color={primaryColor} />
                    <span>{t('common:loading')}</span>
                </Loading>
            ) : (
                <Error />
            )}
        </CenterWrapper>
    );
};

export default IndexPage;
