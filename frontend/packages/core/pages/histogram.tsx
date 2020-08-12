import ChartPage, {WithChart} from '~/components/ChartPage';
import {Modes, modes} from '~/resource/histogram';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useMemo, useState} from 'react';

import {AsideSection} from '~/components/Aside';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import HistogramChart from '~/components/HistogramPage/HistogramChart';
import Preloader from '~/components/Preloader';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import RunAside from '~/components/RunAside';
import {TagWithSingleRun} from '~/types';
import Title from '~/components/Title';
import useTagFilter from '~/hooks/useTagFilter';

const Histogram: NextI18NextPage = () => {
    const {t} = useTranslation(['histogram', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tagsWithSingleRun, selectedRuns, onChangeRuns, loading} = useTagFilter('histogram', running);

    const [mode, setMode] = useState<Modes>(Modes.Offset);

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
                        <Field label={t('histogram:mode')}>
                            <RadioGroup value={mode} onChange={setMode}>
                                {modes.map(value => (
                                    <RadioButton key={value} value={value}>
                                        {t(`histogram:mode-value.${value}`)}
                                    </RadioButton>
                                ))}
                            </RadioGroup>
                        </Field>
                    </AsideSection>
                </RunAside>
            ) : null,
        [t, mode, onChangeRuns, running, runs, selectedRuns]
    );

    const withChart = useCallback<WithChart<TagWithSingleRun>>(
        ({label, run, ...args}) => <HistogramChart run={run} tag={label} {...args} mode={mode} running={running} />,
        [running, mode]
    );

    return (
        <>
            <Preloader url="/histogram/tags" />
            <Title>{t('common:histogram')}</Title>
            <Content aside={aside} loading={loading}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage items={tagsWithSingleRun} withChart={withChart} loading={loading} />
                )}
            </Content>
        </>
    );
};

Histogram.getInitialProps = () => ({
    namespacesRequired: ['histogram', 'common']
});

export default Histogram;
