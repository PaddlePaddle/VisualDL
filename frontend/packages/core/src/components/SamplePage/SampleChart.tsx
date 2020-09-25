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
import {ellipsis, em, primaryColor, rem, size, transitionProps} from '~/utils/style';

import type {BlobResponse} from '~/utils/fetch';
import ChartToolbox from '~/components/ChartToolbox';
import GridLoader from 'react-spinners/GridLoader';
import type {Run} from '~/types';
import StepSlider from '~/components/SamplePage/StepSlider';
import {fetcher} from '~/utils/fetch';
import {formatTime} from '~/utils';
import isEmpty from 'lodash/isEmpty';
import mime from 'mime-types';
import queryString from 'query-string';
import {saveAs} from 'file-saver';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

const Wrapper = styled.div`
    height: 100%;
    padding: ${em(20)};
    padding-bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    > * {
        flex-grow: 0;
        flex-shrink: 0;
    }
`;

const Title = styled.div<{color: string}>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${em(20)};

    > h4 {
        font-size: ${em(16)};
        font-weight: 700;
        flex-shrink: 1;
        flex-grow: 1;
        padding: 0;
        margin: 0;
        ${ellipsis()}
    }

    > span {
        font-size: ${em(14)};
        flex-shrink: 0;
        flex-grow: 0;
        color: var(--text-light-color);
        ${ellipsis()}
        max-width: 50%;
        ${transitionProps('color')}

        &::before {
            content: '';
            display: inline-block;
            ${size(rem(5), rem(17))}
            margin-right: ${rem(8)};
            border-radius: ${rem(2.5)};
            vertical-align: middle;
            background-color: ${props => props.color};
        }
    }
`;

const Container = styled.div<{preview?: boolean}>`
    flex-grow: 1;
    flex-shrink: 1;
    margin: ${em(20)} 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    cursor: ${props => (props.preview ? 'zoom-in' : 'default')};
`;

const Footer = styled.div`
    margin-bottom: ${rem(18)};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const FooterInfo = styled.div`
    color: var(--text-lighter-color);
    font-size: ${rem(12)};
    ${transitionProps('color')}

    > * {
        display: inline-block;
        margin-left: ${rem(10)};
    }
`;

type SampleData = {
    step: number;
    wallTime: number;
};

export type SampleChartBaseProps = {
    run: Run;
    tag: string;
    running?: boolean;
};

export type SampleEntityProps = {
    data?: BlobResponse;
    loading?: boolean;
    error?: Error;
};

export type SamplePreviewerProps = SampleEntityProps & {
    steps: number[];
    step?: number;
    onClose?: () => unknown;
    onChange?: (value: number) => unknown;
    onChangeComplete?: () => unknown;
};

type SampleChartProps = {
    type: 'image' | 'audio';
    cache: number;
    step?: number;
    footer?: JSX.Element;
    content: (props: SampleEntityProps) => React.ReactNode;
    previewer?: (props: SamplePreviewerProps) => React.ReactNode;
} & SampleChartBaseProps;

const getUrl = (type: string, index: number, run: string, tag: string, wallTime: number): string =>
    `/${type}/${type}?${queryString.stringify({index, ts: wallTime, run, tag})}`;

const SampleChart: FunctionComponent<SampleChartProps> = ({
    run,
    tag,
    running,
    type,
    cache,
    footer,
    content,
    previewer
}) => {
    const {t, i18n} = useTranslation(['sample', 'common']);

    const {data, error, loading} = useRunningRequest<SampleData[]>(
        `/${type}/list?${queryString.stringify({run: run.label, tag})}`,
        !!running
    );

    const steps = useMemo(() => data?.map(item => item.step) ?? [], [data]);

    const [preview, setPreview] = useState(false);
    const [step, setStep] = useState(0);
    const [src, setSrc] = useState<string>();

    const cached = useRef<Record<number, {src: string; timer: number}>>({});
    const timer = useRef<number | null>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const hoveredNodes = document.querySelectorAll(':hover');
            if (preview || Array.from(hoveredNodes).some(node => node.isSameNode(wrapperRef.current))) {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    setStep(s => (s > 0 ? s - 1 : s));
                    event.preventDefault();
                } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    setStep(s => (s < steps.length - 1 ? s + 1 : s));
                    event.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [steps, preview]);

    // clear cache if tag or run changed
    useEffect(() => {
        Object.values(cached.current).forEach(({timer}) => clearTimeout(timer));
        cached.current = {};
    }, [tag, run]);

    const wallTime = useMemo(() => data?.[step].wallTime ?? 0, [data, step]);

    const cacheSrc = useCallback(() => {
        if (!data) {
            return;
        }
        const url = getUrl(type, step, run.label, tag, wallTime);
        cached.current[step] = {
            src: url,
            timer: setTimeout(() => {
                ((s: number) => delete cached.current[s])(step);
            }, cache)
        };
        setSrc(url);
        timer.current = null;
    }, [type, step, run.label, tag, wallTime, data, cache]);

    useEffect(() => {
        if (cached.current[step]) {
            // cached, return immediately
            setSrc(cached.current[step].src);
        } else if (isEmpty(cached.current)) {
            // first load, return immediately
            cacheSrc();
        } else {
            timer.current = setTimeout(cacheSrc, 500);
            return () => {
                if (timer.current != null) {
                    clearTimeout(timer.current);
                    timer.current = null;
                }
            };
        }
    }, [step, cacheSrc]);

    const [viewed, setViewed] = useState<boolean>(false);

    const container = useRef<HTMLDivElement>(null);
    const observer = useRef(
        new IntersectionObserver(entries => {
            if (entries[0].intersectionRatio > 0) {
                setViewed(true);
                observer.current?.disconnect();
            }
        })
    );

    useEffect(() => {
        const o = observer.current;
        if (container.current && o) {
            o.observe(container.current);
            return () => o.disconnect();
        }
    }, []);

    const {data: entityData, error: entityError, loading: entityLoading} = useRequest<BlobResponse>(
        src ?? null,
        fetcher,
        {
            dedupingInterval: 5 * 60 * 1000
        }
    );

    const download = useCallback(() => {
        if (entityData) {
            const ext = entityData.type ? mime.extension(entityData.type) : null;
            saveAs(
                entityData.data,
                `${run.label}-${tag}-${steps[step]}-${wallTime.toString().replace(/\./, '_')}`.replace(
                    /[/\\?%*:|"<>]/g,
                    '_'
                ) + (ext ? `.${ext}` : '')
            );
        }
    }, [entityData, run.label, tag, steps, step, wallTime]);

    const entityProps = useMemo(() => {
        if (src) {
            return {data: entityData, error: entityError, loading: entityLoading};
        }
    }, [src, entityData, entityError, entityLoading]);

    const Content = useMemo(() => {
        // show loading when deferring
        if (loading || !cached.current[step] || !viewed) {
            return <GridLoader color={primaryColor} size="10px" />;
        }
        if (!data && error) {
            return <span>{t('common:error')}</span>;
        }
        if (isEmpty(data)) {
            return <span>{t('common:empty')}</span>;
        }
        if (entityProps) {
            return content(entityProps);
        }
        return null;
    }, [viewed, loading, error, data, step, entityProps, t, content]);

    const Previewer = useMemo(() => {
        if (!previewer) {
            return null;
        }
        if (!preview) {
            return null;
        }
        if (!entityProps) {
            return null;
        }
        return previewer({
            ...entityProps,
            loading: !cached.current[step] || entityProps.loading,
            steps,
            step,
            onClose: () => setPreview(false),
            onChange: setStep,
            onChangeComplete: cacheSrc
        });
    }, [previewer, entityProps, preview, steps, step, cacheSrc]);

    return (
        <Wrapper ref={wrapperRef}>
            <Title color={run.colors[0]}>
                <h4>{tag}</h4>
                <span>{run.label}</span>
            </Title>
            <StepSlider value={step} steps={steps} onChange={setStep} onChangeComplete={cacheSrc}>
                {formatTime(wallTime, i18n.language)}
            </StepSlider>
            <Container ref={container} preview={!!previewer && !!src} onClick={() => setPreview(true)}>
                {Content}
            </Container>
            {Previewer}
            <Footer>
                <ChartToolbox
                    items={[
                        {
                            icon: 'download',
                            tooltip: t(`sample:download-${type}`),
                            onClick: download
                        }
                    ]}
                />
                <FooterInfo>
                    <span>
                        {t('sample:sample')}
                        {t('common:colon')}
                        {data?.length ? `${step + 1}/${data.length}` : '--/--'}
                    </span>
                    {footer}
                </FooterInfo>
            </Footer>
        </Wrapper>
    );
};

export default SampleChart;
