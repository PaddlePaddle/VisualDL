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

import type {Indicator, IndicatorGroup, Range} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';

import {AsideSection} from '~/components/Aside';
import Field from '~/components/Field';
import IndicatorItem from './Indicator';
import Tab from '~/components/Tab';
import type {TabProps} from '~/components/Tab';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const DataTypeTab = styled<React.FunctionComponent<TabProps<IndicatorGroup>>>(Tab)`
    font-weight: 700;
`;

export interface IndicatorFilterProps {
    indicators: Indicator[];
    onChange?: (indicators: Indicator[]) => unknown;
}

const IndicatorFilter: FunctionComponent<IndicatorFilterProps> = ({indicators, onChange}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);

    const dataTypeList = useMemo(
        () =>
            (['hparams', 'metrics'] as IndicatorGroup[]).map(value => ({
                value,
                label: t(`hyper-parameter:data-type-value.${value}`)
            })),
        [t]
    );
    const [dataType, setDataType] = useState<IndicatorGroup>('hparams');

    const indicatorsInGroup = useMemo(() => indicators.filter(indicator => indicator.group === dataType), [
        dataType,
        indicators
    ]);

    const [result, setResult] = useState(indicators);
    useEffect(() => setResult(indicators), [indicators]);
    const updateResult = useCallback((indicator: Indicator, data: Partial<Indicator>) => {
        setResult(old => {
            const index = old.findIndex(i => i.name === indicator.name && i.group === indicator.group);
            const n = [...old];
            if (index >= 0) {
                Object.assign(n[index], data);
            }
            return n;
        });
    }, []);

    const toggle = useCallback(
        (indicator: Indicator, visible: boolean) => updateResult(indicator, {selected: visible}),
        [updateResult]
    );
    const change = useCallback(
        (indicator: Indicator, data: Range | string[] | number[]) => {
            switch (indicator.type) {
                case 'numeric':
                case 'string':
                    return updateResult(indicator, {selectedValues: data as string[] | number[]});
                case 'continuous':
                    return updateResult(indicator, data as Range);
            }
        },
        [updateResult]
    );

    useEffect(() => {
        onChange?.(result);
    }, [result, onChange]);

    return (
        <div>
            <AsideSection>
                <Field>
                    <DataTypeTab list={dataTypeList} value={dataType} onChange={setDataType} appearance="underscore" />
                </Field>
                {indicatorsInGroup.map(indicator => (
                    <AsideSection key={indicator.group + indicator.name}>
                        <Field>
                            <IndicatorItem
                                name={indicator.name}
                                type={indicator.type}
                                selected={indicator.selected}
                                values={indicator.type === 'continuous' ? undefined : indicator.values}
                                selectedValues={indicator.type === 'continuous' ? undefined : indicator.selectedValues}
                                min={indicator.type === 'continuous' ? indicator.min : undefined}
                                max={indicator.type === 'continuous' ? indicator.max : undefined}
                                onToggle={visible => toggle(indicator, visible)}
                                onChange={(data: Range | string[] | number[]) => change(indicator, data)}
                            />
                        </Field>
                    </AsideSection>
                ))}
            </AsideSection>
        </div>
    );
};

export default IndicatorFilter;
