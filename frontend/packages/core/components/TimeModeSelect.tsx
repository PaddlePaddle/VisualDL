import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';

import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import {TimeMode} from '~/types';
import {useTranslation} from '~/utils/i18n';

const timeModes = [TimeMode.Step, TimeMode.Relative, TimeMode.WallTime] as const;

type TimeModeSelectProps = {
    value: TimeMode;
    onChange?: (value: TimeMode) => unknown;
};

const TimeModeSelect: FunctionComponent<TimeModeSelectProps> = ({value, onChange}) => {
    const {t} = useTranslation('common');

    const [timeMode, setTimeMode] = useState(value);

    useEffect(() => setTimeMode(value), [value]);

    const change = useCallback(
        (v: TimeMode) => {
            setTimeMode(v);
            onChange?.(v);
        },
        [onChange]
    );

    return (
        <RadioGroup value={timeMode} onChange={change}>
            {timeModes.map(value => (
                <RadioButton key={value} value={value}>
                    {t(`common:time-mode.${value}`)}
                </RadioButton>
            ))}
        </RadioGroup>
    );
};

export default TimeModeSelect;
