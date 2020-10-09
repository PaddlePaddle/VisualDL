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

import InputRange, {Range} from 'react-input-range';
import React, {FunctionComponent, useCallback} from 'react';
import {WithStyled, em, half, position, sameBorder, size, transitionProps} from '~/utils/style';

import styled from 'styled-components';

const height = em(20);
const railHeight = em(4);
const thumbSize = em(12);

const Wrapper = styled.div<{disabled?: boolean}>`
    height: ${height};

    .input-range {
        height: 100%;
        position: relative;

        &__label {
            display: none;
        }

        --color: var(--primary-color);

        &:hover {
            --color: var(--primary-focused-color);
        }

        &:active {
            --color: var(--primary-active-color);
        }

        &__track {
            cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

            &--background {
                ${size(railHeight, '100%')}
                ${position('absolute', '50%', null, null, null)}
                margin-top: -${half(railHeight)};
                background-color: var(--slider-rail-color);
                border-radius: ${half(railHeight)};
                ${transitionProps('background-color')}
            }

            &--active {
                height: ${railHeight};
                position: absolute;
                background-color: ${props => (props.disabled ? 'var(--text-lighter-color)' : 'var(--color)')};
                border-radius: ${half(railHeight)};
                outline: none;
                ${transitionProps('background-color')}
            }
        }

        &__slider-container {
            top: -${half(`${thumbSize} - ${railHeight}`)};
            margin-left: -${half(thumbSize)};
        }

        &__slider {
            ${size(thumbSize)}
            ${props =>
                sameBorder({
                    width: em(3),
                    color: props.disabled ? 'var(--text-lighter-color)' : 'var(--color)',
                    radius: half(thumbSize)
                })}
            background-color: var(--slider-gripper-color);
            ${transitionProps(['border-color', 'background-color'])}
        }
    }
`;

type RangeSliderProps = {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    disabled?: boolean;
    onChange?: (value: number) => unknown;
    onChangeStart?: () => unknown;
    onChangeComplete?: () => unknown;
};

const RangeSlider: FunctionComponent<RangeSliderProps & WithStyled> = ({
    onChange,
    onChangeStart,
    onChangeComplete,
    className,
    min,
    max,
    step,
    value,
    disabled
}) => {
    const onChangeRange = useCallback((range: number | Range) => onChange?.(range as number), [onChange]);

    return (
        <Wrapper className={className} disabled={disabled}>
            <InputRange
                minValue={min}
                maxValue={max}
                // there may be a warning when `minValue` equals `maxValue` though `allSameValue` is set to TRUE
                // this is a bug of react-input-range
                // ignore for now
                allowSameValues
                step={step}
                disabled={disabled}
                value={value as number}
                onChange={onChangeRange}
                onChangeStart={() => onChangeStart?.()}
                onChangeComplete={() => onChangeComplete?.()}
            />
        </Wrapper>
    );
};

RangeSlider.defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    value: 50
};

export default RangeSlider;
