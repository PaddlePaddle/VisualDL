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

import Audio, {AudioProps} from '~/components/Audio';
import React, {FunctionComponent, useCallback, useState} from 'react';
import SampleChart, {SampleChartBaseProps, SampleEntityProps} from '~/components/SamplePage/SampleChart';

import {format} from 'd3-format';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const formatter = format('.5~s');

const StyledAudio = styled(Audio)`
    width: 100%;
    flex-shrink: 1;
    align-self: stretch;
`;

const cache = 5 * 60 * 1000;

type AudioChartProps = {
    audioContext?: AudioContext;
} & SampleChartBaseProps;

const AudioChart: FunctionComponent<AudioChartProps> = ({audioContext, ...props}) => {
    const {t} = useTranslation(['sample', 'common']);

    const [sampleRate, setSampleRate] = useState<string>('--Hz');

    const onLoading = useCallback(() => setSampleRate('--Hz'), []);
    const onLoad = useCallback<NonNullable<AudioProps['onLoad']>>(
        audio => setSampleRate(formatter(audio.sampleRate) + 'Hz'),
        []
    );

    const content = useCallback(
        (props: SampleEntityProps) => (
            <StyledAudio audioContext={audioContext} {...props} onLoading={onLoading} onLoad={onLoad} />
        ),
        [onLoading, onLoad, audioContext]
    );

    return (
        <SampleChart
            type="audio"
            cache={cache}
            footer={
                <span>
                    {t('sample:sample-rate')}
                    {t('common:colon')}
                    {sampleRate}
                </span>
            }
            content={content}
            {...props}
        />
    );
};

export default AudioChart;
