import React, {useState} from 'react';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {styled, rem, em} from '~/utils/style';
import {Tag} from '~/types';
import Title from '~/components/Title';
import Content from '~/components/Content';
import TagFilter from '~/components/TagFilter';
import Select, {SelectValueType} from '~/components/Select';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import Icon from '~/components/Icon';
import RangeSlider from '~/components/RangeSlider';
import Button from '~/components/Button';

const xAxisValues = ['step', 'relative', 'wall'];
const toolTipSortingValues = ['default', 'descending', 'ascending', 'nearest'];
const modeValues = ['overlay', 'offset'];

const AsideTitle = styled.h3`
    font-size: ${rem(16)};
    line-height: ${rem(16)};
    margin-bottom: ${rem(10)};
`;

const StyledSelect = styled(Select)`
    width: ${rem(160)};
`;

const Divider = styled.hr<{height?: string | number}>`
    background-color: transparent;
    margin: 0;
    border: none;
    height: ${({height}) => (height ? ('number' === height ? rem(height) : height) : rem(30))};
`;

const StyledIcon = styled(Icon)`
    font-size: ${rem(16)};
    margin-left: ${em(6)};
    margin-right: ${em(4)};
    vertical-align: middle;
`;

const CheckboxTitle = styled.span`
    font-size: ${rem(16)};
    font-weight: 700;
    vertical-align: text-top;
`;

const FullWidthRangeSlider = styled(RangeSlider)`
    width: 100%;
`;

const StyledButton = styled(Button)`
    margin-top: ${rem(40)};
    width: 100%;
    text-transform: uppercase;
`;

type MetricsProps = {
    tags: Tag[];
    total: number;
    runs: string[];
};

const Metrics: NextI18NextPage<MetricsProps> = ({tags, runs: propRuns, total: propTotal}) => {
    const {t} = useTranslation(['metrics', 'common']);

    const [total, setTotal] = useState(propTotal);
    const onChangeTagFilter = (value: string) => {
        setTotal(Math.floor(Math.random() * 100));
    };

    const [runs, setRuns] = useState(propRuns);
    const onChangeRuns = (value: SelectValueType | SelectValueType[]) => setRuns(value as string[]);

    const [scalar, setScalar] = useState(true);

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState(xAxisValues[0]);
    const onChangeXAxis = (value: SelectValueType | SelectValueType[]) => setXAxis(value as string);

    const [toolTipSorting, setTooltipSorting] = useState(toolTipSortingValues[0]);
    const onChangeTooltipSorting = (value: SelectValueType | SelectValueType[]) => setTooltipSorting(value as string);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const [histogram, setHistogram] = useState(true);

    const [mode, setMode] = useState(modeValues[0]);
    const onChangeMode = (value: SelectValueType | SelectValueType[]) => setMode(value as string);

    const aside = (
        <section>
            <AsideTitle>{t('common:select-runs')}</AsideTitle>
            <StyledSelect multiple list={propRuns} onChange={onChangeRuns}></StyledSelect>
            <Divider />
            <Field>
                <Checkbox value={scalar} onChange={setScalar}>
                    <StyledIcon type="scalar" />
                    <CheckboxTitle>{t('scalar')}</CheckboxTitle>
                </Checkbox>
            </Field>
            <Field label={`${t('smoothing')}: ${Math.round(smoothing * 100) / 100}`}>
                <FullWidthRangeSlider min={0} max={0.99} step={0.01} value={smoothing} onChange={setSmoothing} />
            </Field>
            <Field label={t('x-axis')}>
                <StyledSelect
                    list={xAxisValues.map(value => ({label: t(`x-axis-value.${value}`), value}))}
                    value={xAxis}
                    onChange={onChangeXAxis}
                ></StyledSelect>
            </Field>
            <Field label={t('tooltip-sorting')}>
                <StyledSelect
                    list={toolTipSortingValues.map(value => ({label: t(`tooltip-sorting-value.${value}`), value}))}
                    value={toolTipSorting}
                    onChange={onChangeTooltipSorting}
                ></StyledSelect>
            </Field>
            <Field>
                <Checkbox value={ignoreOutliers} onChange={setIgnoreOutliers}>
                    {t('ignore-outliers')}
                </Checkbox>
            </Field>
            <Divider />
            <Field>
                <Checkbox value={histogram} onChange={setHistogram}>
                    <StyledIcon type="histogram" />
                    <CheckboxTitle>{t('histogram')}</CheckboxTitle>
                </Checkbox>
            </Field>
            <Field label={t('mode')}>
                <StyledSelect
                    list={modeValues.map(value => ({label: t(`mode-value.${value}`), value}))}
                    value={mode}
                    onChange={onChangeMode}
                ></StyledSelect>
            </Field>
            <StyledButton>{t('common:start-running')}</StyledButton>
        </section>
    );

    return (
        <>
            <Title>{t('common:metrics')}</Title>
            <Content aside={aside}>
                <TagFilter tags={tags} total={total} onChange={onChangeTagFilter}></TagFilter>
            </Content>
        </>
    );
};

Metrics.getInitialProps = () => {
    return {
        namespacesRequired: ['metrics', 'common'],
        tags: [
            {label: 'test', count: 12},
            {label: 'asdfa', count: 2}
        ],
        runs: ['123', '456', '789'],
        total: 123
    };
};

export default Metrics;
