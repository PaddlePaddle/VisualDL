/* eslint-disable react-hooks/exhaustive-deps */
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
import GraphComponent, {GraphRef} from '~/components/GraphPage/GraphStatic3';
import React, {useImperativeHandle, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Select, {SelectProps} from '~/components/Select';
import {actions} from '~/store';
import {primaryColor, rem, size} from '~/utils/style';
import {useDispatch} from 'react-redux';
import XpaddleUploader from '~/components/Onnx2PaddleUpload';
import Paddle2OnnxUpload from '~/components/Paddle2OnnxUpload';

import type {BlobResponse} from '~/utils/fetch';
import Buttons from '~/components/Button';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/ContentXpaddle';
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

const FullWidthButton = styled(Buttons)`
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
type GraphProps = {
    changeName: (name: string) => void;
    changeFlags: (flag: boolean) => void;
    changeFiles2?: (file: any) => void;
    show?: boolean;
    changeshowdata?: () => void;
    downloadEvent?: (baseId: number, fileName: string) => void;
    changeLoading?: (value: any) => void;
    Xpaddlae?: boolean;
    ModelValue?: number;
};
type pageRef = {
    files: FileList | File[] | null;
    setnewfiles: () => void;
    setNodeDocumentations: () => void;
};
const Graph = React.forwardRef<pageRef, GraphProps>(
    (
        {
            changeName,
            changeshowdata,
            Xpaddlae,
            show = true,
            changeFlags,
            changeLoading,
            changeFiles2,
            downloadEvent,
            ModelValue
        },
        ref
    ) => {
        const {t} = useTranslation(['graph', 'common']);

        const storeDispatch = useDispatch();
        // const storeModel = useSelector(selectors.graph.model);

        const graph = useRef<GraphRef>(null);
        const file = useRef<HTMLInputElement>(null);
        const [files, setFiles] = useState<any>();
        const setModelFile = useCallback(
            (f: FileList | File[]) => {
                storeDispatch(actions.graph.setModel(f));
                const name = f[0].name.substring(f[0].name.lastIndexOf('.') + 1);
                changeName && changeName(name);
                setFiles(f);
                changeFlags(true);
                changeshowdata && changeshowdata();
            },
            [storeDispatch]
        );
        const newsetfiles = (f: FileList | File[]) => {
            // changeFlags(false);
            setRendered(false);
            setFiles(f);
        };
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
                    setModelFile(target.files);
                }
            },
            [setModelFile]
        );

        // const {data, loading} = useRequest<BlobResponse>(files ? null : '/graph/static_graph');

        // useEffect(() => {
        //     if (data?.data?.size) {
        //         setFiles([new File([data.data], data.filename || 'unknown_model')]);
        //     }
        // }, [data]);
        const {loading} = useRequest<BlobResponse>(files ? null : '/graph/graph');

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
        const [renderedflag3, setRenderedflag3] = useState(true);
        const [rendered, setRendered] = useState(false);
        useEffect(() => {
            setSearch('');
            setSearchResult({text: '', result: []});
        }, [files, showAttributes, showInitializers, showNames]);
        useEffect(() => {
            if (!show) {
                setRenderedflag3(false);
            } else {
                setRenderedflag3(true);
                setNodeData(null);
            }
        }, [show]);
        useEffect(() => {
            setFiles(undefined);
        }, [ModelValue]);
        // useEffect(() => {
        //     if (nodeData && renderedflag3) {
        //         debugger;
        //         changeFlags(false);
        //     }
        // }, [nodeData, renderedflag3]);
        useEffect(() => {
            if (rendered) {
                // debugger;
                // if ()
                changeFlags(true);
                changeLoading && changeLoading(false);
            }
        }, [rendered]);
        const bottom = useMemo(
            () =>
                searching ? null : (
                    <FullWidthButton type="primary" rounded onClick={onClickFile}>
                        {t('graph:change-model')}
                    </FullWidthButton>
                ),
            [t, onClickFile, searching]
        );

        useImperativeHandle(ref, () => ({
            files,
            setnewfiles: () => {
                // debugger;
                setFiles(undefined);
            },
            setNodeDocumentations: () => {
                setRenderedflag3(false);
            }
        }));
        const aside = useMemo(() => {
            if (!rendered || loading) {
                return null;
            }
            if (nodeDocumentation) {
                return (
                    <Aside width={rem(360)}>
                        <NodeDocumentationSidebar
                            data={nodeDocumentation}
                            onClose={() => {
                                changeFlags(true);
                                setNodeDocumentation(null);
                            }}
                        />
                    </Aside>
                );
            }
            console.log('nodeData && renderedflag3', nodeData, renderedflag3);
            if (nodeData && renderedflag3) {
                return (
                    <Aside width={rem(360)}>
                        <NodePropertiesSidebar
                            data={nodeData}
                            onClose={() => {
                                changeFlags(true);
                                setNodeData(null);
                            }}
                            showNodeDocumentation={() => graph.current?.showNodeDocumentation(nodeData)}
                        />
                    </Aside>
                );
            }
            return (
                // <Aside bottom={bottom}>

                <Aside>
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
                                        <FullWidthSelect
                                            list={modelGraphs}
                                            value={selectedGraph}
                                            onChange={changeGraph}
                                        />
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
                                        <Buttons onClick={() => graph.current?.export('png')}>
                                            {t('graph:export-png')}
                                        </Buttons>
                                        <Buttons onClick={() => graph.current?.export('svg')}>
                                            {t('graph:export-svg')}
                                        </Buttons>
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
            nodeDocumentation,
            renderedflag3
        ]);
        // const uploader = useMemo(
        //     () => <Uploader onClickUpload={onClickFile} onDropFiles={setModelFile} Xpaddlae={Xpaddlae} />,
        //     [onClickFile, setModelFile]
        // );
        // const buttonItemLayout = formLayout === 'horizontal' ? {wrapperCol: {span: 14, offset: 4}} : null;
        const uploader = useMemo(() => {
            if (ModelValue === 1) {
                return (
                    <Paddle2OnnxUpload
                        changeLoading={changeLoading}
                        downloadEvent={downloadEvent}
                        setFiles={newsetfiles}
                        changeFiles2={changeFiles2}
                    ></Paddle2OnnxUpload>
                );
            } else {
                return (
                    <XpaddleUploader
                        changeLoading={changeLoading}
                        downloadEvent={downloadEvent}
                        setFiles={newsetfiles}
                        changeFiles2={changeFiles2}
                    ></XpaddleUploader>
                );
            }
        }, [ModelValue]);
        const flags = files && show;
        console.log('flags', flags, aside);
        const nodeShows = (nodeData && renderedflag3) || nodeDocumentation;
        const nodeShow = nodeShows ? true : false;
        return (
            <>
                <Title>{t('common:graph')}</Title>
                <ModelPropertiesDialog data={modelData} onClose={() => setModelData(null)} />
                <Content show={show} nodeShow={nodeShow} aside={flags ? aside : null}>
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
                            onRendered={flag => setRendered(flag)}
                            onOpened={setOpenedModel}
                            onSearch={data => {
                                setSearchResult(data);
                            }}
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
    }
);

export default Graph;
