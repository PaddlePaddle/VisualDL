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

import React, {FunctionComponent, useCallback, useState} from 'react';
import {height, padding} from '~/components/Input';
import {rem, size, transitionProps} from '~/utils/style';

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
    ${transitionProps(['border-color', 'color', 'caret-color'])}
    border: none;
    border-bottom: 1px solid var(--border-color);
    text-align: center;
    background-color: transparent;
    color: var(--text-color);
    caret-color: var(--text-color);

    &:hover,
    &:focus {
        border-bottom-color: var(--border-focused-color);
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
