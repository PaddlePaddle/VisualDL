import React, {useState, useCallback} from 'react';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import useTagFilter from '~/hooks/useTagFilter';
import Title from '~/components/Title';
import Content from '~/components/Content';
import RunSelect from '~/components/RunSelect';
import TagFilter from '~/components/TagFilter';
import Select, {SelectValueType} from '~/components/Select';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import SmoothingSlider from '~/components/SmoothingSlider';
import RunningToggle from '~/components/RunningToggle';
import AsideDivider from '~/components/AsideDivider';
import ChartPage from '~/components/ChartPage';
import ScalarChart, {xAxisMap, sortingMethodMap} from '~/components/ScalarChart';
import {Tag} from '~/types';

type XAxis = keyof typeof xAxisMap;
const xAxisValues = ['step', 'relative', 'wall'];
type TooltiopSorting = keyof typeof sortingMethodMap;
const toolTipSortingValues = ['default', 'descending', 'ascending', 'nearest'];

const Scalars: NextI18NextPage = () => {
    const {t} = useTranslation(['scalars', 'common']);

    const {runs, tags, selectedRuns, selectedTags, onChangeRuns, onFilterTags} = useTagFilter('scalars');

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState(xAxisValues[0] as XAxis);
    const onChangeXAxis = (value: SelectValueType | SelectValueType[]) => setXAxis(value as XAxis);

    const [tooltipSorting, setTooltipSorting] = useState(toolTipSortingValues[0] as TooltiopSorting);
    const onChangeTooltipSorting = (value: SelectValueType | SelectValueType[]) =>
        setTooltipSorting(value as TooltiopSorting);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const [running, setRunning] = useState(true);

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
                ></Select>
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

    const withChart = useCallback(
        (item: Tag) => (
            <ScalarChart
                runs={item.runs}
                tag={item.label}
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
            <Title>{t('common:scalars')}</Title>
            <Content aside={aside}>
                <TagFilter tags={tags} onChange={onFilterTags} />
                <ChartPage items={selectedTags} withChart={withChart} />
            </Content>
        </>
    );
};

Scalars.getInitialProps = () => ({
    namespacesRequired: ['scalars', 'common']
});

export default Scalars;
