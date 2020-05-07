import React, {FunctionComponent, useCallback, useState} from 'react';
import {borderColor, borderFocusedColor, rem, size, transitionProps} from '~/utils/style';
import {height, padding} from '~/components/Input';

import BigNumber from 'bignumber.js';
import RangeSlider from '~/components/RangeSlider';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

const Input = styled.input`
    ${size(height, rem(52))};
    line-height: ${height};
    display: inline-block;
    outline: none;
    padding: ${padding};
    ${transitionProps('border-color')}
    border: none;
    border-bottom: 1px solid ${borderColor};
    text-align: center;

    &:hover,
    &:focus {
        border-bottom-color: ${borderFocusedColor};
    }
`;

const FullWidthRangeSlider = styled(RangeSlider)`
    flex-grow: 1;
    margin-right: ${rem(20)};
`;

type SliderProps = {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange?: (value: number) => unknown;
    onChangeComplete?: (value: number) => unknown;
};

const Slider: FunctionComponent<SliderProps> = ({onChange, onChangeComplete, value, min, max, step}) => {
    const fixNumber = useCallback(
        (v: number) =>
            new BigNumber(v).dividedBy(step).integerValue(BigNumber.ROUND_HALF_UP).multipliedBy(step).toNumber(),
        [step]
    );

    const [sliderValue, setSliderValue] = useState(fixNumber(value));
    const [inputValue, setInputValue] = useState(sliderValue + '');

    const changeSliderValue = useCallback(
        (value: number) => {
            const v = fixNumber(value);
            setInputValue(v + '');
            setSliderValue(v);
            onChange?.(v);
        },
        [fixNumber, onChange]
    );

    const changeInputValue = useCallback(
        (value: string) => {
            setInputValue(value);

            const v = Number.parseFloat(value);

            if (v < min || v > max || Number.isNaN(v)) {
                return;
            }

            const result = fixNumber(v);

            setSliderValue(result);
            onChange?.(result);
            onChangeComplete?.(result);
        },
        [onChange, onChangeComplete, min, max, fixNumber]
    );

    const confirmInput = useCallback(() => {
        setInputValue(sliderValue + '');
    }, [sliderValue]);

    return (
        <Wrapper>
            <FullWidthRangeSlider
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={changeSliderValue}
                onChangeComplete={() => onChangeComplete?.(sliderValue)}
            />
            <Input
                type="text"
                value={inputValue}
                onChange={e => changeInputValue(e.currentTarget.value)}
                onBlur={confirmInput}
                onKeyDown={e => e.key === 'Enter' && confirmInput()}
            />
        </Wrapper>
    );
};

export default Slider;
