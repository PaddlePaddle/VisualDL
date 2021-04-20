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

import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';

import Checkbox from '~/components/Checkbox';
import ContinuousIndicatorDetails from './ContinuousIndicatorDetails';
import DiscreteIndicatorDetails from './DiscreteIndicatorDetails';
import Icon from '~/components/Icon';
import type {Range} from '~/resource/hyper-parameter';
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

type ValuesType<T> = T extends 'continuous'
    ? undefined
    : T extends 'string'
    ? string[]
    : T extends 'numeric'
    ? number[]
    : never;
interface IndicatorProps<T extends 'string' | 'numeric' | 'continuous'> {
    name: string;
    type: T;
    values: ValuesType<T>;
    onChange?: T extends 'continuous'
        ? (range: {min: number; max: number}) => unknown
        : T extends 'string' | 'numeric'
        ? (values: ValuesType<T>) => unknown
        : never;
    onToggle?: (value: boolean) => unknown;
}

const Indicator = <T extends 'string' | 'numeric' | 'continuous'>({
    name,
    type,
    values,
    onToggle
}: IndicatorProps<T>): ReturnType<FunctionComponent> => {
    const [expand, setExpand] = useState(true);

    const [selected, setSelected] = useState(true);
    const toggle = useCallback(() => {
        setSelected(value => {
            onToggle?.(!value);
            return !value;
        });
    }, [onToggle]);

    const [selectedValues, setSelectedValues] = useState(values);
    const [range, setRange] = useState<Range>({min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY});

    useEffect(() => {
        setExpand(true);
        setSelected(true);
        setRange({min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY});
    }, [name]);
    useEffect(() => {
        setSelectedValues(values);
    }, [name, values]);

    const details = useMemo(() => {
        switch (type) {
            case 'string':
            case 'numeric':
                return (
                    // FIXME
                    /* eslint-disable @typescript-eslint/no-explicit-any */
                    <DiscreteIndicatorDetails
                        list={values as any}
                        values={selectedValues as any}
                        disabled={!selected}
                        onChange={setSelectedValues as any}
                    />
                    /* eslint-enable @typescript-eslint/no-explicit-any */
                );
            case 'continuous':
                return (
                    <ContinuousIndicatorDetails
                        min={range.min}
                        max={range.max}
                        disabled={!selected}
                        onChange={setRange}
                    />
                );
            default:
                return null as never;
        }
    }, [range.max, range.min, selected, selectedValues, type, values]);

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
