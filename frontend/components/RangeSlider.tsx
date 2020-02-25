import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {WithStyled, em, size, half, math, primaryColor, backgroundColor} from '~/utils/style';
import InputRange, {Range} from 'react-input-range';

const height = em(20);
const railHeight = em(4);
const thumbSize = em(12);
const railColor = '#DBDEEB';

const Wrapper = styled.div`
    height: ${height};

    .input-range {
        height: 100%;
        position: relative;

        &__label {
            display: none;
        }

        &__track {
            cursor: pointer;

            &--background {
                height: ${railHeight};
                width: 100%;
                position: absolute;
                top: 50%;
                margin-top: -${half(railHeight)};
                background-color: ${railColor};
                border-radius: ${half(railHeight)};
            }

            &--active {
                height: ${railHeight};
                position: absolute;
                background-color: ${primaryColor};
                border-radius: ${half(railHeight)};
            }
        }

        &__slider-container {
            top: -${math(`(${thumbSize} - ${railHeight}) / 2`)};
            margin-left: -${half(thumbSize)};
        }

        &__slider {
            ${size(thumbSize)}
            border-radius: ${half(thumbSize)};
            border: ${em(3)} solid ${primaryColor};
            background-color: ${backgroundColor};
        }
    }
`;

type RangeSliderProps = {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange?: (value: number) => unknown;
    onChangeComplete?: () => unknown;
};

const RangeSlider: FunctionComponent<RangeSliderProps & WithStyled> = ({
    onChange,
    onChangeComplete,
    className,
    min,
    max,
    step,
    value
}) => {
    const onChangeRange = (range: number | Range) => onChange?.(range as number);

    return (
        <Wrapper className={className}>
            <InputRange
                minValue={min}
                maxValue={max}
                step={step}
                value={value as number}
                onChange={onChangeRange}
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
