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
import Select, {SelectProps} from '~/components/Select';

import SearchInput from '~/components/SearchInput';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import useSearchValue from '~/hooks/useSearchValue';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
`;

const LabelSelect = styled<React.FunctionComponent<SelectProps<string>>>(Select)`
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
    labelBy: string | undefined;
    value: string;
};

export type LabelSearchInputProps = {
    labels: string[];
    onChange?: (result: LabelSearchResult) => unknown;
};

const LabelSearchInput: FunctionComponent<LabelSearchInputProps> = ({labels, onChange}) => {
    const [labelBy, setLabelBy] = useState<string | undefined>(labels[0] ?? undefined);
    const [value, setValue] = useState('');
    useEffect(() => {
        if (labels.length) {
            setLabelBy(label => {
                if (label && labels.includes(label)) {
                    return label;
                }
                return labels[0];
            });
        } else {
            setLabelBy(undefined);
        }
    }, [labels]);

    const debouncedValue = useSearchValue(value);

    useEffect(() => {
        onChange?.({
            labelBy,
            value: debouncedValue
        });
    }, [labelBy, onChange, debouncedValue]);

    return (
        <Wrapper>
            <LabelSelect list={labels} value={labelBy} onChange={setLabelBy} />
            <LabelInput value={value} onChange={setValue} />
        </Wrapper>
    );
};

export default LabelSearchInput;
