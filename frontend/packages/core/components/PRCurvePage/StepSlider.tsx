import React, {FunctionComponent, useEffect, useState} from 'react';
import {Run, TimeType} from '~/resource/pr-curve';
import {ellipsis, size, textLighterColor} from '~/utils/style';

import Field from '~/components/Field';
import RangeSlider from '~/components/RangeSlider';
import {format} from 'd3-format';
import {formatTime} from '~/utils';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const relativeFormatter = format('.2f');

const TimeDisplay = styled.div`
    color: ${textLighterColor};
    font-size: 0.857142857em;
    padding-left: 1.666666667em;
    margin-bottom: 0.416666667em;
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
