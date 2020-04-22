import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useState} from 'react';
import Select, {SelectValueType} from '~/components/Select';
import {sortingMethodMap, xAxisMap} from '~/resource/scalars';

import AsideDivider from '~/components/AsideDivider';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Field from '~/components/Field';
import Preloader from '~/components/Preloader';
import RunSelect from '~/components/RunSelect';
import RunningToggle from '~/components/RunningToggle';
import ScalarChart from '~/components/ScalarsPage/ScalarChart';
import SmoothingSlider from '~/components/ScalarsPage/SmoothingSlider';
import {Tag} from '~/types';
import Title from '~/components/Title';
import useTagFilter from '~/hooks/useTagFilter';

type XAxis = keyof typeof xAxisMap;
const xAxisValues = ['step', 'relative', 'wall'];
type TooltipSorting = keyof typeof sortingMethodMap;
const toolTipSortingValues = ['default', 'descending', 'ascending', 'nearest'];

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
        <section>
            <RunSelect runs={runs} value={selectedRuns} onChange={onChangeRuns} />
            <AsideDivider />
            <SmoothingSlider value={smoothing} onChange={setSmoothing} />
            <Field label={t('x-axis')}>
                <Select
                    list={xAxisValues.map(value => ({label: t(`x-axis-value.${value}`), value}))}
                    value={xAxis}
                    onChange={onChangeXAxis}
                />
            </Field>
            <Field label={t('tooltip-sorting')}>
                <Select
                    list={toolTipSortingValues.map(value => ({label: t(`tooltip-sorting-value.${value}`), value}))}
                    value={tooltipSorting}
                    onChange={onChangeTooltipSorting}
                />
            </Field>
            <Field>
                <Checkbox value={ignoreOutliers} onChange={setIgnoreOutliers}>
                    {t('ignore-outliers')}
                </Checkbox>
            </Field>
            <RunningToggle running={running} onToggle={setRunning} />
        </section>
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
