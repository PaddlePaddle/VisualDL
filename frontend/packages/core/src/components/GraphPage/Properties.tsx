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

import type {Properties as PropertiesType} from '~/resource/graph/types';
import Property from '~/components/GraphPage/Property';
import {em} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Header = styled.div`
    font-size: ${em(16)};
    font-weight: 700;
    padding: ${em(10)} 0;
`;

type PropertiesProps = PropertiesType & {
    expand?: boolean;
    showNodeDodumentation?: () => unknown;
};

const Properties: FunctionComponent<PropertiesProps> = ({properties, groups, expand, showNodeDodumentation}) => {
    const {t} = useTranslation('graph');

    return (
        <>
            {properties?.map((property, index) => (
                <Property
                    name={t(`graph:properties.${property.name}`)}
                    values={property.values}
                    key={index}
                    showNodeDodumentation={showNodeDodumentation}
                />
            ))}
            {groups?.map((group, index) => (
                <React.Fragment key={index}>
                    <Header>{t(`graph:properties.${group.name}`)}</Header>
                    {group.properties?.map((property, anotherIndex) => (
                        <Property
                            {...property}
                            key={anotherIndex}
                            expand={expand}
                            showNodeDodumentation={showNodeDodumentation}
                        />
                    ))}
                </React.Fragment>
            ))}
        </>
    );
};

export default Properties;
