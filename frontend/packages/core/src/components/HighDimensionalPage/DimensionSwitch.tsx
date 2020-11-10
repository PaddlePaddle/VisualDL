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

import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';

import type {Dimension} from '~/resource/high-dimensional';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import {useTranslation} from 'react-i18next';

const dimensions: Dimension[] = ['2d', '3d'];

type DimensionSwitchProps = {
    value: Dimension;
    onChange?: (value: Dimension) => unknown;
};

const DimensionSwitch: FunctionComponent<DimensionSwitchProps> = ({value, onChange}) => {
    const {t} = useTranslation('high-dimensional');

    const [dimension, setDimension] = useState(value);
    useEffect(() => setDimension(value), [value]);
    const change = useCallback(
        (val: Dimension) => {
            setDimension(val);
            onChange?.(val);
        },
        [onChange]
    );

    return (
        <RadioGroup value={dimension} onChange={change}>
            {dimensions.map(d => (
                <RadioButton key={d} value={d}>
                    {t(`high-dimensional:dimension-value.${d}`)}
                </RadioButton>
            ))}
        </RadioGroup>
    );
};

export default DimensionSwitch;
