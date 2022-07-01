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

import Aside from '~/components/Aside';
import type {SelectProps} from '~/components/Select';
import type {Indicator, IndicatorData, ListItem, ViewData} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState, useRef} from 'react';
import {asideWidth, rem} from '~/utils/style';
import {filter, format, formatIndicators} from '~/resource/hyper-parameter';
import queryString from 'query-string';
import BodyLoading from '~/components/BodyLoading';
import Button from '~/components/Button';
import Content from '~/components/Content';
import Empty from '~/components/ProfilerPage/Empty';
import OverView from '~/components/ProfilerPage/overview';
import OperatorView from '~/components/ProfilerPage/OperatorView';
import MemoryView from '~/components/ProfilerPage/MemoryView'
import NuclearView from '~/components/ProfilerPage/NuclearView';
import ComparedView from '~/components/ProfilerPage/ComparedView';
import Select from '~/components/Select';
import {fetcher} from '~/utils/fetch';
import Field from '~/components/Field';
import Title from '~/components/Title';
import styled from 'styled-components';
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
const TitleContent = styled.div`
    padding: ${rem(20)};
    border-bottom: 1px solid #dddddd;
`;
const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
`;
const Titles = styled.div`
    font-family: PingFangSC-Regular;
    font-size: ${rem(14)};
    color: #000000;
    letter-spacing: 0;
    line-height: ${rem(14)};
    font-weight: 400;
    margin-bottom: ${rem(20)};
`;
const ButtonsLeft = styled.div`
    border: 1px solid #dddddd;
    border-right: none;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
    border-radius: 4px 0 0 4px;
`;
const ButtonsRight = styled.div`
    border: 1px solid #dddddd;
    border-radius: 0 4px 4px 0;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
`;
const RadioButtons = styled.div`
    display: flex;
    align-items: center;
    border-radius: 4px;
`;
const Selectlist = styled.div`
    height: ${rem(36)};
    width: 100%;
    padding: 20px;
    border-radius: 4px;
`;
const AsideSection = styled.div`
    margin-bottom: ${rem(20)};
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
type SelectListItem<T> = {
    value: T;
    label: string;
};
const Profiler: FunctionComponent = () => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const asideRef = useRef<any>(null);
    const [runs, setRuns] = useState<string>('');
    const [views, setViews] = useState<string>('');
    const [workers, setWorkers] = useState<string>('');
    const [spans, setSpans] = useState<string>('');
    const [runsList, setrunsList] = useState<SelectListItem<string>[]>();
    const [viewsList, setViewsList] = useState<SelectListItem<string>[]>();
    const [workersList, setWorkersList] = useState<SelectListItem<string>[]>();
    const [spansList, setSpansList] = useState<SelectListItem<string>[]>();
    useEffect(() => {
        fetcher('/profiler/runs').then((res: unknown) => {
            const runsData = res as string[];
            const runsList = runsData.map((item, index) => {
                return {label: item, value: item};
            });
            setrunsList(runsList);
            console.log('runsData',runsData[0]);
            setRuns(runsData[0]);
        });
    }, []);
    useEffect(() => {
        if (runs) {
            console.log('runs', runs);
            fetcher('/profiler/views' + `?run=${runs}`).then((res: unknown) => {
                const viewData = res as string[];
                const viewList = viewData.map((item, index) => {
                    return {label: item, value: item};
                });
                setViewsList(viewList);
                setViews(viewData[0])
            });
        }
    }, [runs]);
    useEffect(() => {
        if (runs && views) {
            console.log('views', views);
            fetcher('/profiler/workers' + `?run=${runs}` + `&work=${views}`).then((res: unknown) => {
                const workerData = res as string[];
                const workerList = workerData.map((item, index) => {
                    return {label: item, value: item};
                });
                setWorkersList(workerList);
                setWorkers(workerData[0])
            });
        }
    }, [runs, views]);
    useEffect(() => {
        if (runs && workers) {
            console.log('workers', workers);
            fetcher('/profiler/spans' + `?run=${runs}` + `&spans=${workers}`).then((res: unknown) => {
                const spanData = res as string[];
                const spanList = spanData.map((item, index) => {
                    return {label: item, value: item};
                });
                setSpansList(spanList);
                setSpans(spanData[0])
            });
        }
    }, [runs, workers]);
    const view = useMemo(() => {
        switch (views) {
            case 'OverView':
                return <OverView runs={runs} views={views} workers={workers} spans={spans}/>;
            case 'OperatorView':
                return <OperatorView runs={runs} views={views} workers={workers} spans={spans}/>;
            case 'parallel-coordinates':
                return <NuclearView runs={runs} views={views} workers={workers} spans={spans}/>;
            case 'ComparedView':
                return <ComparedView runs={runs} views={views} workers={workers} spans={spans}/>;
            case 'scatter-plot-matrix':
                return <MemoryView runs={runs} views={views} workers={workers} spans={spans}/>;
            default:
                return null;
        }
    }, [views,runs,workers,spans]);
    // const [importanceDialogVisible, setImportanceDialogVisible] = useState(false);

    const aside = useMemo(
        () => (
            <Aside>
                <TitleContent>
                    <Titles>性能分析</Titles>
                    <RadioButtons>
                        <ButtonsLeft>正常模式</ButtonsLeft>
                        <ButtonsRight>对比模式</ButtonsRight>
                    </RadioButtons>
                </TitleContent>
                <Selectlist>
                    <AsideSection>
                        <Field label={'数据流'}>
                            <FullWidthSelect list={runsList} value={runs} onChange={setRuns} />
                        </Field>
                    </AsideSection>
                    <AsideSection>
                        <Field label={'视图'}>
                            <FullWidthSelect list={viewsList} value={views} onChange={setViews} />
                        </Field>
                    </AsideSection>
                    <AsideSection>
                        <Field label={'进程'}>
                            <FullWidthSelect list={workersList} value={workers} onChange={setWorkers} />
                        </Field>
                    </AsideSection>
                    <AsideSection>
                        <Field label={'进程跨度'}>
                            <FullWidthSelect list={spansList} value={spans} onChange={setSpans} />
                        </Field>
                    </AsideSection>
                </Selectlist>
            </Aside>
        ),
        [
            spansList,
            spans,
            workersList,
            workers,
            viewsList,
            views,
            runsList,
            runs,
        ]
    );

    return (
        <>
            <Title>{t('common:hyper-parameter')}</Title>
            <Content aside={aside}>
                {/* {loading ? <BodyLoading /> : null} */}
                <HPWrapper>
                    <ViewWrapper>{view}</ViewWrapper>
                </HPWrapper>
            </Content>
        </>
    );
};

export default Profiler;
