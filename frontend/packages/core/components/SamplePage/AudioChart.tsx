import Audio, {AudioProps, AudioRef} from '~/components/Audio';
import React, {FunctionComponent, useCallback, useState} from 'react';
import SampleChart, {SampleChartBaseProps} from '~/components/SamplePage/SampleChart';
import {rem, size, textLighterColor} from '~/utils/style';

import {format} from 'd3-format';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const formatter = format('.5~s');

const StyledAudio = styled(Audio)`
    ${size('100%')}
    flex-shrink: 1;
`;

const AudioInfo = styled.span`
    color: ${textLighterColor};
    font-size: ${rem(12)};
`;

const cache = 5 * 60 * 1000;

type AudioChartProps = SampleChartBaseProps;

const AudioChart: FunctionComponent<AudioChartProps> = ({...props}) => {
    const {t} = useTranslation(['sample', 'common']);

    const [sampleRate, setSampleRate] = useState<string>('--Hz');

    const onLoading = useCallback(() => setSampleRate('--Hz'), []);
    const onLoad = useCallback<NonNullable<AudioProps['onLoad']>>(
        audio => setSampleRate(formatter(audio.sampleRate) + 'Hz'),
        []
    );

    const content = useCallback(
        (ref: React.RefObject<AudioRef>, src: string) => (
            <StyledAudio src={src} cache={cache} onLoading={onLoading} onLoad={onLoad} ref={ref} />
        ),
        [onLoading, onLoad]
    );

    return (
        <SampleChart
            type="audio"
            cache={cache}
            footer={
                <AudioInfo>
                    {t('sample:sample-rate')}
                    {t('common:colon')}
                    {sampleRate}
                </AudioInfo>
            }
            content={content}
            {...props}
        />
    );
};

export default AudioChart;
