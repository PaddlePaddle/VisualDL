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

import React, {FunctionComponent, useCallback, useState} from 'react';

import Button from '~/components/Button';
import Field from '~/components/Field';
import Slider from '~/components/Slider';
import {useTranslation} from 'react-i18next';

export type TSNEDetailProps = {
    iteration: number;
    perplexity: number;
    learningRate: number;
    paused: boolean;
    onChangePerplexity?: (perplexity: number) => void;
    onChangeLearningRate?: (learningRate: number) => void;
    onPause?: () => void;
    onResume?: () => void;
};

const TSNEDetail: FunctionComponent<TSNEDetailProps> = ({
    iteration,
    perplexity,
    learningRate,
    paused,
    onChangePerplexity,
    onChangeLearningRate,
    onPause,
    onResume
}) => {
    const {t} = useTranslation(['high-dimensional', 'common']);

    const [localPerplexity, setPerplexity] = useState(perplexity);
    const changePerplexity = useCallback(
        (perplexity: number) => {
            setPerplexity(perplexity);
            onChangePerplexity?.(perplexity);
        },
        [onChangePerplexity]
    );

    const [localLearningRate, setLearningRate] = useState(learningRate);
    const changeLearningRate = useCallback(
        (learningRate: number) => {
            setLearningRate(learningRate);
            onChangeLearningRate?.(learningRate);
        },
        [onChangeLearningRate]
    );

    const [localPaused, setPaused] = useState(paused);
    const togglePaused = useCallback(
        () =>
            setPaused(p => {
                if (p) {
                    onResume?.();
                } else {
                    onPause?.();
                }
                return !p;
            }),
        [onResume, onPause]
    );

    return (
        <>
            <Field label={t('high-dimensional:perplexity')}>
                <Slider min={2} max={100} step={1} value={localPerplexity} onChange={changePerplexity} />
            </Field>
            <Field label={t('high-dimensional:learning-rate')}>
                <Slider
                    steps={[0.001, 0.01, 0.1, 1, 10, 100]}
                    value={localLearningRate}
                    onChange={changeLearningRate}
                />
            </Field>
            <Field>
                <Button type="primary" outline rounded onClick={togglePaused}>
                    {localPaused ? t('high-dimensional:continue') : t('high-dimensional:pause')}
                </Button>
            </Field>
            <Field className="secondary">
                {t('high-dimensional:iteration')}
                {t('common:colon')}
                {iteration}
            </Field>
        </>
    );
};

export default TSNEDetail;
