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

import React, {FunctionComponent, useEffect, useState} from 'react';
import {ellipsis, size, transitionProps} from '~/utils/style';

import Field from '~/components/Field';
import RangeSlider from '~/components/RangeSlider';
import type {Run} from '~/resource/pr-curve';
import {TimeType} from '~/resource/pr-curve';
import {format} from 'd3-format';
import {formatTime} from '~/utils';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const relativeFormatter = format('.2f');

const TimeDisplay = styled.div`
    color: var(--text-lighter-color);
    font-size: 0.857142857em;
    padding-left: 1.666666667em;
    margin-bottom: 0.416666667em;
    ${transitionProps('color')}
`;

const Label = styled.span<{color: string}>`
    display: inline-block;
    padding-left: 1.428571429em;
    position: relative;
    ${ellipsis()}

    &::before {
        content: '';
        display: block;
        ${size('0.857142857em', '0.857142857em')}
        background-color: ${props => props.color};
        border-radius: 50%;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
    }
`;

const FullWidthRangeSlider = styled(RangeSlider)`
    width: 100%;
`;

const typeMap = {
    [TimeType.WallTime]: 'wallTimes',
    [TimeType.Relative]: 'relatives',
    [TimeType.Step]: 'steps'
} as const;

const formatter = {
    [TimeType.WallTime]: (wallTime: number, {i18n}: ReturnType<typeof useTranslation>) =>
        formatTime(wallTime, i18n.language),
    [TimeType.Relative]: (relative: number) => `${relativeFormatter(relative)} ms`,
    [TimeType.Step]: (step: number, {t}: ReturnType<typeof useTranslation>) => `${t('common:time-mode.step')} ${step}`
} as const;

type StepSliderProps = {
    run: Run;
    type: TimeType;
    onChange?: (step: number) => unknown;
};

const StepSlider: FunctionComponent<StepSliderProps> = ({onChange, run, type}) => {
    const translation = useTranslation('common');

    const [index, setIndex] = useState(run.index);
    useEffect(() => setIndex(run.index), [run.index]);

    return (
        <Field
            label={
                <Label color={run.colors[0]} title={run.label}>
                    {run.label}
                </Label>
            }
        >
            <TimeDisplay>
                {run[typeMap[type]][index] == null ? '...' : formatter[type](run[typeMap[type]][index], translation)}
            </TimeDisplay>
            <FullWidthRangeSlider
                min={0}
                max={run.steps.length ? run.steps.length - 1 : 0}
                step={1}
                value={index}
                onChange={setIndex}
                onChangeComplete={() => onChange?.(index)}
            />
        </Field>
    );
};

export default StepSlider;
