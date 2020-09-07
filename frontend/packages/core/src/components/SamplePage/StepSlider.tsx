import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {em, textLightColor} from '~/utils/style';

import RangeSlider from '~/components/RangeSlider';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Label = styled.div`
    display: flex;
    justify-content: space-between;
    color: ${textLightColor};
    font-size: ${em(12)};
    margin-bottom: ${em(5)};

    > :not(:first-child) {
        flex-grow: 0;
    }
`;

const FullWidthRangeSlider = styled(RangeSlider)`
    width: 100%;
`;

type StepSliderProps = {
    value: number;
    steps: number[];
    onChange?: (value: number) => unknown;
    onChangeComplete?: () => unknown;
};

const StepSlider: FunctionComponent<StepSliderProps> = ({onChange, onChangeComplete, value, steps, children}) => {
    const {t} = useTranslation('sample');
    const [step, setStep] = useState(value);

    useEffect(() => setStep(value), [value]);

    const changeStep = useCallback(
        (num: number) => {
            setStep(num);
            onChange?.(num);
        },
        [onChange]
    );

    return (
        <>
            <Label>
                <span>{`${t('sample:step')}: ${steps[step] ?? '...'}`}</span>
                {children && <span>{children}</span>}
            </Label>
            <FullWidthRangeSlider
                min={0}
                max={steps.length ? steps.length - 1 : 0}
                step={1}
                value={step}
                onChange={changeStep}
                onChangeComplete={onChangeComplete}
            />
        </>
    );
};

export default StepSlider;
