import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useState} from 'react';
import Select, {SelectValueType} from '~/components/Select';
import {sortingMethodMap, xAxisMap} from '~/resource/scalars';

import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Field from '~/components/Field';
import Preloader from '~/components/Preloader';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import RunAside from '~/components/RunAside';
import ScalarChart from '~/components/ScalarsPage/ScalarChart';
import SmoothingSlider from '~/components/ScalarsPage/SmoothingSlider';
import {Tag} from '~/types';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import useTagFilter from '~/hooks/useTagFilter';

type XAxis = keyof typeof xAxisMap;
const xAxisValues = ['step', 'relative', 'wall'];
type TooltipSorting = keyof typeof sortingMethodMap;
const toolTipSortingValues = ['default', 'descending', 'ascending', 'nearest'];

const TooltipSortingDiv = styled.div`
    margin-top: ${rem(20)};
    display: flex;
    align-items: center;

    > :last-child {
        margin-left: ${rem(20)};
        flex-shrink: 1;
        flex-grow: 1;
    }
`;

const Scalars: NextI18NextPage = () => {
    const {t} = useTranslation(['scalars', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tags, selectedRuns, onChangeRuns, loadingRuns, loadingTags} = useTagFilter('scalars', running);

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState(xAxisValues[0] as XAxis);
    const onChangeXAxis = (value: SelectValueType | SelectValueType[]) => setXAxis(value as XAxis);

    const [tooltipSorting, setTooltipSorting] = useState(toolTipSortingValues[0] as TooltipSorting);
    const onChangeTooltipSorting = (value: SelectValueType | SelectValueType[]) =>
        setTooltipSorting(value as TooltipSorting);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const aside = (
        <RunAside
            runs={runs}
            selectedRuns={selectedRuns}
            onChangeRuns={onChangeRuns}
            running={running}
            onToggleRunning={setRunning}
        >
            <section>
                <Checkbox value={ignoreOutliers} onChange={setIgnoreOutliers}>
                    {t('ignore-outliers')}
                </Checkbox>
                <TooltipSortingDiv>
                    <span>{t('tooltip-sorting')}</span>
                    <Select
                        list={toolTipSortingValues.map(value => ({label: t(`tooltip-sorting-value.${value}`), value}))}
                        value={tooltipSorting}
                        onChange={onChangeTooltipSorting}
                    />
                </TooltipSortingDiv>
            </section>
            <section>
                <SmoothingSlider value={smoothing} onChange={setSmoothing} />
            </section>
            <section>
                <Field label={t('x-axis')}>
                    <RadioGroup value={xAxis} onChange={onChangeXAxis}>
                        {xAxisValues.map(value => (
                            <RadioButton key={value} value={value}>
                                {t(`x-axis-value.${value}`)}
                            </RadioButton>
                        ))}
                    </RadioGroup>
                </Field>
            </section>
        </RunAside>
    );

    const withChart = useCallback<WithChart<Tag>>(
        ({label, runs, ...args}) => (
            <ScalarChart
                runs={runs}
                tag={label}
                {...args}
                smoothing={smoothing}
                xAxis={xAxis}
                sortingMethod={tooltipSorting}
                outlier={ignoreOutliers}
                running={running}
            />
        ),
        [smoothing, xAxis, tooltipSorting, ignoreOutliers, running]
    );

    return (
        <>
            <Preloader url="/runs" />
            <Preloader url="/scalars/tags" />
            <Title>{t('common:scalars')}</Title>
            <Content aside={aside} loading={loadingRuns}>
                <ChartPage items={tags} withChart={withChart} loading={loadingRuns || loadingTags} />
            </Content>
        </>
    );
};

Scalars.getInitialProps = () => ({
    namespacesRequired: ['scalars', 'common']
});

export default Scalars;
