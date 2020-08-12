// cSpell:words ungrouped

import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useMemo, useState} from 'react';

import {AsideSection} from '~/components/Aside';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import ImageChart from '~/components/SamplePage/ImageChart';
import Preloader from '~/components/Preloader';
import RunAside from '~/components/RunAside';
import Slider from '~/components/Slider';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import useTagFilter from '~/hooks/useTagFilter';

const chartSize = {
    height: rem(406)
};

const Image: NextI18NextPage = () => {
    const {t} = useTranslation(['sample', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tagsWithSingleRun, selectedRuns, onChangeRuns, loading} = useTagFilter('image', running);

    const [showActualSize, setShowActualSize] = useState(false);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);

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
                        <Checkbox value={showActualSize} onChange={setShowActualSize}>
                            {t('sample:show-actual-size')}
                        </Checkbox>
                    </AsideSection>
                    <AsideSection>
                        <Field label={t('sample:brightness')}>
                            <Slider min={0} max={2} step={0.01} value={brightness} onChange={setBrightness} />
                        </Field>
                    </AsideSection>
                    <AsideSection>
                        <Field label={t('sample:contrast')}>
                            <Slider min={0} max={2} step={0.01} value={contrast} onChange={setContrast} />
                        </Field>
                    </AsideSection>
                </RunAside>
            ) : null,
        [t, brightness, contrast, onChangeRuns, running, runs, selectedRuns, showActualSize]
    );

    const withChart = useCallback<WithChart<typeof tagsWithSingleRun[number]>>(
        ({run, label}) => (
            <ImageChart
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
            <Preloader url="/image/tags" />
            <Title>
                {t('common:sample')} - {t('common:image')}
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

Image.getInitialProps = () => ({
    namespacesRequired: ['sample', 'common']
});

export default Image;
