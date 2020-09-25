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
import {WithStyled, rem} from '~/utils/style';

import styled from 'styled-components';

const Wrapper = styled.div`
    & + & {
        margin-top: ${rem(20)};
    }
`;

const Label = styled.div`
    margin-bottom: ${rem(10)};
`;

type FieldProps = {
    label?: string | JSX.Element;
};

const Field: FunctionComponent<FieldProps & WithStyled> = ({label, children, className}) => (
    <Wrapper className={className}>
        {label && <Label>{label}</Label>}
        {children}
    </Wrapper>
);

export default Field;
