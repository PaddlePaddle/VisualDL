// cSpell:words ungrouped

import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useMemo, useState} from 'react';

import {AsideSection} from '~/components/Aside';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Field from '~/components/Field';
import Preloader from '~/components/Preloader';
import RunAside from '~/components/RunAside';
import SampleChart from '~/components/SamplesPage/SampleChart';
import Slider from '~/components/Slider';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import useTagFilter from '~/hooks/useTagFilter';

const chartSize = {
    height: rem(406)
};

type Item = {
    run: string;
    label: string;
};

const Samples: NextI18NextPage = () => {
    const {t} = useTranslation(['samples', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tags, selectedRuns, onChangeRuns, loadingRuns, loadingTags} = useTagFilter('images', running);

    const ungroupedSelectedTags = useMemo(
        () =>
            tags.reduce<Item[]>((prev, {runs, ...item}) => {
                Array.prototype.push.apply(
                    prev,
                    runs.map(run => ({...item, run: run.label, id: `${item.label}-${run.label}`}))
                );
                return prev;
            }, []),
        [tags]
    );

    const [showActualSize, setShowActualSize] = useState(false);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);

    const aside = useMemo(
        () => (
            <RunAside
                runs={runs}
                selectedRuns={selectedRuns}
                onChangeRuns={onChangeRuns}
                running={running}
                onToggleRunning={setRunning}
            >
                <AsideSection>
                    <Checkbox value={showActualSize} onChange={setShowActualSize}>
                        {t('samples:show-actual-size')}
                    </Checkbox>
                </AsideSection>
                <AsideSection>
                    <Field label={t('samples:brightness')}>
                        <Slider min={0} max={2} step={0.01} value={brightness} onChange={setBrightness} />
                    </Field>
                </AsideSection>
                <AsideSection>
                    <Field label={t('samples:contrast')}>
                        <Slider min={0} max={2} step={0.01} value={contrast} onChange={setContrast} />
                    </Field>
                </AsideSection>
            </RunAside>
        ),
        [t, brightness, contrast, onChangeRuns, running, runs, selectedRuns, showActualSize]
    );

    const withChart = useCallback<WithChart<Item>>(
        ({run, label}) => (
            <SampleChart
                run={run}
                tag={label}
                fit={!showActualSize}
                running={running}
                brightness={brightness}
                contrast={contrast}
            />
        ),
        [showActualSize, running, brightness, contrast]
    );

    return (
        <>
            <Preloader url="/runs" />
            <Preloader url="/images/tags" />
            <Title>{t('common:samples')}</Title>
            <Content aside={aside} loading={loadingRuns}>
                <ChartPage
                    items={ungroupedSelectedTags}
                    chartSize={chartSize}
                    withChart={withChart}
                    loading={loadingRuns || loadingTags}
                />
            </Content>
        </>
    );
};

Samples.getInitialProps = () => ({
    namespacesRequired: ['samples', 'common']
});

export default Samples;
