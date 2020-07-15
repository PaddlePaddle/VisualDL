// cSpell:words ungrouped

import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useMemo, useState} from 'react';
import useTagFilter, {ungroup} from '~/hooks/useTagFilter';

import AudioChart from '~/components/SamplePage/AudioChart';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Preloader from '~/components/Preloader';
import RunAside from '~/components/RunAside';
import Title from '~/components/Title';
import {rem} from '~/utils/style';

const chartSize = {
    height: rem(244)
};

const Audio: NextI18NextPage = () => {
    const {t} = useTranslation(['sample', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tags, selectedRuns, onChangeRuns, loadingRuns, loadingTags} = useTagFilter('audio', running);

    const ungroupedSelectedTags = useMemo(() => ungroup(tags), [tags]);

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

    const withChart = useCallback<WithChart<typeof ungroupedSelectedTags[number]>>(
        ({run, label}) => <AudioChart run={run} tag={label} running={running} />,
        [running]
    );

    return (
        <>
            <Preloader url="/runs" />
            <Preloader url="/audio/tags" />
            <Title>
                {t('common:sample')} - {t('common:audio')}
            </Title>
            <Content aside={aside} loading={loadingRuns}>
                {!loadingRuns && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage
                        items={ungroupedSelectedTags}
                        chartSize={chartSize}
                        withChart={withChart}
                        loading={loadingRuns || loadingTags}
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
