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
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
import TextChart, {Loader as ChartLoader} from '~/components/SamplePage/Text';

import Content from '~/components/Content';
import Error from '~/components/Error';
import RunAside from '~/components/RunAside';
import Title from '~/components/Title';
import useTagFilter from '~/hooks/useTagFilter';
import {useTranslation} from 'react-i18next';

const TextSample: FunctionComponent = () => {
    const {t} = useTranslation(['sample', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tagsWithSingleRun, selectedRuns, onChangeRuns, loading} = useTagFilter('text', running);

    const aside = useMemo(
        () => (
            <RunAside
                runs={runs}
                selectedRuns={selectedRuns}
                onChangeRuns={onChangeRuns}
                running={running}
                onToggleRunning={setRunning}
                loading={loading}
            ></RunAside>
        ),
        [loading, onChangeRuns, running, runs, selectedRuns]
    );

    const withChart = useCallback<RenderChart<typeof tagsWithSingleRun[number]>>(
        ({run, label}, index) => <TextChart run={run} tag={label} opened={index === 0} running={running} />,
        [running]
    );

    return (
        <>
            <Title>
                {t('common:text')} - {t('common:sample')}
            </Title>
            <Content aside={aside}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage
                        items={tagsWithSingleRun}
                        renderChart={withChart}
                        loader={<ChartLoader />}
                        loading={loading}
                    />
                )}
            </Content>
        </>
    );
};

export default TextSample;
