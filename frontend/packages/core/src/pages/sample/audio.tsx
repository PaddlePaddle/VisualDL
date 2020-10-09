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

// cSpell:words ungrouped

import ChartPage, {WithChart} from '~/components/ChartPage';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import AudioChart from '~/components/SamplePage/AudioChart';
import Content from '~/components/Content';
import Error from '~/components/Error';
import RunAside from '~/components/RunAside';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import useTagFilter from '~/hooks/useTagFilter';
import {useTranslation} from 'react-i18next';

const chartSize = {
    height: rem(244)
};

const Audio: FunctionComponent = () => {
    const {t} = useTranslation(['sample', 'common']);

    const audioContext = useRef<AudioContext>();
    useEffect(() => {
        // safari only has webkitAudioContext
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext.current = new AudioContext();

        return () => {
            audioContext.current?.close();
        };
    }, []);

    const [running, setRunning] = useState(true);

    const {runs, tagsWithSingleRun, selectedRuns, onChangeRuns, loading} = useTagFilter('audio', running);

    const aside = useMemo(
        () =>
            runs.length ? (
                <RunAside
                    runs={runs}
                    selectedRuns={selectedRuns}
                    onChangeRuns={onChangeRuns}
                    running={running}
                    onToggleRunning={setRunning}
                ></RunAside>
            ) : null,
        [onChangeRuns, running, runs, selectedRuns]
    );

    const withChart = useCallback<WithChart<typeof tagsWithSingleRun[number]>>(
        ({run, label}) => <AudioChart audioContext={audioContext.current} run={run} tag={label} running={running} />,
        [running]
    );

    return (
        <>
            <Title>
                {t('common:sample')} - {t('common:audio')}
            </Title>
            <Content aside={aside} loading={loading}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage
                        items={tagsWithSingleRun}
                        chartSize={chartSize}
                        withChart={withChart}
                        loading={loading}
                    />
                )}
            </Content>
        </>
    );
};

export default Audio;
