import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ellipsis, em, primaryColor, rem, size, textLightColor} from '~/utils/style';

import ChartToolbox from '~/components/ChartToolbox';
import GridLoader from 'react-spinners/GridLoader';
import {Run} from '~/types';
import StepSlider from '~/components/SamplePage/StepSlider';
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
        color: ${textLightColor};

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

const Container = styled.div<{brightness?: number; contrast?: number; fit?: boolean}>`
    flex-grow: 1;
    flex-shrink: 1;
    margin: ${em(20)} 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

const Footer = styled.div`
    margin-bottom: ${rem(18)};
    display: flex;
    align-items: center;
    justify-content: space-between;
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

type SampleChartRef = {
    save: (filename: string) => void;
};

type SampleChartProps = {
    type: 'image' | 'audio';
    cache: number;
    footer?: JSX.Element;
    content: (ref: React.RefObject<SampleChartRef>, src: string) => JSX.Element;
} & SampleChartBaseProps;

const getUrl = (type: string, index: number, run: string, tag: string, wallTime: number): string =>
    `/${type}/${type}?${queryString.stringify({index, ts: wallTime, run, tag})}`;

const SampleChart: FunctionComponent<SampleChartProps> = ({run, tag, running, type, cache, footer, content}) => {
    const {t, i18n} = useTranslation(['sample', 'common']);

    const sampleRef = useRef<SampleChartRef>(null);

    const {data, error, loading} = useRunningRequest<SampleData[]>(
        `/${type}/list?${queryString.stringify({run: run.label, tag})}`,
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
    }, [type, step, run.label, tag, wallTime, data, cache]);

    const download = useCallback(() => {
        sampleRef.current?.save(`${run.label}-${tag}-${steps[step]}-${wallTime.toString().replace(/\./, '_')}`);
    }, [run.label, tag, steps, step, wallTime]);

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
                timer.current && clearTimeout(timer.current);
            };
        }
    }, [step, cacheSrc]);

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
        if (src) {
            return content(sampleRef, src);
        }
        return null;
    }, [viewed, loading, error, data, step, src, t, content]);

    return (
        <Wrapper>
            <Title color={run.colors[0]}>
                <h4>{tag}</h4>
                <span>{run.label}</span>
            </Title>
            <StepSlider value={step} steps={steps} onChange={setStep} onChangeComplete={cacheSrc}>
                {formatTime(wallTime * 1000, i18n.language)}
            </StepSlider>
            <Container ref={container}>{Content}</Container>
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
                {footer}
            </Footer>
        </Wrapper>
    );
};

export default SampleChart;
