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

import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {WithStyled, primaryColor, rem, size, transitionProps} from '~/utils/style';

import {AudioPlayer} from '~/utils/audio';
import type {BlobResponse} from '~/utils/fetch';
import Icon from '~/components/Icon';
import PuffLoader from 'react-spinners/PuffLoader';
import RangeSlider from '~/components/RangeSlider';
import Slider from 'react-rangeslider';
import SyncLoader from 'react-spinners/SyncLoader';
import Tippy from '@tippyjs/react';
import mime from 'mime-types';
import moment from 'moment';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Container = styled.div`
    background-color: var(--audio-background-color);
    border-radius: ${rem(8)};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${rem(20)};
    ${transitionProps('background-color')}

    > .control {
        font-size: ${rem(16)};
        ${size(rem(16), rem(16))}
        line-height: 1;
        margin: 0 ${rem(10)};
        color: var(--primary-color);
        cursor: pointer;
        ${transitionProps('color')}

        &.volumn {
            font-size: ${rem(20)};
            ${size(rem(20), rem(20))}
        }

        &.disabled {
            color: var(--text-light-color);
            cursor: not-allowed;
        }

        &:hover {
            color: var(--primary-focused-color);
        }

        &:active {
            color: var(--primary-active-color);
        }
    }

    > .slider {
        flex-grow: 1;
        padding: 0 ${rem(10)};
    }

    > .time {
        color: var(--text-lighter-color);
        font-size: ${rem(12)};
        margin: 0 ${rem(5)};
        ${transitionProps('color')}
    }
`;

const VolumnSlider = styled(Slider)`
    margin: ${rem(15)} ${rem(18)};
    width: ${rem(4)};
    height: ${rem(100)};
    cursor: pointer;
    position: relative;
    background-color: #dbdeeb;
    outline: none;
    border-radius: ${rem(2)};
    user-select: none;
    ${transitionProps('color')}

    --color: var(--primary-color);

    &:hover {
        --color: var(--primary-focused-color);
    }

    &:active {
        --color: var(--primary-active-color);
    }

    .rangeslider__fill {
        background-color: var(--color);
        position: absolute;
        bottom: 0;
        width: 100%;
        border-bottom-left-radius: ${rem(2)};
        border-bottom-right-radius: ${rem(2)};
        border-top: ${rem(4)} solid var(--color);
        box-sizing: content-box;
        ${transitionProps(['background-color', 'color'])}
    }

    .rangeslider__handle {
        background-color: var(--color);
        ${size(rem(8), rem(8))}
        position: absolute;
        left: -${rem(2)};
        border-radius: 50%;
        outline: none;
        ${transitionProps('background-color')}

        .rangeslider__handle-tooltip,
        .rangeslider__handle-label {
            display: none;
        }
    }

    .rangeslider__labels {
        display: none;
    }
`;

const SLIDER_MAX = 100;

function formatDuration(seconds: number) {
    const duration = moment.duration(seconds, 'seconds');
    return (
        String(Math.floor(duration.asMinutes())).padStart(2, '0') + ':' + String(duration.seconds()).padStart(2, '0')
    );
}

export type AudioProps = {
    audioContext?: AudioContext;
    data?: BlobResponse;
    loading?: boolean;
    error?: Error;
    onLoading?: () => unknown;
    onLoad?: (audio: {sampleRate: number; duration: number}) => unknown;
};

const Audio: FunctionComponent<AudioProps & WithStyled> = ({
    audioContext,
    data,
    loading,
    error,
    onLoading,
    onLoad,
    className
}) => {
    const {t} = useTranslation('common');

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
        timer.current = (window.setInterval(tick, 250) as unknown) as number;
    }, [tick]);
    const stopTimer = useCallback(() => {
        if (player.current) {
            if (player.current.current >= player.current.duration) {
                tick();
            }
        }
        if (timer.current) {
            window.clearInterval(timer.current);
            timer.current = null;
        }
    }, [tick]);

    useEffect(() => {
        if (player.current) {
            player.current.volumn = volumn;
        }
    }, [volumn]);

    useEffect(() => {
        let p: AudioPlayer | null = null;
        if (data) {
            (async () => {
                setDecoding(true);
                onLoading?.();
                setOffset(0);
                setSliderValue(0);
                setDuration('00:00');
                p = new AudioPlayer({
                    context: audioContext,
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
    }, [data, startTimer, stopTimer, onLoading, onLoad, audioContext]);

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
                content={
                    <VolumnSlider
                        value={volumn}
                        min={0}
                        max={100}
                        step={1}
                        onChange={setVolumn}
                        orientation="vertical"
                    />
                }
            >
                <a className="control volumn" onClick={toggleMute}>
                    <Icon type={volumnIcon} />
                </a>
            </Tippy>
        </Container>
    );
};

export default Audio;
