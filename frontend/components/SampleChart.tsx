import React, {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {em, size, ellipsis, textLightColor} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
import StepSlider from '~/components/StepSlider';

const width = em(430);
const height = em(384);

const Wrapper = styled.div`
    ${size(height, width)}
    padding: ${em(20)};
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

type SampleChartProps = {
    run: string;
    tag: string;
    running?: boolean;
};

const SampleChart: FunctionComponent<SampleChartProps> = ({run, tag}) => {
    const {t} = useTranslation('samples');

    const [step, setStep] = useState(0);

    return (
        <Wrapper>
            <Title>
                <h4>{tag}</h4>
                <span>{run}</span>
            </Title>
            <StepSlider value={step} steps={[100, 200, 300, 400, 500]} onChange={setStep} />
        </Wrapper>
    );
};

export default SampleChart;
