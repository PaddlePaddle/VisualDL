import {Dimension, Reduction} from '~/resource/high-dimensional';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useEffect, useState} from 'react';
import Select, {SelectValueType} from '~/components/Select';
import {em, rem} from '~/utils/style';

import AsideDivider from '~/components/AsideDivider';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Field from '~/components/Field';
import HighDimensionalChart from '~/components/HighDimensionalPage/HighDimensionalChart';
import Icon from '~/components/Icon';
import Preloader from '~/components/Preloader';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import RunningToggle from '~/components/RunningToggle';
import SearchInput from '~/components/SearchInput';
import Title from '~/components/Title';
import styled from 'styled-components';
import {useRouter} from 'next/router';
import {useRunningRequest} from '~/hooks/useRequest';
import useSearchValue from '~/hooks/useSearchValue';

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

    const [running, setRunning] = useState(true);

    const {query} = useRouter();
    const queryRun = Array.isArray(query.run) ? query.run[0] : query.run;
    const {data: runs, error, loading} = useRunningRequest<string[]>('/runs', running);
    const selectedRun = queryRun && runs?.includes(queryRun) ? queryRun : runs?.[0];

    const [run, setRun] = useState(selectedRun);
    useEffect(() => setRun(selectedRun), [setRun, selectedRun]);

    const [search, setSearch] = useState('');
    const debounceSearch = useSearchValue(search);
    const [dimension, setDimension] = useState(dimensions[0] as Dimension);
    const [reduction, setReduction] = useState(reductions[0] as Reduction);
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
                        keyword={debounceSearch}
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
