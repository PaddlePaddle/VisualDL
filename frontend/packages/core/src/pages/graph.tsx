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
import type {Documentation, OpenedResult, Properties, SearchItem, SearchResult} from '~/resource/graph/types';
import GraphComponent, {GraphRef} from '~/components/GraphPage/Graph';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Select, {SelectProps} from '~/components/Select';
import {actions, selectors} from '~/store';
import {primaryColor, rem, size} from '~/utils/style';
import {useDispatch, useSelector} from 'react-redux';

import type {BlobResponse} from '~/utils/fetch';
import Button from '~/components/Button';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Field from '~/components/Field';
import HashLoader from 'react-spinners/HashLoader';
import ModelPropertiesDialog from '~/components/GraphPage/ModelPropertiesDialog';
import NodeDocumentationSidebar from '~/components/GraphPage/NodeDocumentationSidebar';
import NodePropertiesSidebar from '~/components/GraphPage/NodePropertiesSidebar';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import Search from '~/components/GraphPage/Search';
import Title from '~/components/Title';
import Uploader from '~/components/GraphPage/Uploader';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

const FullWidthButton = styled(Button)`
    width: 100%;
`;

const FullWidthSelect = styled<React.FunctionComponent<SelectProps<NonNullable<OpenedResult['selected']>>>>(Select)`
    width: 100%;
`;

const ExportButtonWrapper = styled.div`
    display: flex;
    justify-content: space-between;

    > * {
        flex: 1 1 auto;

        &:not(:last-child) {
            margin-right: ${rem(20)};
        }
    }
`;

// TODO: better way to auto fit height
const SearchSection = styled(AsideSection)`
    max-height: calc(100% - ${rem(40)});
    display: flex;
    flex-direction: column;

    &:not(:last-child) {
        padding-bottom: 0;
    }
`;

const Loading = styled.div`
    ${size('100%', '100%')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
    font-size: ${rem(16)};
    line-height: ${rem(60)};
`;

const Graph: FunctionComponent = () => {
    const {t} = useTranslation(['graph', 'common']);

    const storeDispatch = useDispatch();
    const storeModel = useSelector(selectors.graph.model);

    const graph = useRef<GraphRef>(null);
    const file = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileList | File[] | null>(storeModel);
    const onClickFile = useCallback(() => {
        if (file.current) {
            file.current.value = '';
            file.current.click();
        }
    }, []);
    const onChangeFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const target = e.target;
            if (target && target.files && target.files.length) {
                storeDispatch(actions.graph.setModel(target.files));
                setFiles(target.files);
            }
        },
        [storeDispatch]
    );

    const {data, loading} = useRequest<BlobResponse>(files ? null : '/graph/graph');

    useEffect(() => {
        if (data?.data.size) {
            setFiles([new File([data.data], data.filename || 'unknwon_model')]);
        }
    }, [data]);

    const [modelGraphs, setModelGraphs] = useState<OpenedResult['graphs']>([]);
    const [selectedGraph, setSelectedGraph] = useState<NonNullable<OpenedResult['selected']>>('');
    const setOpenedModel = useCallback((data: OpenedResult) => {
        setModelGraphs(data.graphs);
        setSelectedGraph(data.selected || '');
    }, []);
    const changeGraph = useCallback((name: string) => {
        setSelectedGraph(name);
        graph.current?.changeGraph(name);
    }, []);

    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<SearchResult>({text: '', result: []});
    const onSearch = useCallback((value: string) => {
        setSearch(value);
        graph.current?.search(value);
    }, []);
    const onSelect = useCallback((item: SearchItem) => {
        setSearch(item.name);
        graph.current?.select(item);
    }, []);

    const [showAttributes, setShowAttributes] = useState(false);
    const [showInitializers, setShowInitializers] = useState(true);
    const [showNames, setShowNames] = useState(false);
    const [horizontal, setHorizontal] = useState(false);

    const [modelData, setModelData] = useState<Properties | null>(null);
    const [nodeData, setNodeData] = useState<Properties | null>(null);
    const [nodeDocumentation, setNodeDocumentation] = useState<Documentation | null>(null);

    useEffect(() => {
        setSearch('');
        setSearchResult({text: '', result: []});
    }, [files, showAttributes, showInitializers, showNames]);

    const bottom = useMemo(
        () =>
            searching ? null : (
                <FullWidthButton type="primary" rounded onClick={onClickFile}>
                    {t('graph:change-model')}
                </FullWidthButton>
            ),
        [t, onClickFile, searching]
    );

    const [rendered, setRendered] = useState(false);

    const aside = useMemo(() => {
        if (!rendered || loading) {
            return null;
        }
        if (nodeDocumentation) {
            return (
                <Aside width={rem(360)}>
                    <NodeDocumentationSidebar data={nodeDocumentation} onClose={() => setNodeDocumentation(null)} />
                </Aside>
            );
        }
        if (nodeData) {
            return (
                <Aside width={rem(360)}>
                    <NodePropertiesSidebar
                        data={nodeData}
                        onClose={() => setNodeData(null)}
                        showNodeDodumentation={() => graph.current?.showNodeDocumentation(nodeData)}
                    />
                </Aside>
            );
        }
        return (
            <Aside bottom={bottom}>
                <SearchSection>
                    <Search
                        text={search}
                        data={searchResult}
                        onChange={onSearch}
                        onSelect={onSelect}
                        onActive={() => setSearching(true)}
                        onDeactive={() => setSearching(false)}
                    />
                </SearchSection>
                {!searching && (
                    <>
                        <AsideSection>
                            <FullWidthButton onClick={() => graph.current?.showModelProperties()}>
                                {t('graph:model-properties')}
                            </FullWidthButton>
                        </AsideSection>
                        {modelGraphs.length > 1 && (
                            <AsideSection>
                                <Field label={t('graph:subgraph')}>
                                    <FullWidthSelect list={modelGraphs} value={selectedGraph} onChange={changeGraph} />
                                </Field>
                            </AsideSection>
                        )}
                        <AsideSection>
                            <Field label={t('graph:display-data')}>
                                <div>
                                    <Checkbox value={showAttributes} onChange={setShowAttributes}>
                                        {t('graph:show-attributes')}
                                    </Checkbox>
                                </div>
                                <div>
                                    <Checkbox value={showInitializers} onChange={setShowInitializers}>
                                        {t('graph:show-initializers')}
                                    </Checkbox>
                                </div>
                                <div>
                                    <Checkbox value={showNames} onChange={setShowNames}>
                                        {t('graph:show-node-names')}
                                    </Checkbox>
                                </div>
                            </Field>
                        </AsideSection>
                        <AsideSection>
                            <Field label={t('graph:direction')}>
                                <RadioGroup value={horizontal} onChange={setHorizontal}>
                                    <RadioButton value={false}>{t('graph:vertical')}</RadioButton>
                                    <RadioButton value={true}>{t('graph:horizontal')}</RadioButton>
                                </RadioGroup>
                            </Field>
                        </AsideSection>
                        <AsideSection>
                            <Field label={t('graph:export-file')}>
                                <ExportButtonWrapper>
                                    <Button onClick={() => graph.current?.export('png')}>
                                        {t('graph:export-png')}
                                    </Button>
                                    <Button onClick={() => graph.current?.export('svg')}>
                                        {t('graph:export-svg')}
                                    </Button>
                                </ExportButtonWrapper>
                            </Field>
                        </AsideSection>
                    </>
                )}
            </Aside>
        );
    }, [
        t,
        bottom,
        search,
        searching,
        searchResult,
        modelGraphs,
        selectedGraph,
        changeGraph,
        onSearch,
        onSelect,
        showAttributes,
        showInitializers,
        showNames,
        horizontal,
        rendered,
        loading,
        nodeData,
        nodeDocumentation
    ]);

    const uploader = useMemo(() => <Uploader onClickUpload={onClickFile} onDropFiles={setFiles} />, [onClickFile]);

    return (
        <>
            <Title>{t('common:graph')}</Title>
            <ModelPropertiesDialog data={modelData} onClose={() => setModelData(null)} />
            <Content aside={aside}>
                {loading ? (
                    <Loading>
                        <HashLoader size="60px" color={primaryColor} />
                    </Loading>
                ) : (
                    <GraphComponent
                        ref={graph}
                        files={files}
                        uploader={uploader}
                        showAttributes={showAttributes}
                        showInitializers={showInitializers}
                        showNames={showNames}
                        horizontal={horizontal}
                        onRendered={() => setRendered(true)}
                        onOpened={setOpenedModel}
                        onSearch={data => setSearchResult(data)}
                        onShowModelProperties={data => setModelData(data)}
                        onShowNodeProperties={data => {
                            setNodeData(data);
                            setNodeDocumentation(null);
                        }}
                        onShowNodeDocumentation={data => setNodeDocumentation(data)}
                    />
                )}
                <input
                    ref={file}
                    type="file"
                    multiple={false}
                    onChange={onChangeFile}
                    style={{
                        display: 'none'
                    }}
                />
            </Content>
        </>
    );
};

export default Graph;
