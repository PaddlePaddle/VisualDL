import Aside, {AsideSection} from '~/components/Aside';
import {BlobResponse, blobFetcher} from '~/utils/fetch';
import {Documentation, Properties, SearchItem, SearchResult} from '~/resource/graphs/types';
import Graph, {GraphRef} from '~/components/GraphsPage/Graph';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {primaryColor, rem, size} from '~/utils/style';

import Button from '~/components/Button';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Field from '~/components/Field';
import HashLoader from 'react-spinners/HashLoader';
import ModelPropertiesDialog from '~/components/GraphsPage/ModelPropertiesDialog';
import NodeDocumentationSidebar from '~/components/GraphsPage/NodeDocumentationSidebar';
import NodePropertiesSidebar from '~/components/GraphsPage/NodePropertiesSidebar';
import Search from '~/components/GraphsPage/Search';
import Title from '~/components/Title';
import Uploader from '~/components/GraphsPage/Uploader';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';

const FullWidthButton = styled(Button)`
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

const Graphs: NextI18NextPage = () => {
    const {t} = useTranslation(['graphs', 'common']);

    const {data, loading} = useRequest<BlobResponse>('/graphs/graph', blobFetcher);

    const graph = useRef<GraphRef>(null);
    const file = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileList | File[] | null>(null);
    const onClickFile = useCallback(() => {
        if (file.current) {
            file.current.value = '';
            file.current.click();
        }
    }, []);
    const onChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        if (target && target.files && target.files.length) {
            setFiles(target.files);
        }
    }, []);
    useEffect(() => {
        if (data) {
            setFiles([new File([data.data], data.filename || 'unknwon_model')]);
        }
    }, [data]);

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
                    {t('graphs:change-model')}
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
                                {t('graphs:model-properties')}
                            </FullWidthButton>
                        </AsideSection>
                        <AsideSection>
                            <Field label={t('graphs:display-data')}>
                                <div>
                                    <Checkbox value={showAttributes} onChange={setShowAttributes}>
                                        {t('graphs:show-attributes')}
                                    </Checkbox>
                                </div>
                                <div>
                                    <Checkbox value={showInitializers} onChange={setShowInitializers}>
                                        {t('graphs:show-initializers')}
                                    </Checkbox>
                                </div>
                                <div>
                                    <Checkbox value={showNames} onChange={setShowNames}>
                                        {t('graphs:show-node-names')}
                                    </Checkbox>
                                </div>
                            </Field>
                        </AsideSection>
                        <AsideSection>
                            <Field label={t('graphs:export-file')}>
                                <ExportButtonWrapper>
                                    <Button onClick={() => graph.current?.export('png')}>
                                        {t('graphs:export-png')}
                                    </Button>
                                    <Button onClick={() => graph.current?.export('svg')}>
                                        {t('graphs:export-svg')}
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
        onSearch,
        onSelect,
        showAttributes,
        showInitializers,
        showNames,
        rendered,
        loading,
        nodeData,
        nodeDocumentation
    ]);

    const uploader = useMemo(() => <Uploader onClickUpload={onClickFile} onDropFiles={setFiles} />, [onClickFile]);

    return (
        <>
            <Title>{t('common:graphs')}</Title>
            <ModelPropertiesDialog data={modelData} onClose={() => setModelData(null)} />
            <Content aside={aside}>
                {loading ? (
                    <Loading>
                        <HashLoader size="60px" color={primaryColor} />
                    </Loading>
                ) : (
                    <Graph
                        ref={graph}
                        files={files}
                        uploader={uploader}
                        showAttributes={showAttributes}
                        showInitializers={showInitializers}
                        showNames={showNames}
                        onRendered={() => setRendered(true)}
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

Graphs.getInitialProps = () => ({
    namespacesRequired: ['graphs', 'common']
});

export default Graphs;
