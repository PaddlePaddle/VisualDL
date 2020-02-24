import React, {useState, useCallback, useReducer} from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import uniq from 'lodash/uniq';
import intersection from 'lodash/intersection';
import groupBy from 'lodash/groupBy';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {rem} from '~/utils/style';
import {withFetcher} from '~/utils/fetch';
import Title from '~/components/Title';
import Content from '~/components/Content';
import TagFilter from '~/components/TagFilter';
import Select, {SelectValueType} from '~/components/Select';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import RangeSlider from '~/components/RangeSlider';
import Button from '~/components/Button';
import ChartPage from '~/components/ChartPage';
import ScalarChart from '~/components/ScalarChart';
import {Tag} from '~/types';

const xAxisValues = ['step', 'relative', 'wall'];
const toolTipSortingValues = ['default', 'descending', 'ascending', 'nearest'];

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

const FullWidthRangeSlider = styled(RangeSlider)`
    width: 100%;
`;

const StyledButton = styled(Button)`
    margin-top: ${rem(40)};
    width: 100%;
    text-transform: uppercase;
`;

const groupTags = (runs: string[], tags?: Record<string, string[]>) =>
    Object.entries(
        groupBy<{label: Tag['label']; run: Tag['runs'][number]}>(
            runs
                // get tags of selected runs
                .filter(run => runs.includes(run))
                // group by runs
                .reduce((prev, run) => {
                    if (tags && tags[run]) {
                        Array.prototype.push.apply(
                            prev,
                            tags[run].map(label => ({label, run}))
                        );
                    }
                    return prev;
                }, []),
            tag => tag.label
        )
    ).map(([label, tags]) => ({label, runs: tags.map(tag => tag.run)}));

type ScalarsProps = {
    tags: Record<string, string[]>;
    runs: string[];
    selectedRuns: string[];
};

type ScalarsState = {
    runs: string[];
    tags: ReturnType<typeof groupTags>;
    filteredTags: ReturnType<typeof groupTags>;
};

enum ScalarsStateActionType {
    setRuns,
    setTags,
    setFilteredTags
}

type ScalarsStateAction = {
    type: ScalarsStateActionType;
    payload: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const Scalars: NextI18NextPage<ScalarsProps> = ({tags: propTags, runs: propRuns, selectedRuns}) => {
    const {t} = useTranslation(['scalars', 'common']);

    const {data: runs} = useSWR('/runs', {initialData: propRuns});

    const {data: tags} = useSWR('/scalars/tags', {initialData: propTags});

    const reducer = (state: ScalarsState, action: ScalarsStateAction) => {
        switch (action.type) {
            case ScalarsStateActionType.setRuns:
                const newTags = groupTags(action.payload, tags);
                return {
                    ...state,
                    runs: action.payload,
                    tags: newTags,
                    filteredTags: newTags
                };
            case ScalarsStateActionType.setTags:
                return {
                    ...state,
                    tags: action.payload,
                    filteredTags: action.payload
                };
            case ScalarsStateActionType.setFilteredTags:
                return {
                    ...state,
                    filteredTags: action.payload
                };
            default:
                throw Error();
        }
    };
    const [state, dispatch] = useReducer(reducer, {
        runs: selectedRuns,
        tags: groupTags(selectedRuns, tags),
        filteredTags: groupTags(selectedRuns, tags)
    });

    const onChangeRuns = (value: SelectValueType | SelectValueType[]) =>
        dispatch({type: ScalarsStateActionType.setRuns, payload: value as SelectValueType[]});
    const onFilterTags = (tags: Tag[]) => dispatch({type: ScalarsStateActionType.setFilteredTags, payload: tags});

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState(xAxisValues[0]);
    const onChangeXAxis = (value: SelectValueType | SelectValueType[]) => setXAxis(value as string);

    const [toolTipSorting, setTooltipSorting] = useState(toolTipSortingValues[0]);
    const onChangeTooltipSorting = (value: SelectValueType | SelectValueType[]) => setTooltipSorting(value as string);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const aside = (
        <section>
            <AsideTitle>{t('common:select-runs')}</AsideTitle>
            <StyledSelect multiple list={runs} value={state.runs} onChange={onChangeRuns}></StyledSelect>
            <Divider />
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
            <StyledButton>{t('common:running')}</StyledButton>
        </section>
    );

    const withChart = useCallback(
        (item: Tag) => <ScalarChart runs={item.runs} tag={item.label} smoothing={smoothing}></ScalarChart>,
        [smoothing]
    );

    return (
        <>
            <Title>{t('common:scalars')}</Title>
            <Content aside={aside}>
                <TagFilter tags={state.tags} onChange={onFilterTags}></TagFilter>
                <ChartPage items={state.filteredTags} withChart={withChart} />
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
