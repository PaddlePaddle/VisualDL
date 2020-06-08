import Image, {ImageRef} from '~/components/Image';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ellipsis, em, primaryColor, rem, size, textLightColor, transitionProps} from '~/utils/style';

import ChartToolbox from '~/components/ChartToolbox';
import GridLoader from 'react-spinners/GridLoader';
import StepSlider from '~/components/SamplesPage/StepSlider';
import {formatTime} from '~/utils';
import isEmpty from 'lodash/isEmpty';
import queryString from 'query-string';
import styled from 'styled-components';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from '~/utils/i18n';

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

const Title = styled.div`
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
        color: ${textLightColor};
    }
`;

const Container = styled.div<{brightness?: number; contrast?: number; fit?: boolean}>`
    flex-grow: 1;
    flex-shrink: 1;
    margin: ${em(20)} 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    > img {
        ${size('100%')}
        filter: brightness(${props => props.brightness ?? 1}) contrast(${props => props.contrast ?? 1});
        ${transitionProps('filter')}
        object-fit: ${props => (props.fit ? 'contain' : 'scale-down')};
        flex-shrink: 1;
    }
`;

const Toolbox = styled(ChartToolbox)`
    margin-bottom: ${rem(18)};
`;

type ImageData = {
    step: number;
    wallTime: number;
};

type SampleChartProps = {
    run: string;
    tag: string;
    brightness?: number;
    contrast?: number;
    fit?: boolean;
    running?: boolean;
};

const getImageUrl = (index: number, run: string, tag: string, wallTime: number): string =>
    `/images/image?${queryString.stringify({index, ts: wallTime, run, tag})}`;

const cacheValidity = 5 * 60 * 1000;

const SampleChart: FunctionComponent<SampleChartProps> = ({run, tag, brightness, contrast, fit, running}) => {
    const {t, i18n} = useTranslation(['samples', 'common']);

    const image = useRef<ImageRef>(null);

    const {data, error, loading} = useRunningRequest<ImageData[]>(
        `/images/list?${queryString.stringify({run, tag})}`,
        !!running
    );

    const steps = useMemo(() => data?.map(item => item.step) ?? [], [data]);

    const [step, setStep] = useState(0);
    const [src, setSrc] = useState<string>();

    const cached = useRef<Record<number, {src: string; timer: NodeJS.Timeout}>>({});
    const timer = useRef<NodeJS.Timeout | null>(null);

    // clear cache if tag or run changed
    useEffect(() => {
        Object.values(cached.current).forEach(({timer}) => clearTimeout(timer));
        cached.current = {};
    }, [tag, run]);

    const wallTime = useMemo(() => data?.[step].wallTime ?? 0, [data, step]);

    const cacheImageSrc = useCallback(() => {
        if (!data) {
            return;
        }
        const imageUrl = getImageUrl(step, run, tag, wallTime);
        cached.current[step] = {
            src: imageUrl,
            timer: setTimeout(() => {
                ((s: number) => delete cached.current[s])(step);
            }, cacheValidity)
        };
        setSrc(imageUrl);
    }, [step, run, tag, wallTime, data]);

    const saveImage = useCallback(() => {
        image.current?.save(`${run}-${tag}-${steps[step]}-${wallTime.toString().replace(/\./, '_')}`);
    }, [run, tag, steps, step, wallTime]);

    useEffect(() => {
        if (cached.current[step]) {
            // cached, return immediately
            setSrc(cached.current[step].src);
        } else if (isEmpty(cached.current)) {
            // first load, return immediately
            cacheImageSrc();
        } else {
            timer.current = setTimeout(cacheImageSrc, 500);
            return () => {
                timer.current && clearTimeout(timer.current);
            };
        }
    }, [step, cacheImageSrc]);

    const [viewed, setViewed] = useState<boolean>(false);

    const container = useRef<HTMLDivElement>(null);
    const observer = useRef(
        process.browser
            ? new IntersectionObserver(entries => {
                  if (entries[0].intersectionRatio > 0) {
                      setViewed(true);
                      observer.current?.disconnect();
                  }
              })
            : null
    );

    useEffect(() => {
        const o = observer.current;
        if (process.browser && container.current && o) {
            o.observe(container.current);
            return () => o.disconnect();
        }
    }, []);

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
        return <Image ref={image} src={src} cache={cacheValidity} />;
    }, [viewed, loading, error, data, step, src, t]);

    return (
        <Wrapper>
            <Title>
                <h4>{tag}</h4>
                <span>{run}</span>
            </Title>
            <StepSlider value={step} steps={steps} onChange={setStep} onChangeComplete={cacheImageSrc}>
                {formatTime(wallTime * 1000, i18n.language)}
            </StepSlider>
            <Container ref={container} brightness={brightness} contrast={contrast} fit={fit}>
                {Content}
            </Container>
            <Toolbox
                items={[
                    {
                        icon: 'download',
                        tooltip: t('samples:download-image'),
                        onClick: saveImage
                    }
                ]}
            />
        </Wrapper>
    );
};

export default SampleChart;
