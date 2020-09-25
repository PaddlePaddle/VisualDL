/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Aside, {AsideSection} from '~/components/Aside';
import type {Dimension, Reduction} from '~/resource/high-dimensional';
import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import Select, {SelectProps} from '~/components/Select';
import {em, rem} from '~/utils/style';

import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import HighDimensionalChart from '~/components/HighDimensionalPage/HighDimensionalChart';
import Icon from '~/components/Icon';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import RunningToggle from '~/components/RunningToggle';
import SearchInput from '~/components/SearchInput';
import type {TagsData} from '~/types';
import Title from '~/components/Title';
import styled from 'styled-components';
import useQuery from '~/hooks/useQuery';
import {useRunningRequest} from '~/hooks/useRequest';
import useSearchValue from '~/hooks/useSearchValue';
import {useTranslation} from 'react-i18next';

const dimensions = ['2d', '3d'];
const reductions = ['pca', 'tsne'];

const StyledSelect = styled<React.FunctionComponent<SelectProps<string>>>(Select)`
    min-width: ${em(160)};
`;

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

type Item = {
    run: string;
    tag: string;
    label: string;
};

const HighDimensional: FunctionComponent = () => {
    const {t} = useTranslation(['high-dimensional', 'common']);

    const [running, setRunning] = useState(true);

    const {data, error, loading} = useRunningRequest<TagsData>('/embedding/tags', running);

    const list = useMemo(() => {
        if (!data) {
            return [];
        }
        return data.runs.reduce<Item[]>(
            (p, run, i) => [...p, ...(data.tags[i]?.map(tag => ({run, tag, label: `${run}/${tag}`})) ?? [])],
            []
        );
    }, [data]);
    const labelList = useMemo(() => list.map(item => item.label), [list]);

    const query = useQuery();
    const selectedLabel = useMemo(() => {
        const run = Array.isArray(query.run) ? query.run[0] : query.run;
        return (run && list.find(item => item.run === run)?.label) ?? list[0]?.label;
    }, [query.run, list]);

    const [label, setLabel] = useState(selectedLabel);
    useEffect(() => setLabel(selectedLabel), [selectedLabel]);

    const selectedItem = useMemo(() => list.find(item => item.label === label) ?? {run: '', tag: '', label: ''}, [
        list,
        label
    ]);

    const [search, setSearch] = useState('');
    const debounceSearch = useSearchValue(search);
    const [dimension, setDimension] = useState(dimensions[0] as Dimension);
    const [reduction, setReduction] = useState(reductions[0] as Reduction);
    const [labelVisibility, setLabelVisibility] = useState(true);

    const bottom = useMemo(() => <RunningToggle running={running} onToggle={setRunning} />, [running, setRunning]);

    const aside = useMemo(
        () =>
            labelList.length ? (
                <Aside bottom={bottom}>
                    <AsideSection>
                        <AsideTitle>{t('common:select-runs')}</AsideTitle>
                        <StyledSelect list={labelList} value={label} onChange={setLabel} />
                    </AsideSection>
                    <AsideSection>
                        <Field>
                            <SearchInput placeholder={t('common:search')} value={search} onChange={setSearch} />
                        </Field>
                        <Field>
                            <Checkbox value={labelVisibility} onChange={setLabelVisibility}>
                                {t('high-dimensional:display-all-label')}
                            </Checkbox>
                        </Field>
                    </AsideSection>
                    <AsideSection>
                        <AsideTitle>
                            <StyledIcon type="dimension" />
                            {t('high-dimensional:dimension')}
                        </AsideTitle>
                        <Field>
                            <RadioGroup value={dimension} onChange={value => setDimension(value)}>
                                {dimensions.map(item => (
                                    <RadioButton key={item} value={item}>
                                        {t(item)}
                                    </RadioButton>
                                ))}
                            </RadioGroup>
                        </Field>
                    </AsideSection>
                    <AsideSection>
                        <AsideTitle>
                            <StyledIcon type="reduction" />
                            {t('high-dimensional:reduction-method')}
                        </AsideTitle>
                        <Field>
                            <RadioGroup value={reduction} onChange={value => setReduction(value)}>
                                {reductions.map(item => (
                                    <RadioButton key={item} value={item}>
                                        {t(item)}
                                    </RadioButton>
                                ))}
                            </RadioGroup>
                        </Field>
                    </AsideSection>
                </Aside>
            ) : null,
        [t, bottom, dimension, label, labelList, labelVisibility, reduction, search]
    );

    return (
        <>
            <Title>{t('common:high-dimensional')}</Title>
            <Content aside={aside} loading={loading}>
                {!loading && !list.length ? (
                    <Error />
                ) : error ? (
                    <div>{t('common:error')}</div>
                ) : loading ? null : (
                    <HighDimensionalChart
                        dimension={dimension}
                        keyword={debounceSearch}
                        run={selectedItem.run}
                        tag={selectedItem.tag}
                        running={running}
                        labelVisibility={labelVisibility}
                        reduction={reduction}
                    />
                )}
            </Content>
        </>
    );
};

export default HighDimensional;
