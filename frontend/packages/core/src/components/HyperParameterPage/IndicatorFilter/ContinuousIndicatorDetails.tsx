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

import NumberInput from './NumberInput';
import type {Range} from '~/resource/hyper-parameter';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Input = styled(NumberInput)`
    width: 100%;
`;

const Row = styled.div`
    display: flex;
    align-items: center;

    > * {
        flex-grow: 1;
    }

    > .label {
        flex-grow: 0;
        flex-shrink: 0;
        margin-right: 1em;
    }
`;

interface ContinuousIndicatorDetailsProps {
    min?: number;
    max?: number;
    onChange?: (range: Range) => unknown;
}

const DiscreteIndicatorDetails: FunctionComponent<ContinuousIndicatorDetailsProps> = ({min, max, onChange}) => {
    const {t} = useTranslation('hyper-parameter');

    const [range, setRange] = useState<Range>({
        min: min ?? Number.NEGATIVE_INFINITY,
        max: max ?? Number.POSITIVE_INFINITY
    });

    const changeMin = useCallback((v: number) => {
        setRange(r => ({
            ...r,
            min: v
        }));
    }, []);
    const changeMax = useCallback((v: number) => {
        setRange(r => ({
            ...r,
            max: v
        }));
    }, []);
    const change = useRef(onChange);
    useEffect(() => {
        change.current = onChange;
    }, [onChange]);
    useEffect(() => {
        if (range.min === min && range.max === max) {
            return;
        }
        change.current?.(range);
    }, [max, min, range]);

    return (
        <>
            <Row>
                <span className="label">{t('hyper-parameter:min')}</span>
                <Input
                    value={range.min}
                    defaultValue={Number.NEGATIVE_INFINITY}
                    placeholder={t('hyper-parameter:negative-infinity')}
                    onChange={changeMin}
                />
            </Row>
            <Row>
                <span className="label">{t('hyper-parameter:max')}</span>
                <Input
                    value={range.max}
                    defaultValue={Number.POSITIVE_INFINITY}
                    placeholder={t('hyper-parameter:positive-infinity')}
                    onChange={changeMax}
                />
            </Row>
        </>
    );
};

export default DiscreteIndicatorDetails;
