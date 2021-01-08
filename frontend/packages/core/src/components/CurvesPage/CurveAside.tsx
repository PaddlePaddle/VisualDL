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

import type {Run as CurveRun, Tag as CurveTag, CurveType, StepInfo} from '~/resource/curves';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import {rem, transitionProps} from '~/utils/style';

import {AsideSection} from '~/components/Aside';
import Field from '~/components/Field';
import RunAside from '~/components/RunAside';
import StepSlider from '~/components/CurvesPage/StepSlider';
import StepSliderLoader from '~/components/Loader/curves/StepSlider';
import TimeModeSelect from '~/components/TimeModeSelect';
import {TimeType} from '~/resource/curves';
import {cycleFetcher} from '~/utils/fetch';
import queryString from 'query-string';
import styled from 'styled-components';
import {useRunningRequest} from '~/hooks/useRequest';
import useTagFilter from '~/hooks/useTagFilter';
import {useTranslation} from 'react-i18next';

const StepSliderWrapper = styled.div`
    max-height: 30vh;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
    flex-shrink: 0;

    > ${AsideSection}:last-child {
        padding-bottom: ${rem(20)};
        margin-bottom: 0;
    }

    + .run-section {
        border-top: 1px solid var(--border-color);
        margin-top: 0;
        padding-top: ${rem(20)};
        ${transitionProps('border-color')}
    }

    &:empty + .run-section {
        border-top: none;
    }
`;

type CurveAsideProps = {
    type: CurveType;
    onChangeLoading: (loading: boolean) => unknown;
    onChangeSteps: (tags: CurveTag[]) => unknown;
    onToggleRunning: (running: boolean) => unknown;
};

const CurveAside: FunctionComponent<CurveAsideProps> = ({type, onChangeLoading, onChangeSteps, onToggleRunning}) => {
    const {t} = useTranslation('curves');

    const [running, setRunning] = useState(true);

    // TODO: remove `as` after ts 4.1
    const {runs, tags, runsInTags, selectedRuns, onChangeRuns, loading} = useTagFilter(
        `${type}-curve` as 'pr-curve' | 'roc-curve',
        running
    );

    const {data: stepInfo} = useRunningRequest<StepInfo[]>(
        runsInTags.map(run => `/${type}-curve/steps?${queryString.stringify({run: run.label})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );

    const [indexes, setIndexes] = useState<Record<string, number>>({});
    const onChangeIndexes = useCallback(
        (run: string, index: number) =>
            setIndexes(indexes => ({
                ...indexes,
                [run]: index
            })),
        []
    );
    useEffect(
        () =>
            setIndexes(indexes =>
                runsInTags.reduce<typeof indexes>((m, c) => {
                    if (indexes[c.label] != null) {
                        m[c.label] = indexes[c.label];
                    }
                    return m;
                }, {})
            ),
        [runsInTags]
    );

    const curveRun = useMemo<CurveRun[]>(
        () =>
            runsInTags.map((run, i) => ({
                ...run,
                index: indexes[run.label] ?? (stepInfo?.[i].length ?? 1) - 1,
                steps: stepInfo?.[i].map(j => j[1]) ?? [],
                wallTimes: stepInfo?.[i].map(j => Math.floor(j[0])) ?? [],
                relatives: stepInfo?.[i].map(j => j[0] - stepInfo[i][0][0]) ?? []
            })),
        [runsInTags, stepInfo, indexes]
    );

    const [timeType, setTimeType] = useState<TimeType>(TimeType.Step);

    useEffect(() => {
        onChangeSteps(
            tags.map<CurveTag>(tag => ({
                ...tag,
                runs: tag.runs.map(run => ({
                    ...run,
                    index: 0,
                    steps: [],
                    wallTimes: [],
                    relatives: [],
                    ...curveRun.find(r => r.label === run.label)
                }))
            }))
        );
    }, [tags, curveRun, onChangeSteps]);

    useEffect(() => {
        onChangeLoading(loading);
    }, [loading, onChangeLoading]);

    useEffect(() => {
        onToggleRunning(running);
    }, [onToggleRunning, running]);

    return (
        <RunAside
            runs={runs}
            selectedRuns={selectedRuns}
            onChangeRuns={onChangeRuns}
            running={running}
            onToggleRunning={setRunning}
            loading={loading}
        >
            <AsideSection>
                <Field label={t('curves:time-display-type')}>
                    <TimeModeSelect value={timeType} onChange={setTimeType} />
                </Field>
            </AsideSection>
            <StepSliderWrapper>
                {loading ? (
                    <AsideSection>
                        <StepSliderLoader />
                    </AsideSection>
                ) : (
                    curveRun.map(run => (
                        <AsideSection key={run.label}>
                            <StepSlider
                                run={run}
                                type={timeType}
                                onChange={index => onChangeIndexes(run.label, index)}
                            />
                        </AsideSection>
                    ))
                )}
            </StepSliderWrapper>
        </RunAside>
    );
};

export default CurveAside;
