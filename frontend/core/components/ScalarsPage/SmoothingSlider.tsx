import React, {FunctionComponent, useState} from 'react';

import Field from '~/components/Field';
import RangeSlider from '~/components/RangeSlider';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const FullWidthRangeSlider = styled(RangeSlider)`
    width: 100%;
`;

type SmoothingSliderProps = {
    value: number;
    onChange?: (value: number) => unknown;
};

const SmoothingSlider: FunctionComponent<SmoothingSliderProps> = ({onChange, value}) => {
    const {t} = useTranslation('scalars');
    const [smoothing, setSmoothing] = useState(value);

    return (
        <Field label={`${t('smoothing')}: ${Math.round(smoothing * 100) / 100}`}>
            <FullWidthRangeSlider
                min={0}
                max={0.99}
                step={0.01}
                value={smoothing}
                onChange={setSmoothing}
                onChangeComplete={() => onChange?.(smoothing)}
            />
        </Field>
    );
};

export default SmoothingSlider;
