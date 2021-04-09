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

import React, {FunctionComponent, useEffect, useState} from 'react';
import type {SelectListItem, SelectProps} from '~/components/Select';

import SearchInput from '~/components/SearchInput';
import Select from '~/components/Select';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import useSearchValue from '~/hooks/useSearchValue';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
`;

const LabelSelect = styled<React.FunctionComponent<SelectProps<number>>>(Select)`
    width: 45%;
    min-width: ${rem(80)};
    max-width: ${rem(200)};
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
`;

const LabelInput = styled(SearchInput)`
    input {
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
`;

type LabelSearchResult = {
    labelIndex: number | undefined;
    value: string;
};

export type LabelSearchInputProps = {
    labels: SelectListItem<number>[];
    onChange?: (result: LabelSearchResult) => unknown;
};

const LabelSearchInput: FunctionComponent<LabelSearchInputProps> = ({labels, onChange}) => {
    const [labelIndex, setLabelIndex] = useState<number>(0);
    const [value, setValue] = useState('');
    useEffect(() => {
        setLabelIndex(0);
    }, [labels]);

    const debouncedValue = useSearchValue(value);

    useEffect(() => {
        onChange?.({
            labelIndex,
            value: debouncedValue
        });
    }, [labelIndex, onChange, debouncedValue]);

    return (
        <Wrapper>
            <LabelSelect list={labels} value={labelIndex} onChange={setLabelIndex} />
            <LabelInput value={value} onChange={setValue} />
        </Wrapper>
    );
};

export default LabelSearchInput;
