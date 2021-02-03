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

import ChartPage, {RenderChart} from '~/components/ChartPage';
import CurveChart, {Loader as ChartLoader} from '~/components/CurvesPage/CurveChart';
import React, {FunctionComponent, useCallback, useState} from 'react';

import Content from '~/components/Content';
import CurveAside from '~/components/CurvesPage/CurveAside';
import Error from '~/components/Error';
import type {Tag} from '~/resource/curves';
import Title from '~/components/Title';
import {useTranslation} from 'react-i18next';

const ROCCurve: FunctionComponent = () => {
    const {t} = useTranslation('common');

    const [running, setRunning] = useState(true);
    const [loading, setLoading] = useState(false);

    const [tags, setTags] = useState<Tag[]>([]);

    const renderChart = useCallback<RenderChart<Tag>>(
        ({label, runs}) => <CurveChart type="roc" runs={runs} tag={label} running={running} />,
        [running]
    );

    return (
        <>
            <Title>{t('common:roc-curve')}</Title>
            <Content
                aside={
                    <CurveAside
                        type="roc"
                        onChangeLoading={setLoading}
                        onChangeSteps={setTags}
                        onToggleRunning={setRunning}
                    />
                }
            >
                {!loading && !tags.length ? (
                    <Error />
                ) : (
                    <ChartPage items={tags} renderChart={renderChart} loader={<ChartLoader />} loading={loading} />
                )}
            </Content>
        </>
    );
};

export default ROCCurve;
