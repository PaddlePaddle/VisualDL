import React, {FunctionComponent, useCallback, useState} from 'react';
import {borderColor, borderFocusedColor, rem, size, transitionProps} from '~/utils/style';
import {height, padding} from '~/components/Input';

import Field from '~/components/Field';
import RangeSlider from '~/components/RangeSlider';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const fixNumber = (v: number) => Math.round(v * 100) / 100;

const Slider = styled.div`
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

type SmoothingSliderProps = {
    value: number;
    onChange?: (value: number) => unknown;
};

const SmoothingSlider: FunctionComponent<SmoothingSliderProps> = ({onChange, value}) => {
    const {t} = useTranslation('scalars');
    const [smoothing, setSmoothing] = useState(fixNumber(value));
    const [inputValue, setInputValue] = useState(smoothing + '');

    const changeSliderValue = useCallback((value: number) => {
        const v = fixNumber(value);
        setInputValue(v + '');
        setSmoothing(v);
    }, []);

    const changeInputValue = useCallback(
        (value: string) => {
            setInputValue(value);

            const v = Number.parseFloat(value);

            if (v < 0 || v >= 1 || Number.isNaN(v)) {
                return;
            }

            const result = fixNumber(v);

            setSmoothing(result);
            onChange?.(result);
        },
        [onChange]
    );

    return (
        <Field label={t('smoothing')}>
            <Slider>
                <FullWidthRangeSlider
                    min={0}
                    max={0.99}
                    step={0.01}
                    value={smoothing}
                    onChange={changeSliderValue}
                    onChangeComplete={() => onChange?.(smoothing)}
                />
                <Input
                    type="text"
                    value={inputValue}
                    onChange={e => changeInputValue(e.currentTarget.value)}
                    onBlur={() => setInputValue(smoothing + '')}
                    onKeyDown={e => e.key === 'Enter' && setInputValue(smoothing + '')}
                />
            </Slider>
        </Field>
    );
};

export default SmoothingSlider;
