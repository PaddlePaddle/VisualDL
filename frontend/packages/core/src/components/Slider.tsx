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

import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
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
    min?: number;
    max?: number;
    step?: number;
    steps?: number[];
    value: number;
    onChange?: (value: number) => unknown;
    onChangeComplete?: (value: number) => unknown;
};

const Slider: FunctionComponent<SliderProps> = ({onChange, onChangeComplete, value, min, max, step, steps}) => {
    const sortedSteps = useMemo(() => steps?.sort() ?? [], [steps]);
    const fixedMin = useMemo(() => (sortedSteps.length ? 0 : min ?? 0), [min, sortedSteps]);
    const fixedMax = useMemo(() => (sortedSteps.length ? sortedSteps.length - 1 : max ?? 1), [max, sortedSteps]);
    const fixedStep = useMemo(() => (sortedSteps.length ? 1 : step ?? 1), [step, sortedSteps]);

    const fixNumber = useCallback(
        (v: number) =>
            new BigNumber(v)
                .dividedBy(fixedStep)
                .integerValue(BigNumber.ROUND_HALF_UP)
                .multipliedBy(fixedStep)
                .toNumber(),
        [fixedStep]
    );

    const actualValueByInput = useCallback(
        (v: number) => {
            if (sortedSteps.length) {
                let r = Number.NaN;
                let d = Number.POSITIVE_INFINITY;
                for (let i = 0; i < sortedSteps.length; i++) {
                    const c = Math.abs(sortedSteps[i] - v);
                    if (d > c) {
                        d = c;
                        r = sortedSteps[i];
                    }
                }
                return r;
            }
            return fixNumber(v);
        },
        [fixNumber, sortedSteps]
    );
    const sliderValueByInput = useCallback(
        (v: number) => {
            if (sortedSteps.length) {
                let r = -1;
                let d = Number.POSITIVE_INFINITY;
                for (let i = 0; i < sortedSteps.length; i++) {
                    const c = Math.abs(sortedSteps[i] - v);
                    if (d > c) {
                        d = c;
                        r = i;
                    }
                }
                return r;
            }
            return fixNumber(v);
        },
        [fixNumber, sortedSteps]
    );
    const actualValueBySlider = useCallback(
        (v: number) => {
            if (sortedSteps.length) {
                return sortedSteps[v];
            }
            return v;
        },
        [sortedSteps]
    );

    const [sliderValue, setSliderValue] = useState(sliderValueByInput(value));
    const [inputValue, setInputValue] = useState(actualValueByInput(value) + '');

    const changeSliderValue = useCallback(
        (v: number) => {
            setSliderValue(v);
            const actualValue = actualValueBySlider(v);
            setInputValue(actualValue + '');
            onChange?.(actualValue);
        },
        [actualValueBySlider, onChange]
    );
    const changeSliderValueComplete = useCallback(() => {
        onChangeComplete?.(actualValueBySlider(sliderValue));
    }, [sliderValue, onChangeComplete, actualValueBySlider]);

    const changeInputValue = useCallback(
        (stringValue: string) => {
            setInputValue(stringValue);

            const v = Number.parseFloat(stringValue);

            if (v < fixedMin || v > fixedMax || Number.isNaN(v)) {
                return;
            }

            setSliderValue(sliderValueByInput(v));
            const actualValue = actualValueByInput(v);
            onChange?.(actualValue);
            onChangeComplete?.(actualValue);
        },
        [fixedMin, fixedMax, sliderValueByInput, actualValueByInput, onChange, onChangeComplete]
    );

    const confirmInput = useCallback(() => {
        setInputValue(actualValueBySlider(sliderValue) + '');
    }, [actualValueBySlider, sliderValue]);

    return (
        <Wrapper>
            <FullWidthRangeSlider
                min={fixedMin}
                max={fixedMax}
                step={fixedStep}
                value={sliderValue}
                onChange={changeSliderValue}
                onChangeComplete={changeSliderValueComplete}
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
