// @ts-nocheck
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
import Checkbox2 from '~/components/Checkbox2';
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
import {log} from 'numeric';
// import fetcher from '~/utils/fetch'
import {fetcher} from '~/utils/fetch';
// import {useRunningRequest} from '~/hooks/useRequest';

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
interface theObj {
    [key: string]: any; //动态添加属性
}
const Graph: FunctionComponent = () => {
    const {t} = useTranslation(['graph', 'common']);
    const storeDispatch = useDispatch();
    const storeModel = useSelector(selectors.graph.model);
    const graph = useRef<GraphRef>(null);
    const file = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileList | File[] | null>(storeModel);
    const [filesId, setFilesId] = useState(0);
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectResult, setSelectResult] = useState<theObj>({});
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAttributes, setShowAttributes] = useState(false);
    const [showInitializers, setShowInitializers] = useState(true);
    const [showNames, setShowNames] = useState(false);
    const [horizontal, setHorizontal] = useState(false);
    const [modelData, setModelData] = useState<Properties | null>(null);
    const [nodeData, setNodeData] = useState<Properties | null>(null);
    const [nodeDocumentation, setNodeDocumentation] = useState<Documentation | null>(null);
    const [runs, setRuns] = useState([]);
    const [selectedRuns, setSelectedRuns] = useState();
    const [modelDatas, setModelDatas] = useState();
    const [modelGraphs, setModelGraphs] = useState<OpenedResult['graphs']>([]);
    const [selectedGraph, setSelectedGraph] = useState<NonNullable<OpenedResult['selected']>>('');

    const setModelFile = useCallback(
        (f: FileList | File[]) => {
            // debugger
            storeDispatch(actions.graph.setModel(f));
            setFiles(f);
            fileUploader(f)
        },
        [storeDispatch]
    );
    const onClickFile = useCallback(() => {
        if (file.current) {
            file.current.value = '';
            file.current.click();
        }
    }, []);
    const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        // debugger
        if (target && target.files && target.files.length) {
            // setModelFile(target.files);
            // debugger
            let files = e.target.files || e.dataTransfer.files;
            // 通过FormData将文件转成二进制数据
            fileUploader(files)
        }
    };

    const fileUploader = (files:any)=>{
        let formData = new FormData();
            // 将文件转二进制
            formData.append('file', files[0]);
            formData.append('filename', files[0].name);
            console.log('formData', formData, files[0]);
            fetcher('/graph/upload', {
                method: 'POST',
                body: formData
            }).then(
                res => {
                    // debugger
                    console.log('ress', res);
                    const newFilesId = filesId + 1;
                    setFilesId(newFilesId);
                },
                res => {
                    // debugger
                    console.log('ress', res);
                    const newFilesId = filesId + 1;
                    setFilesId(newFilesId);
                }
            );
    }
    const setOpenedModel = useCallback((data: OpenedResult) => {
        setModelGraphs(data.graphs);
        setSelectedGraph(data.selected || '');
    }, []);
    const changeGraph = useCallback((name: string) => {
        setSelectedGraph(name);
        graph.current?.changeGraph(name);
    }, []);

    const onSearch = useCallback((value: string) => {
        setSearch(value);
        // graph.current?.search(value);
    }, []);
    const onSelect = useCallback((item: theObj) => {
        let name = item.name.substring(item.name.lastIndexOf('/') + 1);
        setSearch(name);
        setSelectResult(item);
    }, []);

    useEffect(() => {
        // debugger
        fetcher('/graph_runs').then(res => {
            console.log('resss', res);
            setRuns(res);
            setSelectedRuns(res[0]);
        });
    }, [filesId]);
    useEffect(() => {
        if (selectedRuns) {
            setLoading(true);
            fetcher('/graph/graph' +`?run=${selectedRuns}`).then(res => {
                console.log('resss', res);
            
                setModelDatas(res);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
            });
            // if (selectedRuns === runs[0]) {
            //     fetcher('/graph/graph2').then(res => {
            //         console.log('resss2', res);
            //         setModelDatas(res);
            //         setTimeout(() => {
            //             setLoading(false);
            //         }, 1000);
            //     });
            // } else if (selectedRuns === runs[1]) {
            //     fetcher('/graph/graph3').then(res => {
            //         console.log('resss3', res);
            //         setModelDatas(res);
            //         setTimeout(() => {
            //             setLoading(false);
            //         }, 1000);
            //     });
            // }
        }
    }, [selectedRuns]);
    useEffect(() => {
        if (modelDatas) {
            setSearch('');
            console.log('data.nodes', modelDatas.nodes);
            setSearchResult(modelDatas.nodes);
        }
    }, [modelDatas, showAttributes, showInitializers, showNames]);

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
        if (!modelDatas) {
            return null;
        }
        if (nodeDocumentation) {
            // inout 弹出框
            return (
                <Aside width={rem(360)}>
                    <NodeDocumentationSidebar data={nodeDocumentation} onClose={() => setNodeDocumentation(null)} />
                </Aside>
            );
        }
        if (nodeData) {
            // debugger
            return (
                // 属性数据框
                <Aside width={rem(360)}>
                    <NodePropertiesSidebar
                        data={nodeData}
                        onClose={() => setNodeData(null)}
                        // showNodeDocumentation={() => graph.current?.showNodeDocumentation(nodeData)}
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
                            <FullWidthButton onClick={() => graph.current?.getModelData()}>
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
                                    <Checkbox checked={showAttributes} onChange={setShowAttributes}>
                                        {t('graph:show-attributes')}
                                    </Checkbox>
                                </div>
                                <div>
                                    <Checkbox checked={showInitializers} onChange={setShowInitializers}>
                                        {t('graph:show-initializers')}
                                    </Checkbox>
                                </div>
                                <div>
                                    <Checkbox checked={showNames} onChange={setShowNames}>
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
                                    <Button onClick={() => graph.current?.toPNG()}>{t('graph:export-png')}</Button>
                                    <Button onClick={() => graph.current?.toSVG()}>{t('graph:export-svg')}</Button>
                                </ExportButtonWrapper>
                            </Field>
                        </AsideSection>
                        <AsideSection>
                            <Field label={'选择模型'}>
                                <div className="run-list">
                                    {runs.map((run, index) => (
                                        <div key={index}>
                                            <Checkbox2
                                                selectedRuns={selectedRuns}
                                                checked={selectedRuns === run ? true : false}
                                                value={run}
                                                title={run}
                                                onChange={value => {
                                                    console.log('valuess', value);
                                                    setSelectedRuns(run);
                                                }}
                                            >
                                                <span className="run-item">
                                                    {/* <i style={{backgroundColor: run.colors[0]}}></i> */}
                                                    {run}
                                                </span>
                                            </Checkbox2>
                                        </div>
                                    ))}
                                </div>
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
        modelDatas,
        nodeData,
        nodeDocumentation,
        selectedRuns
    ]);
    // 开始无数据的时候使用
    const uploader = useMemo(
        () => <Uploader onClickUpload={onClickFile} onDropFiles={setModelFile} />,
        [onClickFile, setModelFile]
    );
    console.log('runss', runs.length);
    const getNodeData = (infodata: any) => {
        setNodeData(infodata);
    };
    const getModelData = (infodata: any) => {
        setModelData(infodata);
    };
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
                        model={modelDatas}
                        selectResult={selectResult}
                        runs={runs.length}
                        uploader={uploader}
                        getNodeData={getNodeData}
                        getModelData={getModelData}
                        showAttributes={showAttributes}
                        showInitializers={showInitializers}
                        showNames={showNames}
                        horizontal={horizontal}
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
