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

import React, {FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';

import Input from '~/components/Input';

interface NumberInputProps {
    value?: number;
    defaultValue: number;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (value: number) => unknown;
}

const NumberInput: FunctionComponent<NumberInputProps> = ({value, defaultValue, placeholder, disabled, onChange}) => {
    const [inputValue, setInputValue] = useState(Number.isFinite(value) ? value + '' : '');
    useEffect(() => setInputValue(Number.isFinite(value) ? value + '' : ''), [value]);

    const inputChanged = useCallback(() => {
        if (inputValue === '') {
            onChange?.(defaultValue);
            return;
        }
        const v = Number.parseFloat(inputValue);
        if (Number.isNaN(v)) {
            setInputValue(Number.isFinite(value) ? value + '' : '');
        } else {
            onChange?.(v);
            setInputValue(v + '');
        }
    }, [defaultValue, inputValue, onChange, value]);

    const keyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                inputChanged();
            }
        },
        [inputChanged]
    );

    return (
        <Input
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            onBlur={inputChanged}
            onKeyDown={keyDown}
            onChange={setInputValue}
        />
    );
};

export default NumberInput;
