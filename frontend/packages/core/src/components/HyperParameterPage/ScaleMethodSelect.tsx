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

import React, {FunctionComponent, useMemo} from 'react';
import {SCALE_METHODS, ScaleMethod} from '~/resource/hyper-parameter';

import Select from '~/components/HyperParameterPage/BorderLessSelect';
import type {SelectProps} from '~/components/Select';
import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const StyledSelect = styled(Select)<React.FunctionComponent<SelectProps<ScaleMethod>>>`
    min-width: 7em;
`;

interface ScaleMethodSelectProps {
    scaleMethod: ScaleMethod;
    direction?: 'bottom' | 'top';
    onChange?: (scaleMethod: ScaleMethod) => unknown;
}

const ScaleMethodSelect: FunctionComponent<ScaleMethodSelectProps & WithStyled> = ({
    scaleMethod,
    direction,
    onChange
}) => {
    const {t} = useTranslation('hyper-parameter');
    const scaleMethods = useMemo(
        () =>
            SCALE_METHODS.map(method => ({
                value: method,
                label: t(`hyper-parameter:scale-method.${method}`)
            })),
        [t]
    );

    return (
        <StyledSelect
            direction={direction}
            list={scaleMethods}
            value={scaleMethod}
            onChange={(scale: string) => onChange?.(scale as ScaleMethod)}
        />
    );
};

export default ScaleMethodSelect;
