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
import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {asideWidth, rem} from '~/utils/style';
import Content from '~/components/Content';
import OverView from '~/components/ProfilerPage/overview/overview';
import OperatorView from '~/components/ProfilerPage/OperatorView/OperatorView';
// import DiffView from '~/components/ProfilerPage/DiffView';
import MemoryView from '~/components/ProfilerPage/MemoryView/MemoryView';
import TracingView from '~/components/ProfilerPage/TracingView';
import Distributed from '~/components/ProfilerPage/Distributed/Distributed';
import ComparedView from '~/components/ProfilerPage/ComparedView/ComparedView';
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
    // margin-bottom: ${rem(20)};
`;
const Selectlist = styled.div`
    width: 100%;
    border-radius: 4px;
    padding: ${rem(20)};
`;
const AsideSection = styled.div`
    margin-bottom: ${rem(20)};
`;
const CompareContent = styled.div`
    padding: ${rem(0)} ${rem(20)};
    padding-bottom: 0px;
    .Groups {
        .Selectlist {
            width: 100%;
            border-radius: ${rem(4)};
            padding-bottom: ${rem(20)};
        }
    }
`;
const Grouptitle = styled.div`
    border-top: 1px solid #dddddd;
    padding-top: ${rem(20)};
    margin-bottom: ${rem(20)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(14)};
    color: #999999;
    -webkit-letter-spacing: 0;
    -moz-letter-spacing: 0;
    -ms-letter-spacing: 0;
    letter-spacing: 0;
    line-height: ${rem(14)};
    font-weight: 400;
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
    const {t, i18n} = useTranslation(['profiler', 'common']);
    const [isCompared, setIsCompared] = useState(false);
    const [runs, setRuns] = useState<string>('');
    const [diffRuns1, setDiffRuns1] = useState<string>('');
    const [diffRuns2, setDiffRuns2] = useState<string>('');
    const [views, setViews] = useState<string>('');
    const [workers, setWorkers] = useState<string>('');
    const [diffWorker1, setDiffWorker1] = useState<string>('');
    const [diffWorker2, setDiffWorker2] = useState<string>('');
    const [spans, setSpans] = useState<string>('');
    const [units, setUnits] = useState<string>('us');
    const [diffSpan1, setDiffSpan1] = useState<string>('');
    const [diffSpan2, setDiffSpan2] = useState<string>('');
    const [runsList, setrunsList] = useState<SelectListItem<string>[]>();
    const [viewsList, setViewsList] = useState<SelectListItem<string>[]>();
    const [workersList, setWorkersList] = useState<SelectListItem<string>[]>();
    const [spansList, setSpansList] = useState<SelectListItem<string>[]>();
    const [unitsList, setUnitsList] = useState<SelectListItem<string>[]>();
    const [descriptions, setDescriptions] = useState<any>();
    useEffect(() => {
        if (i18n.language) {
            // 训练步数耗时
            fetcher('/profiler/descriptions' + `?lang=${i18n.language}`).then((res: unknown) => {
                const Data = res;
                setDescriptions(Data);
            });
        }
    }, [i18n.language]);
    useEffect(() => {
        fetcher('/profiler/runs').then((res: unknown) => {
            const runsData = res as string[];
            const runsList = runsData.map(item => {
                return {label: item, value: item};
            });
            setrunsList(runsList);
            setRuns(runsData[0]);
        });
        fetcher('/profiler/timeunits').then((res: unknown) => {
            const runsData = res as string[];
            const runsList = runsData.map(item => {
                return {label: item, value: item};
            });
            setUnitsList(runsList);
        });
    }, []);
    useEffect(() => {
        fetcher('/profiler/timeunits').then((res: unknown) => {
            const runsData = res as string[];
            const runsList = runsData.map(item => {
                return {label: item, value: item};
            });
            setUnitsList(runsList);
        });
    }, []);
    useEffect(() => {
        if (runs) {
            fetcher('/profiler/views' + `?run=${runs}`).then((res: unknown) => {
                const viewData = res as string[];
                const viewList = viewData.map(item => {
                    return {label: item, value: item};
                });
                setViewsList(viewList);
                setViews(viewData[0]);
            });
        }
    }, [runs]);
    useEffect(() => {
        if (runs && views) {
            fetcher('/profiler/workers' + `?run=${runs}` + `&view=${views}`).then((res: unknown) => {
                const workerData = res as string[];
                const workerList = workerData.map(item => {
                    return {label: item, value: item};
                });
                setWorkersList(workerList);
                setWorkers(workerData[0]);
            });
        }
    }, [runs, views]);
    useEffect(() => {
        if (runs && workers) {
            fetcher('/profiler/spans' + `?run=${runs}` + `&worker=${workers}`).then((res: unknown) => {
                const spanData = res as string[];
                const spanList = spanData.map(item => {
                    return {label: item, value: item};
                });
                setSpansList(spanList);
                setSpans(spanData[0]);
            });
        }
    }, [runs, workers]);
    // const diffView = useMemo(() => {
    //     if (diffWorker2 && diffSpan1 && diffRuns1 && diffWorker1 && diffSpan2 && diffRuns1) {
    //         return (
    //             <DiffView
    //                 diffRuns1={diffRuns1}
    //                 diffWorkers1={diffWorker1}
    //                 diffSpans1={diffSpan1}
    //                 diffRuns2={diffRuns2}
    //                 diffWorkers2={diffWorker2}
    //                 diffSpans2={diffSpan2}
    //             />
    //         );
    //     } else {
    //         return <Empty></Empty>;
    //     }
    // }, [diffWorker2, diffSpan1, diffRuns2, diffWorker1, diffSpan2, diffRuns1]);
    // const [importanceDialogVisible, setImportanceDialogVisible] = useState(false);

    const aside = useMemo(
        () => (
            <Aside>
                <TitleContent>
                    <Titles>{t('performance-analysis')}</Titles>
                </TitleContent>
                {!isCompared ? (
                    <Selectlist>
                        <AsideSection>
                            <Field label={t('data-flow')}>
                                <FullWidthSelect list={runsList} value={runs} onChange={setRuns} />
                            </Field>
                        </AsideSection>
                        <AsideSection>
                            <Field label={t('view')}>
                                <FullWidthSelect list={viewsList} value={views} onChange={setViews} />
                            </Field>
                        </AsideSection>
                        <AsideSection>
                            <Field label={t('process')}>
                                <FullWidthSelect list={workersList} value={workers} onChange={setWorkers} />
                            </Field>
                        </AsideSection>
                        <AsideSection>
                            <Field label={t('process-span')}>
                                <FullWidthSelect list={spansList} value={spans} onChange={setSpans} />
                            </Field>
                        </AsideSection>
                        {views !== 'Trace' ? (
                            <AsideSection>
                                <Field label={t('time-unit')}>
                                    <FullWidthSelect list={unitsList} value={units} onChange={setUnits} />
                                </Field>
                            </AsideSection>
                        ) : null}
                    </Selectlist>
                ) : (
                    <CompareContent>
                        <div className="Groups">
                            <Grouptitle style={{border: 'none'}}>基线组</Grouptitle>
                            <div className="Selectlist">
                                <AsideSection>
                                    <Field label={'数据流'}>
                                        <FullWidthSelect list={runsList} value={diffRuns1} onChange={setDiffRuns1} />
                                    </Field>
                                </AsideSection>
                                <AsideSection>
                                    <Field label={'进程'}>
                                        <FullWidthSelect
                                            list={workersList}
                                            value={diffWorker1}
                                            onChange={setDiffWorker1}
                                        />
                                    </Field>
                                </AsideSection>
                                <AsideSection>
                                    <Field label={'进程跨度'}>
                                        <FullWidthSelect list={spansList} value={diffSpan1} onChange={setDiffSpan1} />
                                    </Field>
                                </AsideSection>
                            </div>
                        </div>
                        <div className="Groups">
                            <Grouptitle>基线组</Grouptitle>
                            <div className="Selectlist">
                                <AsideSection>
                                    <Field label={'数据流'}>
                                        <FullWidthSelect list={runsList} value={diffRuns2} onChange={setDiffRuns2} />
                                    </Field>
                                </AsideSection>
                                <AsideSection>
                                    <Field label={'进程'}>
                                        <FullWidthSelect
                                            list={workersList}
                                            value={diffWorker2}
                                            onChange={setDiffWorker2}
                                        />
                                    </Field>
                                </AsideSection>
                                <AsideSection>
                                    <Field label={'进程跨度'}>
                                        <FullWidthSelect list={spansList} value={diffSpan2} onChange={setDiffSpan2} />
                                    </Field>
                                </AsideSection>
                            </div>
                        </div>
                    </CompareContent>
                )}
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
            isCompared,
            diffWorker2,
            diffRuns2,
            diffWorker1,
            diffRuns1,
            diffSpan1,
            diffSpan2,
            units,
            unitsList,
            t
        ]
    );

    return (
        <>
            <Title>{t('common:hyper-parameter')}</Title>
            <Content aside={aside} isProfiler={true}>
                <HPWrapper>
                    <ViewWrapper>
                        {views === 'Overview' ? (
                            <OverView
                                runs={runs}
                                views={views}
                                workers={workers}
                                units={units}
                                spans={spans}
                                descriptions={descriptions}
                            />
                        ) : null}
                        {views === 'Operator' ? (
                            <OperatorView runs={runs} views={views} workers={workers} units={units} spans={spans} />
                        ) : null}
                        {views === 'Distributed' ? (
                            <Distributed
                                runs={runs}
                                views={views}
                                workers={workers}
                                units={units}
                                spans={spans}
                                descriptions={descriptions}
                            />
                        ) : null}
                        {views === 'GPU Kernel' ? (
                            <ComparedView runs={runs} views={views} workers={workers} units={units} spans={spans} />
                        ) : null}
                        {views === 'Memory' ? (
                            <MemoryView runs={runs} views={views} workers={workers} units={units} spans={spans} />
                        ) : null}
                        {views === 'Trace' ? (
                            <TracingView runs={runs} views={views} workers={workers} spans={spans} />
                        ) : null}
                    </ViewWrapper>
                </HPWrapper>
            </Content>
        </>
    );
};

export default Profiler;
