import React, {useState, useEffect, useMemo} from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import {rem, em} from '~/utils/style';
import {useTranslation} from 'react-i18next';
import Title from '~/components/Title';
import Content from '~/components/Content';
import SearchInput from '~/components/SearchInput';
import Icon from '~/components/Icon';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import RadioGroup from '~/components/RadioGroup';
import RadioButton from '~/components/RadioButton';
import RunningToggle from '~/components/RunningToggle';
import ScatterChart from '~/components/ScatterChart';
import Select, {SelectValueType} from '~/components/Select';
import AsideDivider from '~/components/AsideDivider';
import {Dimension} from '~/types';

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

const StyledScatterChart = styled(ScatterChart)`
    height: ${rem(600)};
`;

type Data = {
    embedding: ([number, number] | [number, number, number])[];
    labels: string[];
};

const HighDimensional: NextPage = () => {
    const {t} = useTranslation(['high-dimensional', 'common']);

    const {query} = useRouter();
    const queryRun = Array.isArray(query.run) ? query.run[0] : query.run;
    const {data: runs} = useSWR<string[]>('/runs');
    const selectedRun = runs?.includes(queryRun) ? queryRun : runs?.[0];

    const [run, setRun] = useState(selectedRun);
    useEffect(() => setRun(selectedRun), [setRun, selectedRun]);

    const [search, setSearch] = useState('');
    const [dimension, setDimension] = useState(dimensions[0] as Dimension);
    const [reduction, setReduction] = useState(reductions[0]);
    const [running, setRunning] = useState(true);
    const [labelVisibility, setLabelVisibility] = useState(true);

    const {data, error} = useSWR<Data>(
        `/embeddings/embeddings?run=${encodeURIComponent(run ?? '')}&dimension=${Number.parseInt(
            dimension
        )}&reduction=${reduction}`,
        {
            refreshInterval: running ? 15 * 1000 : 0
        }
    );
    const points = useMemo(() => {
        if (!data) {
            return [];
        }

        const {embedding, labels} = data;
        return embedding.map((value, i) => {
            const name = labels[i] || '';
            return {
                name,
                showing: labelVisibility,
                value
            };
        });
    }, [data, labelVisibility]);

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
                <RadioGroup value={reduction} onChange={value => setReduction(value as string)}>
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
            <Title>{t('common:high-dimensional')}</Title>
            <Content aside={aside}>
                <StyledScatterChart points={points} dimension={dimension} loading={!data && !error} keyword={search} />
            </Content>
        </>
    );
};

export default HighDimensional;
