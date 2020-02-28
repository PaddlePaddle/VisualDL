import React, {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import {useTranslation} from '~/utils/i18n';
import {em, size, ellipsis, textLightColor} from '~/utils/style';
import StepSlider from '~/components/StepSlider';

const width = em(430);
const height = em(384);

const Wrapper = styled.div`
    ${size(height, width)}
    padding: ${em(20)};
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

const Container = styled.div<{fit?: boolean}>`
    flex-grow: 1;
    flex-shrink: 1;
    margin-top: ${em(20)};
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    > img {
        width: 100%;
        height: 100%;
        object-fit: ${props => (props.fit ? 'contain' : 'scale-down')};
        flex-shrink: 1;
    }
`;

type ImageData = {
    step: number;
    wallTime: number;
};

type SampleChartProps = {
    run: string;
    tag: string;
    fit?: boolean;
    running?: boolean;
};

const getImageUrl = (index: number, run: string, tag: string, wallTime: number): string =>
    `${process.env.API_URL}/images/individualImage?sample=0&index=${index}&ts=${wallTime}&run=${encodeURIComponent(
        run
    )}&tag=${encodeURIComponent(tag)}`;

const SampleChart: FunctionComponent<SampleChartProps> = ({run, tag, fit, running}) => {
    const {t} = useTranslation('common');

    const {data, error} = useSWR<ImageData[]>(
        `/images/images?run=${encodeURIComponent(run)}&tag=${encodeURIComponent(tag)}`,
        {
            refreshInterval: running ? 15 * 1000 : 0
        }
    );

    const [step, setStep] = useState(0);

    return (
        <Wrapper>
            <Title>
                <h4>{tag}</h4>
                <span>{run}</span>
            </Title>
            <StepSlider value={step} steps={data?.map(item => item.step) ?? []} onChange={setStep} />
            <Container fit={fit}>
                {!data && !error && <span>{t('loading')}</span>}
                {data && !error && <img src={getImageUrl(step, run, tag, data[step].wallTime)} />}
            </Container>
        </Wrapper>
    );
};

export default SampleChart;
