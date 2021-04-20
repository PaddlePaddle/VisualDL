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

import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';

import {AsideSection} from '~/components/Aside';
import Field from '~/components/Field';
import type {Indicator} from '~/resource/hyper-parameter';
import IndicatorItem from './Indicator';
import Tab from '~/components/Tab';
import type {TabProps} from '~/components/Tab';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const DataTypeTab = styled<React.FunctionComponent<TabProps<string>>>(Tab)`
    font-weight: 700;
`;

interface IndicatorFilterProps {
    hparams: Indicator[];
    metrics: Indicator[];
}

const IndicatorFilter: FunctionComponent<IndicatorFilterProps> = ({hparams, metrics}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);

    const dataTypeList = useMemo(
        () => ['hparams', 'metrics'].map(value => ({value, label: t(`hyper-parameter:data-type-value.${value}`)})),
        [t]
    );
    const [dataType, setDataType] = useState('hparams');

    const indicator = useCallback(
        // eslint-disable-next-line react/display-name
        (key: string) => (i: Indicator, index: number) => {
            const props = {
                ...i,
                values: i.type === 'continuous' ? undefined : i.values,
                key: key + index
            };
            return <IndicatorItem {...props} />;
        },
        []
    );
    const indicators = useMemo(() => {
        switch (dataType) {
            case 'hparams':
                return hparams.map(indicator('hparams'));
            case 'metrics':
                return metrics.map(indicator('metrics'));
            default:
                return [];
        }
    }, [dataType, hparams, indicator, metrics]);

    return (
        <div>
            <AsideSection>
                <Field>
                    <DataTypeTab list={dataTypeList} value={dataType} onChange={setDataType} appearance="underscore" />
                </Field>
                {indicators.map((indicator, index) => (
                    <AsideSection key={index}>
                        <Field>{indicator}</Field>
                    </AsideSection>
                ))}
            </AsideSection>
        </div>
    );
};

export default IndicatorFilter;
