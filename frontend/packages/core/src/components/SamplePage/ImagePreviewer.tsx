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

import React, {FunctionComponent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {em, headerHeight, primaryColor, rem, zIndexes} from '~/utils/style';

import GridLoader from 'react-spinners/GridLoader';
import Icon from '~/components/Icon';
import RangeSlider from '~/components/RangeSlider';
import type {SamplePreviewerProps} from '~/components/SamplePage/SampleChart';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Wrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: ${zIndexes.dialog};
    height: 100vh;
    width: 100vw;
    background-color: var(--dark-mask-color);
`;

const Header = styled.div`
    position: relative;
    height: ${headerHeight};
    width: 100%;
    background-color: var(--model-header-background-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .step-slider {
        display: flex;
        align-items: center;
        flex-grow: 1;
        margin: 0 ${rem(20)};

        .slider {
            width: 31.7213115%;
            margin: 0 ${rem(12)};
        }

        .step-buttons {
            margin-left: ${em(10)};
            display: flex;
            flex-direction: column;
            font-size: ${em(10)};

            > a {
                display: inline-block;
                line-height: 1;
                height: ${em(14)};

                &:hover {
                    color: var(--text-lighter-color);
                }

                > i {
                    display: inline-block;
                    height: 100%;

                    > svg {
                        vertical-align: top;
                    }
                }
            }
        }
    }

    .buttons {
        display: flex;
        align-items: center;
        font-size: ${rem(24)};

        > * {
            margin-right: ${rem(30)};
        }

        > a {
            height: ${rem(24)};
            overflow: hidden;
        }

        > span {
            width: 1px;
            height: ${rem(30)};
            background-color: var(--border-color);
        }
    }
`;

const Container = styled.div<{grabbing?: boolean}>`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    height: calc(100% - ${headerHeight});
    width: 100%;
    top: ${headerHeight};
    left: 0;
    overflow: hidden;

    > img {
        cursor: ${props => (props.grabbing ? 'grabbing' : 'grab')};
    }
`;

const MAX_IMAGE_SCALE = 3;
const MIN_IMAGE_SCALE = 0.1;

type ImagePreviewerProps = SamplePreviewerProps;

const ImagePreviewer: FunctionComponent<ImagePreviewerProps> = ({
    data,
    loading,
    error,
    steps,
    step: propStep,
    onClose,
    onChange,
    onChangeComplete
}) => {
    const {t} = useTranslation('sample');

    const [step, setStep] = useState(propStep ?? 0);
    useEffect(() => setStep(propStep ?? 0), [propStep]);

    const changeStep = useCallback(
        (num: number) => {
            setStep(num);
            onChange?.(num);
        },
        [onChange]
    );

    const prevStep = useCallback(() => {
        if (step > 0) {
            changeStep(step - 1);
        }
    }, [step, changeStep]);

    const nextStep = useCallback(() => {
        if (step < steps.length - 1) {
            changeStep(step + 1);
        }
    }, [step, steps, changeStep]);

    const [url, setUrl] = useState('');

    // use useLayoutEffect hook to prevent image render after url revoked
    useLayoutEffect(() => {
        if (data) {
            let objectUrl: string | null = null;
            objectUrl = URL.createObjectURL(data.data);
            setUrl(objectUrl);
            return () => {
                objectUrl && URL.revokeObjectURL(objectUrl);
            };
        }
    }, [data]);

    const container = useRef<HTMLDivElement>(null);
    const image = useRef<HTMLImageElement>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    useEffect(() => {
        if (url) {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                const rect = container.current?.getBoundingClientRect();
                if (rect) {
                    const r = rect.width / rect.height;
                    const ir = img.naturalWidth / img.naturalHeight;
                    if (r >= ir && img.naturalHeight > rect.height * 0.9) {
                        setHeight(rect.height * 0.9);
                        setWidth(ir * rect.height * 0.9);
                    } else if (ir >= r && img.naturalWidth > rect.width * 0.9) {
                        setWidth(rect.width * 0.9);
                        setHeight((rect.width / ir) * 0.9);
                    } else {
                        setWidth(img.naturalWidth);
                        setHeight(img.naturalHeight);
                    }
                }
            };
        }
        return () => {
            setWidth(0);
            setHeight(0);
        };
    }, [url]);

    const [scale, setScale] = useState(1);
    const scaleImage = useCallback(
        (step: number) =>
            setScale(s => {
                if (s + step > MAX_IMAGE_SCALE) {
                    return MAX_IMAGE_SCALE;
                }
                if (s + step < MIN_IMAGE_SCALE) {
                    return MIN_IMAGE_SCALE;
                }
                return s + step;
            }),
        []
    );
    useEffect(() => {
        const img = container.current;
        const wheel = (e: WheelEvent) => {
            e.preventDefault();
            setScale(s => {
                const t = s - e.deltaY * 0.007;
                if (t > MAX_IMAGE_SCALE) {
                    return MAX_IMAGE_SCALE;
                }
                if (t < MIN_IMAGE_SCALE) {
                    return MIN_IMAGE_SCALE;
                }
                return t;
            });
        };
        img?.addEventListener('wheel', wheel);
        return () => {
            img?.removeEventListener('wheel', wheel);
        };
    }, []);

    const [grabbing, setGrabbing] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    useEffect(() => {
        const img = image.current;
        let trigger = false;
        let ox = 0;
        let oy = 0;
        const mousedown = (e: MouseEvent) => {
            e.preventDefault();
            setGrabbing(true);
            trigger = true;
            ox = e.clientX;
            oy = e.clientY;
        };
        const mousemove = (e: MouseEvent) => {
            e.preventDefault();
            if (trigger) {
                setX(sx => {
                    return sx + (e.clientX - ox);
                });
                setY(sy => {
                    return sy + (e.clientY - oy);
                });
                ox = e.clientX;
                oy = e.clientY;
            }
        };
        const mouseup = () => {
            setGrabbing(false);
            trigger = false;
        };
        img?.addEventListener('mousedown', mousedown);
        img?.addEventListener('mousemove', mousemove);
        img?.addEventListener('mouseup', mouseup);
        img?.addEventListener('mouseout', mouseup);
        return () => {
            img?.removeEventListener('mousedown', mousedown);
            img?.removeEventListener('mousemove', mousemove);
            img?.removeEventListener('mouseup', mouseup);
            img?.removeEventListener('mouseout', mouseup);
        };
    }, [url]);

    const reset = useCallback(() => {
        setScale(1);
        setX(0);
        setY(0);
    }, []);

    useEffect(() => reset, [url, reset]);

    const content = useMemo(() => {
        if (loading) {
            return <GridLoader color={primaryColor} size="10px" />;
        }
        if (error) {
            return <div>{t('common:error')}</div>;
        }
        return (
            <img
                src={url}
                ref={image}
                onClick={e => e.stopPropagation()}
                style={{
                    width,
                    height,
                    transform: `translate(${x}px, ${y}px) scale(${scale})`
                }}
            />
        );
    }, [url, loading, error, width, height, x, y, scale, t]);

    return (
        <Wrapper>
            <Header>
                <div className="step-slider">
                    <span>{t('common:time-mode.step')}</span>
                    <RangeSlider
                        className="slider"
                        min={0}
                        max={steps.length ? steps.length - 1 : 0}
                        step={1}
                        value={step}
                        onChange={changeStep}
                        onChangeComplete={onChangeComplete}
                    />
                    <span>{steps[step]}</span>
                    <div className="step-buttons">
                        <a href="javascript:void(0)" onClick={prevStep}>
                            <Icon type="chevron-up" />
                        </a>
                        <a href="javascript:void(0)" onClick={nextStep}>
                            <Icon type="chevron-down" />
                        </a>
                    </div>
                </div>
                <div className="buttons">
                    <a href="javascript:void(0)" onClick={() => scaleImage(0.1)}>
                        <Icon type="plus-circle" />
                    </a>
                    <a href="javascript:void(0)" onClick={() => scaleImage(-0.1)}>
                        <Icon type="minus-circle" />
                    </a>
                    <a href="javascript:void(0)" onClick={reset}>
                        <Icon type="restore-circle" />
                    </a>
                    <span></span>
                    <a href="javascript:void(0)" onClick={onClose}>
                        <Icon type="close" />
                    </a>
                </div>
            </Header>
            <Container ref={container} onClick={onClose} grabbing={grabbing}>
                {content}
            </Container>
        </Wrapper>
    );
};

export default ImagePreviewer;
