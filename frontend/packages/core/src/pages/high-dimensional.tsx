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
import type {
    Dimension,
    PCAResult,
    ParseParams,
    ParseResult,
    Reduction,
    Shape,
    TSNEResult,
    UMAPResult
} from '~/resource/high-dimensional';
import HighDimensionalChart, {HighDimensionalChartRef} from '~/components/HighDimensionalPage/HighDimensionalChart';
import LabelSearchInput, {LabelSearchInputProps} from '~/components/HighDimensionalPage/LabelSearchInput';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Select, {SelectProps} from '~/components/Select';

import type {BlobResponse} from '~/utils/fetch';
import BodyLoading from '~/components/BodyLoading';
import Button from '~/components/Button';
import Content from '~/components/Content';
import DimensionSwitch from '~/components/HighDimensionalPage/DimensionSwitch';
import Error from '~/components/Error';
import Field from '~/components/Field';
import LabelSearchResult from '~/components/HighDimensionalPage/LabelSearchResult';
import PCADetail from '~/components/HighDimensionalPage/PCADetail';
import ReductionTab from '~/components/HighDimensionalPage/ReductionTab';
import TSNEDetail from '~/components/HighDimensionalPage/TSNEDetail';
import Title from '~/components/Title';
import UMAPDetail from '~/components/HighDimensionalPage/UMAPDetail';
import UploadDialog from '~/components/HighDimensionalPage/UploadDialog';
import queryString from 'query-string';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import {toast} from 'react-toastify';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';
import useWorker from '~/hooks/useWorker';

const MODE = import.meta.env.MODE;

const MAX_COUNT: Record<Reduction, number | undefined> = {
    pca: 50000,
    tsne: 10000,
    umap: 5000
} as const;

const MAX_DIMENSION: Record<Reduction, number | undefined> = {
    pca: 200,
    tsne: undefined,
    umap: undefined
};

const AsideTitle = styled.div`
    font-size: ${rem(16)};
    line-height: ${rem(16)};
    font-weight: 700;
    margin-bottom: ${rem(20)};
`;

const FullWidthSelect = styled<React.FunctionComponent<SelectProps<string>>>(Select)`
    width: 100%;
`;

const FullWidthButton = styled(Button)`
    width: 100%;
`;

const HDAside = styled(Aside)`
    .secondary {
        color: var(--text-light-color);
    }
`;

const RightAside = styled(HDAside)`
    border-left: 1px solid var(--border-color);
`;

const LeftAside = styled(HDAside)`
    border-right: 1px solid var(--border-color);

    ${AsideSection} {
        border-bottom: none;
    }

    > .aside-top > .search-result {
        margin-top: 0;
        margin-left: 0;
        margin-right: 0;
        flex: auto;
        overflow: hidden auto;
    }
`;

const HDContent = styled(Content)`
    background-color: var(--background-color);
`;

type EmbeddingInfo = {
    name: string;
    shape: [number, number];
    path?: string;
};

const HighDimensional: FunctionComponent = () => {
    const {t} = useTranslation(['high-dimensional', 'common']);

    const chart = useRef<HighDimensionalChartRef>(null);

    const {data: list, loading: loadingList} = useRequest<EmbeddingInfo[]>('/embedding/list');
    const embeddingList = useMemo(() => list?.map(item => ({value: item.name, label: item.name, ...item})) ?? [], [
        list
    ]);
    const [selectedEmbeddingName, setSelectedEmbeddingName] = useState<string>();
    const selectedEmbedding = useMemo(
        () => embeddingList.find(embedding => embedding.value === selectedEmbeddingName),
        [embeddingList, selectedEmbeddingName]
    );
    useEffect(() => {
        setSelectedEmbeddingName(embeddingList[0]?.value ?? undefined);
    }, [embeddingList]);
    const {data: tensorData, loading: loadingTensor} = useRequest<BlobResponse>(
        selectedEmbeddingName ? `/embedding/tensor?${queryString.stringify({name: selectedEmbeddingName})}` : null
    );
    const {data: metadataData, loading: loadingMetadata} = useRequest<string>(
        selectedEmbeddingName ? `/embedding/metadata?${queryString.stringify({name: selectedEmbeddingName})}` : null
    );

    const [uploadModal, setUploadModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState('');
    useEffect(() => {
        if (!loading) {
            setLoadingPhase('');
        }
    }, [loading]);
    useEffect(() => {
        if (loadingPhase) {
            setLoading(true);
        }
    }, [loadingPhase]);
    useEffect(() => {
        if (loadingTensor) {
            setLoading(true);
            setLoadingPhase('fetching-tensor');
        }
    }, [loadingTensor]);
    useEffect(() => {
        if (loadingMetadata) {
            setLoading(true);
            setLoadingPhase('fetching-metadata');
        }
    }, [loadingMetadata]);

    const [vectorFile, setVectorFile] = useState<File | null>(null);
    const [metadataFile, setMetadataFile] = useState<File | null>(null);
    const changeVectorFile = useCallback((file: File) => {
        setVectorFile(file);
        setMetadataFile(null);
    }, []);
    const [vectorContent, setVectorContent] = useState('');
    const [metadataContent, setMetadataContent] = useState('');
    const [vectors, setVectors] = useState<Float32Array>(new Float32Array());
    const [labels, setLabels] = useState<string[]>([]);
    const [labelBy, setLabelBy] = useState<string>();
    const [metadata, setMetadata] = useState<string[][]>([]);
    // dimension of data
    const [dim, setDim] = useState<number>(0);
    const [rawShape, setRawShape] = useState<Shape>([0, 0]);
    const getLabelByLabels = useCallback(
        (value: string | undefined) => {
            if (value != null) {
                const labelIndex = labels.indexOf(value);
                if (labelIndex !== -1) {
                    return metadata.map(row => row[labelIndex]);
                }
            }
            return [];
        },
        [labels, metadata]
    );
    const labelByLabels = useMemo(() => getLabelByLabels(labelBy), [getLabelByLabels, labelBy]);

    // dimension of display
    const [dimension, setDimension] = useState<Dimension>('3d');
    const [reduction, setReduction] = useState<Reduction>('pca');

    const is3D = useMemo(() => dimension === '3d', [dimension]);

    const readFile = useCallback(
        (phase: string, file: File | null, setter: React.Dispatch<React.SetStateAction<string>>) => {
            if (file) {
                setLoading(true);
                setLoadingPhase(phase);
                const reader = new FileReader();
                reader.readAsText(file, 'utf-8');
                reader.onload = () => {
                    setter(content => {
                        const result = reader.result as string;
                        if (content === result) {
                            setLoading(false);
                        }
                        return result;
                    });
                };
            } else {
                setter('');
            }
        },
        []
    );
    useEffect(() => readFile('reading-vector', vectorFile, setVectorContent), [vectorFile, readFile]);
    useEffect(() => readFile('reading-metadata', metadataFile, setMetadataContent), [metadataFile, readFile]);
    useEffect(() => setVectorFile(null), [selectedEmbeddingName]);

    const showError = useCallback((e: Error) => {
        toast(e.message, {
            position: toast.POSITION.TOP_CENTER,
            type: toast.TYPE.ERROR
        });
        if (MODE !== 'production') {
            // eslint-disable-next-line no-console
            console.error(e);
        }
        setLoading(false);
    }, []);

    const params = useMemo<ParseParams>(() => {
        const maxValues = {
            maxCount: MAX_COUNT[reduction],
            maxDimension: MAX_DIMENSION[reduction]
        };
        if (vectorContent) {
            return {
                from: 'string',
                params: {
                    vectors: vectorContent,
                    metadata: metadataContent,
                    ...maxValues
                }
            };
        }
        if (selectedEmbedding && tensorData) {
            return {
                from: 'blob',
                params: {
                    shape: selectedEmbedding.shape,
                    vectors: tensorData.data,
                    metadata: metadataData ?? '',
                    ...maxValues
                }
            };
        }
        return null;
    }, [reduction, vectorContent, selectedEmbedding, tensorData, metadataContent, metadataData]);
    const result = useWorker<ParseResult, ParseParams>('high-dimensional/parse-data', params);
    useEffect(() => {
        const {error, data} = result;
        if (error) {
            showError(error);
        } else if (data) {
            setRawShape(data.rawShape);
            setDim(data.dimension);
            setVectors(data.vectors);
            setLabels(data.labels);
            setLabelBy(data.labels[0]);
            setMetadata(data.metadata);
        } else if (data !== null) {
            setLoadingPhase('parsing');
        }
    }, [result, showError]);
    const hasVector = useMemo(() => dim !== 0, [dim]);

    const dataPath = useMemo(() => (vectorFile ? vectorFile.name : selectedEmbedding?.path ?? ''), [
        vectorFile,
        selectedEmbedding
    ]);

    const [perplexity, setPerplexity] = useState(5);
    const [learningRate, setLearningRate] = useState(10);

    const [neighbors, setNeighbors] = useState(15);
    const runUMAP = useCallback((n: number) => {
        setNeighbors(n);
        chart.current?.rerunUMAP();
    }, []);

    const [data, setData] = useState<PCAResult | TSNEResult | UMAPResult>();

    const calculate = useCallback(() => {
        setData(undefined);
        setLoadingPhase('calculating');
    }, []);
    const calculated = useCallback((data: PCAResult | TSNEResult | UMAPResult) => {
        setData(data);
        setLoading(false);
    }, []);

    const [searchResult, setSearchResult] = useState<Parameters<NonNullable<LabelSearchInputProps['onChange']>>['0']>({
        labelBy: undefined,
        value: ''
    });

    const searchedResult = useMemo(() => {
        if (searchResult.labelBy == null || searchResult.value === '') {
            return {
                indices: [],
                metadata: []
            };
        }
        const labelByLabels = getLabelByLabels(searchResult.labelBy);
        const metadataResult: string[] = [];
        const vectorsIndices: number[] = [];
        for (let i = 0; i < labelByLabels.length; i++) {
            if (labelByLabels[i].includes(searchResult.value)) {
                metadataResult.push(labelByLabels[i]);
                vectorsIndices.push(i);
            }
        }
        // const vectorsResult = new Float32Array(vectorsIndices.length * dim);
        // for (let i = 0; i < vectorsIndices.length; i++) {
        //     vectorsResult.set(vectors.subarray(vectorsIndices[i] * dim, vectorsIndices[i] * dim + dim), i * dim);
        // }
        return {
            indices: vectorsIndices,
            metadata: metadataResult
        };
    }, [getLabelByLabels, searchResult.labelBy, searchResult.value]);

    const [hoveredIndices, setHoveredIndices] = useState<number[]>([]);
    const hoverSearchResult = useCallback(
        (index?: number) => setHoveredIndices(index == null ? [] : [searchedResult.indices[index]]),
        [searchedResult.indices]
    );

    const detail = useMemo(() => {
        switch (reduction) {
            case 'pca':
                return (
                    <PCADetail
                        dimension={dimension}
                        variance={(data as PCAResult)?.variance ?? []}
                        totalVariance={(data as PCAResult)?.totalVariance ?? 0}
                    />
                );
            case 'tsne':
                return (
                    <TSNEDetail
                        iteration={(data as TSNEResult)?.step ?? 0}
                        perplexity={perplexity}
                        learningRate={learningRate}
                        onChangePerplexity={setPerplexity}
                        onChangeLearningRate={setLearningRate}
                        onPause={chart.current?.pauseTSNE}
                        onResume={chart.current?.resumeTSNE}
                        onStop={chart.current?.pauseTSNE}
                        onRerun={chart.current?.rerunTSNE}
                    />
                );
            case 'umap':
                return <UMAPDetail neighbors={neighbors} onRun={runUMAP} />;
            default:
                return null as never;
        }
    }, [reduction, dimension, data, perplexity, learningRate, neighbors, runUMAP]);

    const aside = useMemo(
        () => (
            <RightAside>
                <AsideSection>
                    <AsideTitle>{t('high-dimensional:data')}</AsideTitle>
                    <Field label={t('high-dimensional:select-data')}>
                        <FullWidthSelect
                            list={embeddingList}
                            value={selectedEmbeddingName}
                            onChange={setSelectedEmbeddingName}
                        />
                    </Field>
                    <Field label={t('high-dimensional:select-label')}>
                        <FullWidthSelect list={labels} value={labelBy} onChange={setLabelBy} />
                    </Field>
                    {/* <Field label={t('high-dimensional:select-color')}>
                        <FullWidthSelect />
                    </Field> */}
                    <Field>
                        <FullWidthButton rounded outline type="primary" onClick={() => setUploadModal(true)}>
                            {t('high-dimensional:upload-data')}
                        </FullWidthButton>
                    </Field>
                    <Field>
                        {dataPath && (
                            <div className="secondary">
                                {t('high-dimensional:data-path')}
                                {t('common:colon')}
                                {dataPath}
                            </div>
                        )}
                    </Field>
                </AsideSection>
                <AsideSection>
                    <Field>
                        <ReductionTab value={reduction} onChange={setReduction} />
                    </Field>
                    <Field label={t('high-dimensional:dimension')}>
                        <DimensionSwitch value={dimension} onChange={setDimension} />
                    </Field>
                    {detail}
                </AsideSection>
            </RightAside>
        ),
        [t, dataPath, reduction, dimension, labels, labelBy, embeddingList, selectedEmbeddingName, detail]
    );

    const leftAside = useMemo(
        () => (
            <LeftAside>
                <AsideSection>
                    <Field>
                        <LabelSearchInput labels={labels} onChange={setSearchResult} />
                    </Field>
                    {searchResult.value !== '' && (
                        <Field className="secondary">
                            <span>
                                {t('high-dimensional:matched-result-count', {
                                    count: searchedResult.metadata.length
                                })}
                            </span>
                        </Field>
                    )}
                </AsideSection>
                <AsideSection className="search-result">
                    <Field>
                        <LabelSearchResult list={searchedResult.metadata} onHovered={hoverSearchResult} />
                    </Field>
                </AsideSection>
            </LeftAside>
        ),
        [hoverSearchResult, labels, searchResult.value, searchedResult.metadata, t]
    );

    return (
        <>
            <Title>{t('common:high-dimensional')}</Title>
            {loading || loadingList ? <BodyLoading>{t(`high-dimensional:loading.${loadingPhase}`)}</BodyLoading> : null}
            <HDContent aside={aside} leftAside={leftAside}>
                {hasVector ? (
                    <HighDimensionalChart
                        ref={chart}
                        vectors={vectors}
                        labels={labelByLabels}
                        shape={rawShape}
                        dim={dim}
                        is3D={is3D}
                        reduction={reduction}
                        perplexity={perplexity}
                        learningRate={learningRate}
                        neighbors={neighbors}
                        focusedIndices={hoveredIndices}
                        highlightIndices={searchedResult.indices}
                        onCalculate={calculate}
                        onCalculated={calculated}
                        onError={showError}
                    />
                ) : (
                    <Error />
                )}
                <UploadDialog
                    open={uploadModal}
                    hasVector={hasVector}
                    onClose={() => setUploadModal(false)}
                    onChangeVectorFile={changeVectorFile}
                    onChangeMetadataFile={setMetadataFile}
                />
            </HDContent>
        </>
    );
};

export default HighDimensional;
