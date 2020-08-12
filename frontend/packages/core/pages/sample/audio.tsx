// cSpell:words ungrouped

import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import AudioChart from '~/components/SamplePage/AudioChart';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Preloader from '~/components/Preloader';
import RunAside from '~/components/RunAside';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import useTagFilter from '~/hooks/useTagFilter';

const chartSize = {
    height: rem(244)
};

const Audio: NextI18NextPage = () => {
    const {t} = useTranslation(['sample', 'common']);

    const audioContext = useRef<AudioContext>();
    useEffect(() => {
        if (process.browser) {
            // safari only has webkitAudioContext
            const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
            audioContext.current = new AudioContext();

            return () => {
                audioContext.current?.close();
            };
        }
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
            <Preloader url="/audio/tags" />
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

Audio.getInitialProps = () => ({
    namespacesRequired: ['sample', 'common']
});

export default Audio;
