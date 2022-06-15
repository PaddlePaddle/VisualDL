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

import type {Documentation, OpenedResult, Properties, SearchItem, SearchResult} from '~/resource/graph/types';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {contentHeight, position, primaryColor, rem, size, transitionProps} from '~/utils/style';
import ChartToolbox from '~/components/ChartToolbox';
import HashLoader from 'react-spinners/HashLoader';
import logo from '~/assets/images/netron.png';
import netron from '@visualdl/netron';
import styled from 'styled-components';
import {toast} from 'react-toastify';
import {fetcher} from '~/utils/fetch';
import useTheme from '~/hooks/useTheme';
import {useTranslation} from 'react-i18next';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

let IFRAME_HOST = `${window.location.protocol}//${window.location.host}`;
if (PUBLIC_PATH.startsWith('http')) {
    const url = new URL(PUBLIC_PATH);
    IFRAME_HOST = `${url.protocol}//${url.host}`;
}

const toolboxHeight = rem(40);

const Wrapper = styled.div`
    position: relative;
    height: ${contentHeight};
    background-color: var(--background-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    ${transitionProps('background-color')}
`;

const RenderContent = styled.div<{show: boolean}>`
    position: absolute;
    top: 0;
    left: 0;
    ${size('100%', '100%')}
    opacity: ${props => (props.show ? 1 : 0)};
    z-index: ${props => (props.show ? 0 : -1)};
    pointer-events: ${props => (props.show ? 'auto' : 'none')};
`;

const Toolbox = styled(ChartToolbox)`
    height: ${toolboxHeight};
    border-bottom: 1px solid var(--border-color);
    padding: 0 ${rem(20)};
    ${transitionProps('border-color')}
`;

const Content = styled.div`
    position: relative;
    height: calc(100% - ${toolboxHeight});

    > iframe {
        ${size('100%', '100%')}
        border: none;
    }

    > .powered-by {
        display: block;
        ${position('absolute', null, null, rem(20), rem(30))}
        color: var(--graph-copyright-color);
        font-size: ${rem(14)};
        user-select: none;

        img {
            height: 1em;
            filter: var(--graph-copyright-logo-filter);
            vertical-align: middle;
        }
    }
    .small-position {
        width: ${rem(300)};
        width: ${rem(200)};
        position: absolute;
        right: 0%;
        bottom: 0%;
        .small-container {
            position: relative;
            .inside-box {
                background-color: #5b88f1;
                position: absolute;
                opacity: 0.3;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                z-index: 200;
                cursor: move;
            }
        }
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

export type GraphRef = {
    export(type: 'svg' | 'png'): void;
    changeGraph(name: string): void;
    search(value: string): void;
    select(item: SearchItem): void;
    setSelectItems(data: any): void;
    setLoadings(data: any): void;
    showModelProperties(): void;
    showNodeDocumentation(data: any): void;
};

type GraphProps = {
    files: FileList | File[] | null;
    uploader: JSX.Element;
    showAttributes: boolean;
    showInitializers: boolean;
    showNames: boolean;
    horizontal: boolean;
    isKeepData: boolean;
    runs: any;
    selectedRuns: any;
    onRendered?: () => unknown;
    onOpened?: (data: OpenedResult) => unknown;
    onSearch?: (data: SearchResult) => unknown;
    onShowModelProperties?: (data: Properties) => unknown;
    onShowNodeProperties?: (data: Properties) => unknown;
    onShowNodeDocumentation?: (data: Documentation) => unknown;
};

const Graph = React.forwardRef<GraphRef, GraphProps>(
    (
        {
            uploader,
            showAttributes,
            runs,
            selectedRuns,
            isKeepData,
            showInitializers,
            showNames,
            horizontal,
            onRendered,
            onOpened,
            onSearch,
            onShowModelProperties,
            onShowNodeProperties,
            onShowNodeDocumentation
        },
        ref
    ) => {
        const {t} = useTranslation('graph');
        const theme = useTheme();
        const [ready, setReady] = useState(false);
        const [rendered, setRendered] = useState(false);
        const [loading, setLoading] = useState(true);
        const [item, setSelectItem] = useState<any>();
        const [isExpend, setIsExpend] = useState(0);
        const [isRetract, setIsretract] = useState(0);
        const [modelDatas, setModelDatas] = useState();
        const [allModelDatas, setAllModelDatas] = useState();
        const [selectNodeId, setSelectNodeId] = useState();
        const [searchNodeId, setSearchNodeId] = useState<any>();
        const iframe = useRef<HTMLIFrameElement>(null);
        const handler = useCallback(
            (event: MessageEvent) => {
                if (event.data) {
                    const {type, data} = event.data;
                    switch (type) {
                        case 'status':
                            switch (data) {
                                case 'ready':
                                    return setReady(true);
                                case 'loading':
                                    // return setLoading(true);
                                    return 1;
                                case 'rendered':
                                    setLoading(false);
                                    setRendered(true);
                                    // changeSvg()
                                    onRendered?.();
                                    return;
                            }
                            return;
                        case 'opened':
                            return onOpened?.(data);
                        case 'search':
                            return onSearch?.(data);
                        case 'cancel':
                            return setLoading(false);
                        case 'error':
                            toast.error(data);
                            setLoading(false);
                            return;
                        case 'show-model-properties':
                            return onShowModelProperties?.(data);
                        case 'show-node-properties':
                            return onShowNodeProperties?.(data);
                        case 'show-node-documentation':
                            return onShowNodeDocumentation?.(data);
                        case 'nodeId':
                            return setSelectNodeId?.(data);
                        case 'selectItem':
                            return setSelectItem?.(data);
                    }
                }
            },
            [onRendered, onOpened, onSearch, onShowModelProperties, onShowNodeProperties, onShowNodeDocumentation]
        );
        const dispatch = useCallback((type: string, data?: unknown) => {
            iframe.current?.contentWindow?.postMessage(
                {
                    type,
                    data
                },
                IFRAME_HOST
            );
        }, []);
        useEffect(() => {
            window.addEventListener('message', handler);
            dispatch('ready');
            return () => {
                window.removeEventListener('message', handler);
            };
        }, [handler, dispatch]);
        useEffect(() => {
            if (selectedRuns) {
                setLoading(true);
                const refresh = true;
                const expand_all = false;
                let ModelDatas: any = '';
                let AllModelDatas: any = '';
                // fetcher(
                //     '/graph/graph' + `?run=${selectedRuns}` + `&refresh=${refresh}` + `&expand_all=${expand_all}`
                // ).then((res: any) => {
                //     ModelDatas = res;
                //     fetcher('/graph/get_all_nodes' + `?run=${selectedRuns}`).then((res: any) => {
                //         setSelectItem(null);
                //         AllModelDatas = res;
                //         setModelDatas(ModelDatas);
                //         setAllModelDatas(AllModelDatas);
                //     });
                // });
                if (selectedRuns === runs[0]) {
                    fetcher('/graph/graph').then((res: any) => {
                        setModelDatas(res);
                        setAllModelDatas(res);
                    });
                }
            }
        }, [selectedRuns]);
        useEffect(() => {
            if (isExpend) {
                // debugger
                setLoading(true);
                const refresh = false;
                const expand_all = true;
                fetcher(
                    '/graph/graph' + `?run=${selectedRuns}` + `&refresh=${refresh}` + `&expand_all=${expand_all}`
                ).then((res: any) => {
                    setSelectItem(null);
                    setModelDatas(res);
                });
            }
        }, [isExpend]);
        useEffect(() => {
            if (isRetract) {
                // debugger
                setLoading(true);
                const refresh = true;
                const expand_all = false;
                fetcher(
                    '/graph/graph' + `?run=${selectedRuns}` + `&refresh=${refresh}` + `&expand_all=${expand_all}`
                ).then((res: any) => {
                    setSelectItem(null);
                    setModelDatas(res);
                });
            }
        }, [isRetract]);
        useEffect(() => {
            if (ready) {
                dispatch('change-select', item);
            }
        }, [dispatch, item, ready]);
        useEffect(() => {
            if (!allModelDatas) {
                return;
            }
            if (ready) {
                dispatch('change-allGraph', allModelDatas);
            }
        }, [dispatch, allModelDatas, ready]);
        useEffect(() => {
            if (!modelDatas) {
                return;
            }
            // debugger
            if (ready) {
                dispatch('change-graph', modelDatas);
            }
        }, [dispatch, modelDatas, ready]);
        useEffect(() => {
            if (!selectNodeId) {
                return;
            }
            // debugger;
            setLoading(true);
            const selectNodeIds: any = selectNodeId;
            fetcher(
                '/graph/manipulate' +
                    `?run=${selectedRuns}` +
                    `&nodeid=${selectNodeIds.nodeId}` +
                    `&expand=${selectNodeIds.expand}` +
                    `&keep_state=${isKeepData}`
            ).then((res: any) => {
                setModelDatas(res);
            });
        }, [selectNodeId]);
        useEffect(() => {
            if (!searchNodeId) {
                return;
            }
            // debugger
            setLoading(true);
            const searchNodeIds: any = searchNodeId;
            const is_node = searchNodeIds.type === 'node' ? true : false;
            fetcher(
                '/graph/search' +
                    `?run=${selectedRuns}` +
                    `&nodeid=${searchNodeIds.name}` +
                    `&keep_state=${isKeepData}` +
                    `&is_node=${is_node}`
            ).then((res: any) => {
                setModelDatas(res);
            });
        }, [searchNodeId]);
        useEffect(
            () => (ready && dispatch('toggle-attributes', showAttributes)) || undefined,
            [dispatch, showAttributes, ready]
        );
        useEffect(
            () => (ready && dispatch('toggle-initializers', showInitializers)) || undefined,
            [dispatch, showInitializers, ready]
        );
        useEffect(() => (ready && dispatch('toggle-names', showNames)) || undefined, [dispatch, showNames, ready]);
        useEffect(
            () => (ready && dispatch('toggle-direction', horizontal)) || undefined,
            [dispatch, horizontal, ready]
        );

        useEffect(() => (ready && dispatch('toggle-theme', theme)) || undefined, [dispatch, theme, ready]);
        useImperativeHandle(ref, () => ({
            export(type) {
                dispatch('export', type);
            },
            changeGraph(name) {
                dispatch('change-graph', name);
            },
            search(value) {
                dispatch('search', value);
            },
            setSelectItems(data: any) {
                setSelectItem(data);
            },
            setLoadings(data: any) {
                setLoading(data);
            },
            select(item) {
                let a = document.querySelector('iframe') as HTMLIFrameElement;
                let documents = a.contentWindow?.document as Document;
                if (item.type === 'node') {
                    for (const node of documents.getElementsByClassName('cluster')) {
                        if (node.getAttribute('id') === `node-${item.name}`) {
                            dispatch('select', item);
                            return;
                        }
                    }
                    for (const node of documents.getElementsByClassName('node')) {
                        if (node.getAttribute('id') === `node-${item.name}`) {
                            dispatch('select', item);
                            return;
                        }
                    }
                } else if (item.type === 'input') {
                    for (const node of documents.getElementsByClassName('edge-path')) {
                        if (node.getAttribute('id') === `edge-${item.name}`) {
                            dispatch('select', item);
                            return;
                        }
                    }
                }
                setSelectItem(item);
                setSearchNodeId(item);
            },
            showModelProperties() {
                dispatch('show-model-properties');
            },
            showNodeDocumentation(data) {
                dispatch('show-node-documentation', data);
            }
        }));
        const content = useMemo(() => {
            if (loading) {
                return (
                    <Loading>
                        <HashLoader size="60px" color={primaryColor} />
                    </Loading>
                );
            }
            return null;
        }, [loading]);
        const uploaderContent = useMemo(() => {
            if (!runs && !loading) {
                return uploader;
            }
        }, [runs, loading, uploader]);
        const svgContent = useMemo(() => {
            return (
                <Content>
                    <iframe
                        ref={iframe}
                        src={PUBLIC_PATH + netron}
                        frameBorder={0}
                        scrolling="yes"
                        marginWidth={0}
                        marginHeight={0}
                    ></iframe>
                    <a
                        className="powered-by"
                        href="https://github.com/lutzroeder/netron"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Powered by <img src={PUBLIC_PATH + logo} alt="netron" />
                    </a>
                </Content>
            );
        }, [rendered]);
        return (
            <Wrapper>
                {content}
                {uploaderContent}
                <RenderContent show={!loading && rendered}>
                    <Toolbox
                        items={[
                            {
                                icon: 'zoom-in',
                                tooltip: t('graph:zoom-in'),
                                onClick: () => dispatch('zoom-in')
                            },
                            {
                                icon: 'zoom-out',
                                tooltip: t('graph:zoom-out'),
                                onClick: () => dispatch('zoom-out')
                            },
                            {
                                icon: 'restore-size',
                                tooltip: t('expend-size'),
                                onClick: () => {
                                    const id = isExpend + 1;
                                    setIsExpend(id);
                                }
                            },
                            {
                                icon: 'shrink',
                                tooltip: t('restore-size'),
                                onClick: () => {
                                    const id = isRetract + 1;
                                    setIsretract(id);
                                }
                            }
                        ]}
                        reversed
                        tooltipPlacement="bottom"
                    />
                    {svgContent}
                </RenderContent>
            </Wrapper>
        );
    }
);

Graph.displayName = 'Graph';

export default Graph;
