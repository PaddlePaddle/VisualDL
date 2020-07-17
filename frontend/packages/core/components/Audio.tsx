import {BlobResponse, blobFetcher} from '~/utils/fetch';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {
    WithStyled,
    primaryActiveColor,
    primaryBackgroundColor,
    primaryColor,
    primaryFocusedColor,
    rem,
    textLightColor,
    textLighterColor
} from '~/utils/style';

import {AudioPlayer} from '~/utils/audio';
import Icon from '~/components/Icon';
import PuffLoader from 'react-spinners/PuffLoader';
import RangeSlider from '~/components/RangeSlider';
import SyncLoader from 'react-spinners/SyncLoader';
import Tippy from '@tippyjs/react';
import mime from 'mime-types';
import moment from 'moment';
import {saveAs} from 'file-saver';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from '~/utils/i18n';

const Container = styled.div`
    background-color: ${primaryBackgroundColor};
    border-radius: ${rem(8)};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${rem(20)};

    > .control {
        font-size: ${rem(16)};
        line-height: 1;
        margin: 0 ${rem(10)};
        color: ${primaryColor};
        cursor: pointer;

        &.volumn {
            font-size: ${rem(20)};
        }

        &.disabled {
            color: ${textLightColor};
            cursor: not-allowed;
        }

        &:hover {
            color: ${primaryFocusedColor};
        }

        &:active {
            color: ${primaryActiveColor};
        }
    }

    > .slider {
        flex-grow: 1;
        padding: 0 ${rem(10)};
    }

    > .time {
        color: ${textLighterColor};
        font-size: ${rem(12)};
        margin: 0 ${rem(5)};
    }
`;

const VolumnSlider = styled.input.attrs(() => ({
    type: 'range',
    orient: 'vertical',
    min: 0,
    max: 100,
    step: 1
}))`
    writing-mode: bt-lr;
    -webkit-appearance: slider-vertical;
    margin: ${rem(15)} ${rem(18)};
    width: ${rem(4)};
    height: ${rem(100)};
    cursor: pointer;
`;

const SLIDER_MAX = 100;

function formatDuration(seconds: number) {
    const duration = moment.duration(seconds, 'seconds');
    return (
        String(Math.floor(duration.asMinutes())).padStart(2, '0') + ':' + String(duration.seconds()).padStart(2, '0')
    );
}

export type AudioRef = {
    save(filename: string): void;
};

export type AudioProps = {
    src?: string;
    cache?: number;
    onLoading?: () => unknown;
    onLoad?: (audio: {sampleRate: number; duration: number}) => unknown;
};

const Audio = React.forwardRef<AudioRef, AudioProps & WithStyled>(({src, cache, onLoading, onLoad, className}, ref) => {
    const {t} = useTranslation('common');

    const {data, error, loading} = useRequest<BlobResponse>(src ?? null, blobFetcher, {
        dedupingInterval: cache ?? 2000
    });

    useImperativeHandle(ref, () => ({
        save: (filename: string) => {
            if (data) {
                const ext = data.type ? mime.extension(data.type) : null;
                saveAs(data.data, filename.replace(/[/\\?%*:|"<>]/g, '_') + (ext ? `.${ext}` : ''));
            }
        }
    }));

    const timer = useRef<number | null>(null);
    const player = useRef<AudioPlayer | null>(null);
    const [sliderValue, setSliderValue] = useState(0);
    const [offset, setOffset] = useState(0);
    const [duration, setDuration] = useState('00:00');
    const [decoding, setDecoding] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [volumn, setVolumn] = useState(100);
    const [playAfterSeek, setPlayAfterSeek] = useState(false);

    const play = useCallback(() => player.current?.play(), []);
    const pause = useCallback(() => player.current?.pause(), []);
    const toggle = useCallback(() => player.current?.toggle(), []);
    const change = useCallback((value: number) => {
        if (!player.current) {
            return;
        }
        setOffset((value / SLIDER_MAX) * player.current.duration);
        setSliderValue(value);
    }, []);
    const startSeek = useCallback(() => {
        setPlayAfterSeek(playing);
        pause();
    }, [playing, pause]);
    const stopSeek = useCallback(() => {
        if (!player.current) {
            return;
        }
        player.current.seek(offset);
        if (playAfterSeek && offset < player.current.duration) {
            play();
        }
    }, [play, offset, playAfterSeek]);
    const toggleMute = useCallback(() => {
        if (player.current) {
            player.current.toggleMute();
            setVolumn(player.current.volumn);
        }
    }, []);

    const tick = useCallback(() => {
        if (player.current) {
            const current = player.current.current;
            setOffset(current);
            setSliderValue(Math.floor((current / player.current.duration) * SLIDER_MAX));
        }
    }, []);
    const startTimer = useCallback(() => {
        tick();
        timer.current = (globalThis.setInterval(tick, 250) as unknown) as number;
    }, [tick]);
    const stopTimer = useCallback(() => {
        if (player.current) {
            if (player.current.current >= player.current.duration) {
                tick();
            }
        }
        if (timer.current) {
            globalThis.clearInterval(timer.current);
            timer.current = null;
        }
    }, [tick]);

    useEffect(() => {
        if (player.current) {
            player.current.volumn = volumn;
        }
    }, [volumn]);

    useEffect(() => {
        if (process.browser) {
            let p: AudioPlayer | null = null;
            if (data) {
                (async () => {
                    setDecoding(true);
                    onLoading?.();
                    setOffset(0);
                    setSliderValue(0);
                    setDuration('00:00');
                    p = new AudioPlayer({
                        onplay: () => {
                            setPlaying(true);
                            startTimer();
                        },
                        onstop: () => {
                            setPlaying(false);
                            stopTimer();
                        }
                    });
                    const buffer = await data.data.arrayBuffer();
                    await p.load(buffer, data.type != null ? mime.extension(data.type) || undefined : undefined);
                    setDecoding(false);
                    setDuration(formatDuration(p.duration));
                    onLoad?.({sampleRate: p.sampleRate, duration: p.duration});
                    player.current = p;
                })();
            }
            return () => {
                if (p) {
                    setPlaying(false);
                    p.dispose();
                    player.current = null;
                }
            };
        }
    }, [data, startTimer, stopTimer, onLoading, onLoad]);

    const volumnIcon = useMemo(() => {
        if (volumn === 0) {
            return 'mute';
        }
        if (volumn <= 50) {
            return 'volumn-low';
        }
        return 'volumn';
    }, [volumn]);

    if (loading) {
        return <SyncLoader color={primaryColor} size="15px" />;
    }

    if (error) {
        return <div>{t('common:error')}</div>;
    }

    return (
        <Container className={className}>
            <a className={`control ${decoding ? 'disabled' : ''}`} onClick={toggle}>
                {decoding ? <PuffLoader size="16px" /> : <Icon type={playing ? 'pause' : 'play'} />}
            </a>
            <div className="slider">
                <RangeSlider
                    min={0}
                    max={SLIDER_MAX}
                    step={1}
                    value={sliderValue}
                    disabled={decoding}
                    onChange={change}
                    onChangeStart={startSeek}
                    onChangeComplete={stopSeek}
                />
            </div>
            <span className="time">
                {formatDuration(offset)}/{duration}
            </span>
            <Tippy
                placement="top"
                animation="shift-away-subtle"
                interactive
                hideOnClick={false}
                content={<VolumnSlider value={volumn} onChange={e => setVolumn(+e.target.value)} />}
            >
                <a className="control volumn" onClick={toggleMute}>
                    <Icon type={volumnIcon} />
                </a>
            </Tippy>
        </Container>
    );
});

export default Audio;
