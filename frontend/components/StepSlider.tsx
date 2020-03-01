import React, {FunctionComponent, useState, useEffect} from 'react';
import styled from 'styled-components';
import {em, textLightColor} from '~/utils/style';
import {useTranslation} from 'react-i18next';
import RangeSlider from '~/components/RangeSlider';

const Label = styled.div`
    color: ${textLightColor};
    font-size: ${em(12)};
    margin-bottom: ${em(5)};
`;

const FullWidthRangeSlider = styled(RangeSlider)`
    width: 100%;
`;

type StepSliderProps = {
    value: number;
    steps: number[];
    onChange?: (value: number) => unknown;
};

const StepSlider: FunctionComponent<StepSliderProps> = ({onChange, value, steps}) => {
    const {t} = useTranslation('samples');
    const [step, setStep] = useState(value);
    useEffect(() => setStep(value), [setStep, value]);

    return (
        <>
            <Label>{`${t('step')}: ${steps[step]}`}</Label>
            <FullWidthRangeSlider
                min={0}
                max={steps.length ? steps.length - 1 : 0}
                step={1}
                value={step}
                onChange={setStep}
                onChangeComplete={() => onChange?.(step)}
            />
        </>
    );
};

export default StepSlider;
