import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useRouter} from 'next/router';
import useRequest from '~/hooks/useRequest';
import useSearchValue from '~/hooks/useSearchValue';
import {rem, em} from '~/utils/style';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import Title from '~/components/Title';
import Content from '~/components/Content';
import SearchInput from '~/components/SearchInput';
import Icon from '~/components/Icon';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import RadioGroup from '~/components/RadioGroup';
import RadioButton from '~/components/RadioButton';
import RunningToggle from '~/components/RunningToggle';
import Select, {SelectValueType} from '~/components/Select';
import AsideDivider from '~/components/AsideDivider';
import Preloader from '~/components/Preloader';
import HighDimensionalChart from '~/components/HighDimensionalPage/HighDimensionalChart';
import {Dimension, Reduction} from '~/resource/high-dimensional';

const dimensions = ['2d', '3d'];
const reductions = ['pca', 'tsne'];

const StyledIcon = styled(Icon)`
    margin-right: ${em(4)};
    vertical-align: middle;
`;

const AsideTitle = styled.div`
    font-size: ${rem(16)};
    line-height: ${rem(16)};
    font-weight: 700;
    margin-bottom: ${rem(10)};
`;

const HighDimensional: NextI18NextPage = () => {
    const {t} = useTranslation(['high-dimensional', 'common']);

    const {query} = useRouter();
    const queryRun = Array.isArray(query.run) ? query.run[0] : query.run;
    const {data: runs, error, loading} = useRequest<string[]>('/runs');
    const selectedRun = runs?.includes(queryRun) ? queryRun : runs?.[0];

    const [run, setRun] = useState(selectedRun);
    useEffect(() => setRun(selectedRun), [setRun, selectedRun]);

    const [search, setSearch] = useState('');
    const debouncedSearch = useSearchValue(search);
    const [dimension, setDimension] = useState(dimensions[0] as Dimension);
    const [reduction, setReduction] = useState(reductions[0] as Reduction);
    const [running, setRunning] = useState(true);
    const [labelVisibility, setLabelVisibility] = useState(true);

    const aside = (
        <section>
            <AsideTitle>{t('common:select-runs')}</AsideTitle>
            <Select
                list={runs}
                value={run}
                onChange={(value: SelectValueType | SelectValueType[]) => setRun(value as string)}
            />
            <AsideDivider />
            <Field>
                <SearchInput placeholder={t('common:search')} value={search} onChange={setSearch} />
            </Field>
            <Field>
                <Checkbox value={labelVisibility} onChange={setLabelVisibility}>
                    {t('display-all-label')}
                </Checkbox>
            </Field>
            <AsideDivider />
            <AsideTitle>
                <StyledIcon type="dimension" />
                {t('dimension')}
            </AsideTitle>
            <Field>
                <RadioGroup value={dimension} onChange={value => setDimension(value as Dimension)}>
                    {dimensions.map(item => (
                        <RadioButton key={item} value={item}>
                            {t(item)}
                        </RadioButton>
                    ))}
                </RadioGroup>
            </Field>
            <AsideDivider />
            <AsideTitle>
                <StyledIcon type="reduction" />
                {t('reduction-method')}
            </AsideTitle>
            <Field>
                <RadioGroup value={reduction} onChange={value => setReduction(value as Reduction)}>
                    {reductions.map(item => (
                        <RadioButton key={item} value={item}>
                            {t(item)}
                        </RadioButton>
                    ))}
                </RadioGroup>
            </Field>
            <RunningToggle running={running} onToggle={setRunning} />
        </section>
    );

    return (
        <>
            <Preloader url="/runs" />
            <Title>{t('common:high-dimensional')}</Title>
            <Content aside={aside} loading={loading}>
                {error ? (
                    <div>{t('common:error')}</div>
                ) : loading ? null : (
                    <HighDimensionalChart
                        dimension={dimension}
                        keyword={debouncedSearch}
                        run={run ?? ''}
                        running={running}
                        labelVisibility={labelVisibility}
                        reduction={reduction}
                    />
                )}
            </Content>
        </>
    );
};

HighDimensional.getInitialProps = () => ({
    namespacesRequired: ['high-dimensional', 'common']
});

export default HighDimensional;
