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

import Input from '~/components/Input';
import type {WithStyled} from '~/utils/style';

interface NumberInputProps {
    value?: number;
    defaultValue: number;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (value: number) => unknown;
}

const NumberInput: FunctionComponent<NumberInputProps & WithStyled> = ({
    value,
    defaultValue,
    placeholder,
    className,
    disabled,
    onChange
}) => {
    const [inputValue, setInputValue] = useState(Number.isFinite(value) ? value + '' : '');
    useEffect(() => setInputValue(Number.isFinite(value) ? value + '' : ''), [value]);

    useEffect(() => {
        if (inputValue === '' && value !== defaultValue) {
            onChange?.(defaultValue);
            return;
        }
        const v = Number.parseFloat(inputValue);
        if (!Number.isNaN(v)) {
            onChange?.(v);
        }
    }, [defaultValue, inputValue, onChange, value]);

    const check = useCallback(() => {
        const v = Number.parseFloat(inputValue);
        if (Number.isNaN(v)) {
            setInputValue(Number.isFinite(value) ? value + '' : '');
        } else {
            debugger;
            setInputValue(v + '');
        }
    }, [inputValue, value]);

    return (
        <Input
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            onBlur={check}
            onChange={setInputValue}
        />
    );
};

export default NumberInput;
