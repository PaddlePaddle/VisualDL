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

import type {IndicatorType, Range} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';

import Checkbox from '~/components/Checkbox';
import ContinuousIndicatorDetails from './ContinuousIndicatorDetails';
import DiscreteIndicatorDetails from './DiscreteIndicatorDetails';
import Icon from '~/components/Icon';
import {rem} from '~/utils/style';
import styled from 'styled-components';

const Title = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    > * {
        flex-grow: 1;
    }

    > .expander {
        margin-left: 1em;
        flex-grow: 0;
        cursor: pointer;
        color: var(--text-lighter-color);
        font-size: 0.75em;

        &:hover {
            color: var(--text-light-color);
        }
    }
`;

const Details = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    margin-left: ${rem(24)};
    font-size: ${rem(12)};

    > * {
        margin-top: ${rem(10)};
    }
`;

interface IndicatorProps {
    name: string;
    type: IndicatorType;
    selected?: boolean;
    values?: string[] | number[];
    selectedValues?: string[] | number[];
    min?: number;
    max?: number;
    onToggle?: (value: boolean) => unknown;
    onChange?: (data: Range | string[] | number[]) => unknown;
}

const Indicator: FunctionComponent<IndicatorProps> = ({
    name,
    type,
    selected: propsSelected,
    values,
    selectedValues: propsSelectedValues,
    min,
    max,
    onToggle,
    onChange
}) => {
    const [expand, setExpand] = useState(true);

    const [selected, setSelected] = useState(propsSelected ?? true);
    useEffect(() => setSelected(propsSelected ?? true), [propsSelected]);

    const [selectedValues, setSelectedValues] = useState(propsSelectedValues ?? []);
    useEffect(() => setSelectedValues(propsSelectedValues ?? []), [propsSelectedValues]);

    const [range, setRange] = useState<Range>({
        min: min ?? Number.NEGATIVE_INFINITY,
        max: max ?? Number.POSITIVE_INFINITY
    });
    useEffect(
        () =>
            setRange({
                min: min ?? Number.NEGATIVE_INFINITY,
                max: max ?? Number.POSITIVE_INFINITY
            }),
        [min, max]
    );

    const toggle = useCallback(() => {
        onToggle?.(!selected);
        setSelected(value => !value);
    }, [onToggle, selected]);

    const change = useCallback(
        (data: Range | string[] | number[]) => {
            if (type === 'continuous') {
                setSelectedValues(data as string[] | number[]);
            } else {
                setRange(data as Range);
            }
            onChange?.(data);
        },
        [onChange, type]
    );

    const details = useMemo(() => {
        switch (type) {
            case 'string':
            case 'numeric':
                return <DiscreteIndicatorDetails list={values ?? []} values={selectedValues} onChange={change} />;
            case 'continuous':
                return <ContinuousIndicatorDetails min={range.min} max={range.max} onChange={change} />;
            default:
                return null as never;
        }
    }, [change, range.max, range.min, selectedValues, type, values]);

    return (
        <>
            <Title>
                <Checkbox checked={selected} onChange={toggle}>
                    {name}
                </Checkbox>
                <a className="expander" onClick={() => setExpand(v => !v)}>
                    <Icon type={expand ? 'chevron-down' : 'chevron-up'} />
                </a>
            </Title>
            {expand ? <Details>{details}</Details> : null}
        </>
    );
};

export default Indicator;
