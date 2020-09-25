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

import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import {TimeMode} from '~/types';
import {useTranslation} from 'react-i18next';

const timeModes = [TimeMode.Step, TimeMode.Relative, TimeMode.WallTime] as const;

type TimeModeSelectProps = {
    value: TimeMode;
    onChange?: (value: TimeMode) => unknown;
};

const TimeModeSelect: FunctionComponent<TimeModeSelectProps> = ({value, onChange}) => {
    const {t} = useTranslation('common');

    const [timeMode, setTimeMode] = useState(value);

    useEffect(() => setTimeMode(value), [value]);

    const change = useCallback(
        (v: TimeMode) => {
            setTimeMode(v);
            onChange?.(v);
        },
        [onChange]
    );

    return (
        <RadioGroup value={timeMode} onChange={change}>
            {timeModes.map(value => (
                <RadioButton key={value} value={value}>
                    {t(`common:time-mode.${value}`)}
                </RadioButton>
            ))}
        </RadioGroup>
    );
};

export default TimeModeSelect;
