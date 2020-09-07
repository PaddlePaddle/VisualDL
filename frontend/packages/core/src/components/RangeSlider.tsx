import InputRange, {Range} from 'react-input-range';
import React, {FunctionComponent, useCallback} from 'react';
import {
    WithStyled,
    backgroundColor,
    em,
    half,
    position,
    primaryActiveColor,
    primaryColor,
    primaryFocusedColor,
    sameBorder,
    size,
    textLighterColor
} from '~/utils/style';

import styled from 'styled-components';

const height = em(20);
const railHeight = em(4);
const thumbSize = em(12);
const railColor = '#DBDEEB';

const Wrapper = styled.div<{disabled?: boolean}>`
    height: ${height};

    .input-range {
        height: 100%;
        position: relative;

        &__label {
            display: none;
        }

        --color: ${primaryColor};

        &:hover {
            --color: ${primaryFocusedColor};
        }

        &:active {
            --color: ${primaryActiveColor};
        }

        &__track {
            cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

            &--background {
                ${size(railHeight, '100%')}
                ${position('absolute', '50%', null, null, null)}
                margin-top: -${half(railHeight)};
                background-color: ${railColor};
                border-radius: ${half(railHeight)};
            }

            &--active {
                height: ${railHeight};
                position: absolute;
                background-color: ${props => (props.disabled ? textLighterColor : 'var(--color)')};
                border-radius: ${half(railHeight)};
                outline: none;
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
                    color: props.disabled ? textLighterColor : 'var(--color)',
                    radius: half(thumbSize)
                })}
            background-color: ${backgroundColor};
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
