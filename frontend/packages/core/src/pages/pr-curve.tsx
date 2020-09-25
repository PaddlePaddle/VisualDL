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

import ChartPage, {WithChart} from '~/components/ChartPage';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import type {Run, StepInfo, Tag} from '~/resource/pr-curve';
import {rem, transitionProps} from '~/utils/style';

import {AsideSection} from '~/components/Aside';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import PRCurveChart from '~/components/PRCurvePage/PRCurveChart';
import RunAside from '~/components/RunAside';
import StepSlider from '~/components/PRCurvePage/StepSlider';
import TimeModeSelect from '~/components/TimeModeSelect';
import {TimeType} from '~/resource/pr-curve';
import Title from '~/components/Title';
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

const PRCurve: FunctionComponent = () => {
    const {t} = useTranslation(['pr-curve', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tags, runsInTags, selectedRuns, onChangeRuns, loading} = useTagFilter('pr-curve', running);

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

    const {data: stepInfo} = useRunningRequest<StepInfo[]>(
        runsInTags.map(run => `/pr-curve/steps?${queryString.stringify({run: run.label})}`),
        !!running,
        (...urls) => cycleFetcher(urls)
    );
    const runWithInfo = useMemo<Run[]>(
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

    const prCurveTags = useMemo<Tag[]>(
        () =>
            tags.map(tag => ({
                ...tag,
                runs: tag.runs.map(run => ({
                    ...run,
                    index: 0,
                    steps: [] as Run['steps'],
                    wallTimes: [] as Run['wallTimes'],
                    relatives: [] as Run['relatives'],
                    ...runWithInfo.find(r => r.label === run.label)
                }))
            })),
        [tags, runWithInfo]
    );

    const aside = useMemo(
        () =>
            runs.length ? (
                <RunAside
                    runs={runs}
                    selectedRuns={selectedRuns}
                    onChangeRuns={onChangeRuns}
                    running={running}
                    onToggleRunning={setRunning}
                >
                    <AsideSection>
                        <Field label={t('pr-curve:time-display-type')}>
                            <TimeModeSelect value={timeType} onChange={setTimeType} />
                        </Field>
                    </AsideSection>
                    <StepSliderWrapper>
                        {runWithInfo.map(run => (
                            <AsideSection key={run.label}>
                                <StepSlider
                                    run={run}
                                    type={timeType}
                                    onChange={index => onChangeIndexes(run.label, index)}
                                />
                            </AsideSection>
                        ))}
                    </StepSliderWrapper>
                </RunAside>
            ) : null,
        [t, onChangeRuns, running, runs, selectedRuns, timeType, runWithInfo, onChangeIndexes]
    );

    const withChart = useCallback<WithChart<Tag>>(
        ({label, runs, ...args}) => <PRCurveChart runs={runs} tag={label} {...args} running={running} />,
        [running]
    );

    return (
        <>
            <Title>{t('common:pr-curve')}</Title>
            <Content aside={aside} loading={loading}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage items={prCurveTags} withChart={withChart} loading={loading} />
                )}
            </Content>
        </>
    );
};

export default PRCurve;
