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
import {rem, size} from '~/utils/style';

import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const LANGUAGE_FLAGS = [
    ['zh', '中'],
    ['en', 'En']
];

const Item = styled.span<{active: boolean}>`
    display: inline-block;
    color: currentColor;
    opacity: ${props => (props.active ? 1 : 0.29)};
`;

const Divider = styled.span`
    display: inline-block;
    margin: 0 ${rem(5)};
    ${size('1em', '1px')}
    background-color: currentColor;
`;

const Language: FunctionComponent = () => {
    const {i18n} = useTranslation();

    return (
        <>
            {LANGUAGE_FLAGS.map(([l, f], i) => (
                <React.Fragment key={f}>
                    {i !== 0 && <Divider />}
                    <Item active={l === i18n.language}>{f}</Item>
                </React.Fragment>
            ))}
        </>
    );
};

export default Language;
