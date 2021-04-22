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

import type {Indicator, IndicatorData, ListItem} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useMemo, useState} from 'react';
import {borderRadius, rem} from '~/utils/style';
import {filter, format, formatIndicators} from '~/resource/hyper-parameter';

import Aside from '~/components/Aside';
import BodyLoading from '~/components/BodyLoading';
import Content from '~/components/Content';
import IndicatorFilter from '~/components/HyperParameterPage/IndicatorFilter/IndicatorFilter';
import Tab from '~/components/Tab';
import TableView from '~/components/HyperParameterPage/TableView';
import Title from '~/components/Title';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

const HPWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
`;
const ViewWrapper = styled.div`
    width: 100%;
    flex-grow: 1;
    background-color: var(--background-color);
    border-radius: ${borderRadius};
    border-top-left-radius: 0;
    padding: ${rem(20)};
`;

const HyperParameter: FunctionComponent = () => {
    const {t} = useTranslation(['hyper-parameter', 'common']);

    const {data: indicatorsData, loading: loadingIndicators} = useRequest<IndicatorData>('/hparams/indicators');
    const indicators = useMemo(
        () => [
            ...formatIndicators(indicatorsData?.hparams ?? [], 'hparams'),
            ...formatIndicators(indicatorsData?.metrics ?? [], 'metrics')
        ],
        [indicatorsData]
    );

    const {data: list, loading: loadingList} = useRequest<ListItem[]>('/hparams/list');

    const [filteredIndicators, setFilteredIndicators] = useState<Indicator[]>(indicators);

    const filteredList = useMemo(() => filter(list ?? [], filteredIndicators), [filteredIndicators, list]);

    const formattedList = useMemo(() => format(filteredList, indicators), [filteredList, indicators]);

    const loading = useMemo(() => loadingIndicators || loadingList, [loadingIndicators, loadingList]);

    const tabs = useMemo(
        () =>
            ['table', 'parallel-coordinates', 'scatter-plot-matrix'].map(value => ({
                value,
                label: t(`hyper-parameter:views.${value}`)
            })),
        [t]
    );
    const [tabView, setTabView] = useState(tabs[0].value);
    const view = useMemo(() => {
        switch (tabView) {
            case 'table':
                return <TableView indicators={filteredIndicators} list={formattedList} />;
            default:
                return null;
        }
    }, [filteredIndicators, formattedList, tabView]);

    const aside = useMemo(
        () => (
            <Aside>
                <IndicatorFilter indicators={indicators} onChange={setFilteredIndicators} />
            </Aside>
        ),
        [indicators]
    );

    return (
        <>
            <Title>{t('common:hyper-parameter')}</Title>
            <Content aside={aside}>
                {loading ? <BodyLoading /> : null}
                <HPWrapper>
                    <Tab list={tabs} value={tabView} onChange={setTabView} />
                    <ViewWrapper>{view}</ViewWrapper>
                </HPWrapper>
            </Content>
        </>
    );
};

export default HyperParameter;
