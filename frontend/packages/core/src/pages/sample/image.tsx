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

import ChartPage, {RenderChart} from '~/components/ChartPage';
import ImageChart, {Loader as ChartLoader} from '~/components/SamplePage/Image';
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';

import {AsideSection} from '~/components/Aside';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import RunAside from '~/components/RunAside';
import Slider from '~/components/Slider';
import Title from '~/components/Title';
import useTagFilter from '~/hooks/useTagFilter';
import {useTranslation} from 'react-i18next';

const ImageSample: FunctionComponent = () => {
    const {t} = useTranslation(['sample', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tagsWithSingleRun, selectedRuns, onChangeRuns, loading} = useTagFilter('image', running);

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
                loading={loading}
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
        ),
        [brightness, contrast, loading, onChangeRuns, running, runs, selectedRuns, showActualSize, t]
    );

    const renderChart = useCallback<RenderChart<typeof tagsWithSingleRun[number]>>(
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
            <Title>
                {t('common:image')} - {t('common:sample')}
            </Title>
            <Content aside={aside}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage
                        items={tagsWithSingleRun}
                        renderChart={renderChart}
                        loader={<ChartLoader />}
                        loading={loading}
                    />
                )}
            </Content>
        </>
    );
};

export default ImageSample;
