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

import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';

import Checkbox from '~/components/Checkbox';
import without from 'lodash/without';

interface DiscreteIndicatorDetailsProps<T extends string | number> {
    list: T[];
    values?: T[];
    disabled?: boolean;
    onChange?: (values: T[]) => unknown;
}

const DiscreteIndicatorDetails = <T extends string | number>({
    list,
    values,
    disabled,
    onChange
}: DiscreteIndicatorDetailsProps<T>): ReturnType<FunctionComponent> => {
    const [selected, setSelected] = useState(values ?? list);
    useEffect(() => setSelected(values ?? list), [list, values]);

    const changeValue = useCallback(
        (value: T, checked: boolean) => {
            setSelected(v => {
                if (checked && !v.includes(value)) {
                    const nv = [...v, value];
                    onChange?.(nv);
                    return nv;
                }
                if (!checked && v.includes(value)) {
                    const nv = without(v, value);
                    onChange?.(nv);
                    return nv;
                }
                return v;
            });
        },
        [onChange]
    );

    return (
        <>
            {list.map((value, index) => (
                <Checkbox
                    checked={selected.includes(value)}
                    disabled={disabled}
                    onChange={checked => changeValue(value, checked)}
                    key={index}
                >
                    {value}
                </Checkbox>
            ))}
        </>
    );
};

export default DiscreteIndicatorDetails;
