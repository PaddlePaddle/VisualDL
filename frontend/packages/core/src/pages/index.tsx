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

import React, {FunctionComponent, useEffect, useMemo} from 'react';
import {headerHeight, primaryColor, rem, size} from '~/utils/style';
import {useHistory, useLocation} from 'react-router-dom';

import Error from '~/components/Error';
import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import useComponents from '~/hooks/useComponents';
import {useTranslation} from 'react-i18next';

const flatten = <T extends {children?: T[]}>(routes: T[]) => {
    const result: Omit<T, 'children'>[] = [];
    routes.forEach(route => {
        if (route.children) {
            result.push(...flatten(route.children));
        } else {
            result.push(route);
        }
    });
    return result;
};

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
    const [components, loading] = useComponents();
    const history = useHistory();

    const {t} = useTranslation('common');

    const location = useLocation();

    const activeComponents = useMemo(() => flatten(components).filter(c => c.inactive !== true), [components]);

    useEffect(() => {
        if (activeComponents.length) {
            history.replace(activeComponents[0].path + location.search);
        } else {
            // TODO: no component available, add a error tip
        }
    }, [activeComponents, history, location.search]);

    return (
        <CenterWrapper>
            {loading ? (
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
