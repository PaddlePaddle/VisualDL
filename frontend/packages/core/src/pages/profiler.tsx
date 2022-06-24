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

import Aside, {AsideSection} from '~/components/Aside';
import type {Indicator, IndicatorData, ListItem, ViewData} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
import {asideWidth, rem} from '~/utils/style';
import {filter, format, formatIndicators} from '~/resource/hyper-parameter';

import BodyLoading from '~/components/BodyLoading';
import Button from '~/components/Button';
import Content from '~/components/Content';
import Empty from '~/components/ProfilerPage/Empty';
import IndicatorFilter from '~/components/ProfilerPage/IndicatorFilter';
import OverView from '~/components/ProfilerPage/overview';
import OperatorView from '~/components/ProfilerPage/OperatorView';
import NuclearView from '~/components/ProfilerPage/NuclearView';


import Title from '~/components/Title';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

// const ImportanceButton = styled(Button)`
//     width: 100%;
// `;

// const HParamsImportanceDialog = styled(ImportanceDialog)`
//     position: fixed;
//     right: calc(${asideWidth} + ${rem(20)});
//     bottom: ${rem(20)};
// `;
// NOTICE: remove it!!!
asideWidth;

const DownloadButtons = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    > * {
        flex-grow: 1;

        &:not(:last-child) {
            margin-right: ${rem(16)};
        }
    }
`;

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
    position: relative;
`;

const Profiler: FunctionComponent = () => {
    const {t} = useTranslation(['hyper-parameter', 'common']);

    const {data: indicatorsData, loading: loadingIndicators} = useRequest<IndicatorData>('/hparams/indicators');
    const isEmpty = useMemo(() => {
        if (indicatorsData) {
            const {hparams, metrics} = indicatorsData;
            return hparams.length === 0 || metrics.length === 0;
        }
        return true;
    }, [indicatorsData]);

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
            ['OperatorView', 'parallel-coordinates', 'scatter-plot-matrix'].map(value => ({
                value,
                label: t(`hyper-parameter:views.${value}`)
            })),
        [t]
    );
    const [tabView, setTabView] = useState(tabs[0].value);

    const viewData = useMemo<ViewData>(
        () => ({
            indicators: filteredIndicators,
            list: formattedList,
            data: filteredList
        }),
        [filteredIndicators, filteredList, formattedList]
    );
    const view = useMemo(() => {
        switch (tabView) {
            case 'OverView':
                return <OverView/>;
            case 'OperatorView':
                return <OperatorView/>;
            case 'NuclearView':
                return <NuclearView/>;
            default:
                return null;
        }
    }, [tabView, viewData]);

    // const [importanceDialogVisible, setImportanceDialogVisible] = useState(false);

    const aside = useMemo(
        () => (
            <Aside>
                <IndicatorFilter indicators={indicators} onChange={setFilteredIndicators} />
            </Aside>
        ),
        [indicators, t]
    );

    return (
        <>
            <Title>{t('common:hyper-parameter')}</Title>
            <Content aside={aside}>
                {loading ? <BodyLoading /> : null}
                <HPWrapper>
                    <ViewWrapper>
                        {isEmpty ? <Empty /> : view}
                    </ViewWrapper>
                </HPWrapper>
            </Content>
        </>
    );
};

export default Profiler;
