import React, {useState} from 'react';
import useSWR from 'swr';
import uniq from 'lodash/uniq';
import groupBy from 'lodash/groupBy';
import intersection from 'lodash/intersection';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {styled, rem} from '~/utils/style';
import {withFetcher} from '~/utils/fetch';
import Title from '~/components/Title';
import Content from '~/components/Content';
import TagFilter from '~/components/TagFilter';
import Select, {SelectValueType} from '~/components/Select';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import RangeSlider from '~/components/RangeSlider';
import Button from '~/components/Button';

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

type ScalarsProps = {
    tags: Record<string, string[]>;
    total: number;
    runs: string[];
    selectedRuns: string[];
};

const Scalars: NextI18NextPage<ScalarsProps> = ({tags: propTags, runs: propRuns, selectedRuns, total: propTotal}) => {
    const {t} = useTranslation(['scalars', 'common']);

    const [total, setTotal] = useState(propTotal);
    const onChangeTagFilter = (value: string) => {
        setTotal(Math.floor(Math.random() * 100));
    };

    const {data: dataRuns} = useSWR('/runs', {initialData: propRuns});
    const [runs, setRuns] = useState(selectedRuns);
    const onChangeRuns = (value: SelectValueType | SelectValueType[]) => setRuns(value as string[]);

    const {data: dataTags} = useSWR('/scalars/tags', {initialData: propTags});
    const tags = Object.entries(
        groupBy<string>(
            runs
                .reduce((prev, run) => {
                    if (dataTags && dataTags[run]) {
                        Array.prototype.push.apply(prev, dataTags[run]);
                    }
                    return prev;
                }, [])
                .sort(),
            tag => tag.split('/')[0]
        )
    ).map(([label, tags]) => ({label, count: tags.length}));

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState(xAxisValues[0]);
    const onChangeXAxis = (value: SelectValueType | SelectValueType[]) => setXAxis(value as string);

    const [toolTipSorting, setTooltipSorting] = useState(toolTipSortingValues[0]);
    const onChangeTooltipSorting = (value: SelectValueType | SelectValueType[]) => setTooltipSorting(value as string);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const aside = (
        <section>
            <AsideTitle>{t('common:select-runs')}</AsideTitle>
            <StyledSelect multiple list={dataRuns} value={runs} onChange={onChangeRuns}></StyledSelect>
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

    return (
        <>
            <Title>{t('common:scalars')}</Title>
            <Content aside={aside}>
                <TagFilter tags={tags} total={total} onChange={onChangeTagFilter}></TagFilter>
            </Content>
        </>
    );
};

Scalars.defaultProps = {
    tags: {},
    runs: [],
    total: 0
};

Scalars.getInitialProps = withFetcher(async ({query}, fetcher) => {
    const [runs, tags] = await Promise.all([fetcher('/runs').then(uniq), fetcher('/scalars/tags')]);
    return {
        runs: runs,
        selectedRuns: query.runs
            ? intersection(uniq(Array.isArray(query.runs) ? query.runs : query.runs.split(',')), runs)
            : runs,

        tags,
        total: 123,
        namespacesRequired: ['scalars', 'common']
    };
});

export default Scalars;
