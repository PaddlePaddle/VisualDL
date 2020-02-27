import React, {useState, useCallback} from 'react';
import styled from 'styled-components';
import uniq from 'lodash/uniq';
import intersection from 'lodash/intersection';
import useTagFilter from '~/hooks/useTagFilter';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {rem} from '~/utils/style';
import {withFetcher} from '~/utils/fetch';
import Title from '~/components/Title';
import Content from '~/components/Content';
import TagFilter from '~/components/TagFilter';
import RunSelect from '~/components/RunSelect';
import Select, {SelectValueType} from '~/components/Select';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import SmoothingSlider from '~/components/SmoothingSlider';
import Button from '~/components/Button';
import ChartPage from '~/components/ChartPage';
import ScalarChart, {xAxisMap, sortingMethodMap} from '~/components/ScalarChart';
import {Tag} from '~/types';

type XAxis = keyof typeof xAxisMap;
const xAxisValues = ['step', 'relative', 'wall'];
type TooltiopSorting = keyof typeof sortingMethodMap;
const toolTipSortingValues = ['default', 'descending', 'ascending', 'nearest'];

const Divider = styled.hr<{height?: string | number}>`
    background-color: transparent;
    margin: 0;
    border: none;
    height: ${({height}) => (height ? ('number' === height ? rem(height) : height) : rem(30))};
`;

const StyledButton = styled(Button)`
    margin-top: ${rem(40)};
    width: 100%;
    text-transform: uppercase;
`;

type ScalarsProps = {
    tags: Record<string, string[]>;
    runs: string[];
    selectedRuns: string[];
};

const Scalars: NextI18NextPage<ScalarsProps> = ({tags: propTags, runs: propRuns, selectedRuns: propSelectedRuns}) => {
    const {t} = useTranslation(['scalars', 'common']);

    const {runs, tags, selectedRuns, selectedTags, onChangeRuns, onFilterTags} = useTagFilter(propSelectedRuns, {
        runs: propRuns,
        tags: propTags
    });

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState(xAxisValues[0] as XAxis);
    const onChangeXAxis = (value: SelectValueType | SelectValueType[]) => setXAxis(value as XAxis);

    const [tooltipSorting, setTooltipSorting] = useState(toolTipSortingValues[0] as TooltiopSorting);
    const onChangeTooltipSorting = (value: SelectValueType | SelectValueType[]) =>
        setTooltipSorting(value as TooltiopSorting);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const [running, setRunning] = useState(true);
    const toggleRunning = () => setRunning(r => !r);

    const aside = (
        <section>
            <RunSelect runs={runs} value={selectedRuns} onChange={onChangeRuns} />
            <Divider />
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
            <StyledButton onClick={toggleRunning}>{t(`common:${running ? 'running' : 'stopped'}`)}</StyledButton>
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

Scalars.defaultProps = {
    tags: {},
    runs: []
};

Scalars.getInitialProps = withFetcher(async ({query}, fetcher) => {
    const [runs, tags] = await Promise.all([fetcher('/runs').then(uniq), fetcher('/scalars/tags')]);
    return {
        runs: runs,
        selectedRuns: query.runs
            ? intersection(uniq(Array.isArray(query.runs) ? query.runs : query.runs.split(',')), runs)
            : runs,

        tags,
        namespacesRequired: ['scalars', 'common']
    };
});

export default Scalars;
