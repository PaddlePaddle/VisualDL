import type {Documentation, Properties, SearchItem, SearchResult} from '~/resource/graph/types';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {backgroundColor, borderColor, contentHeight, position, primaryColor, rem, size} from '~/utils/style';

import ChartToolbox from '~/components/ChartToolbox';
import HashLoader from 'react-spinners/HashLoader';
import logo from '~/assets/images/netron.png';
import styled from 'styled-components';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const toolboxHeight = rem(40);

const Wrapper = styled.div`
    position: relative;
    height: ${contentHeight};
    background-color: ${backgroundColor};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
    border-bottom: 1px solid ${borderColor};
    padding: 0 ${rem(20)};
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
        color: #ddd;
        font-size: ${rem(14)};
        user-select: none;

        img {
            height: 1em;
            opacity: 0.5;
            vertical-align: middle;
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
    search(value: string): void;
    select(item: SearchItem): void;
    showModelProperties(): void;
    showNodeDocumentation: (data: Properties) => void;
};

type GraphProps = {
    files: FileList | File[] | null;
    uploader: JSX.Element;
    showAttributes: boolean;
    showInitializers: boolean;
    showNames: boolean;
    horizontal: boolean;
    onRendered?: () => unknown;
    onSearch?: (data: SearchResult) => unknown;
    onShowModelProperties?: (data: Properties) => unknown;
    onShowNodeProperties?: (data: Properties) => unknown;
    onShowNodeDocumentation?: (data: Documentation) => unknown;
};

const Graph = React.forwardRef<GraphRef, GraphProps>(
    (
        {
            files,
            uploader,
            showAttributes,
            showInitializers,
            showNames,
            horizontal,
            onRendered,
            onSearch,
            onShowModelProperties,
            onShowNodeProperties,
            onShowNodeDocumentation
        },
        ref
    ) => {
        const {t} = useTranslation('graph');

        const [ready, setReady] = useState(false);
        const [loading, setLoading] = useState(false);
        const [rendered, setRendered] = useState(false);

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
                                    return setLoading(true);
                                case 'rendered':
                                    setLoading(false);
                                    setRendered(true);
                                    onRendered?.();
                                    return;
                            }
                            return;
                        case 'search':
                            return onSearch?.(data);
                        case 'cancel':
                            return setLoading(false);
                        case 'error':
                            toast(data);
                            setLoading(false);
                            return;
                        case 'show-model-properties':
                            return onShowModelProperties?.(data);
                        case 'show-node-properties':
                            return onShowNodeProperties?.(data);
                        case 'show-node-documentation':
                            return onShowNodeDocumentation?.(data);
                    }
                }
            },
            [onRendered, onSearch, onShowModelProperties, onShowNodeProperties, onShowNodeDocumentation]
        );
        const dispatch = useCallback((type: string, data?: unknown) => {
            iframe.current?.contentWindow?.postMessage(
                {
                    type,
                    data
                },
                `${window.location.protocol}//${window.location.host}`
            );
        }, []);
        useEffect(() => {
            window.addEventListener('message', handler);
            dispatch('ready');
            return () => {
                window.removeEventListener('message', handler);
            };
        }, [handler, dispatch]);

        useEffect(() => (ready && dispatch('change-files', files)) || undefined, [dispatch, files, ready]);
        useEffect(() => (ready && dispatch('toggle-attributes', showAttributes)) || undefined, [
            dispatch,
            showAttributes,
            ready
        ]);
        useEffect(() => (ready && dispatch('toggle-initializers', showInitializers)) || undefined, [
            dispatch,
            showInitializers,
            ready
        ]);
        useEffect(() => (ready && dispatch('toggle-names', showNames)) || undefined, [dispatch, showNames, ready]);
        useEffect(() => (ready && dispatch('toggle-direction', horizontal)) || undefined, [
            dispatch,
            horizontal,
            ready
        ]);

        useImperativeHandle(ref, () => ({
            export(type) {
                dispatch('export', type);
            },
            search(value) {
                dispatch('search', value);
            },
            select(item) {
                dispatch('select', item);
            },
            showModelProperties() {
                dispatch('show-model-properties');
            },
            showNodeDocumentation(data) {
                dispatch('show-node-documentation', data);
            }
        }));

        const content = useMemo(() => {
            if (!ready || loading) {
                return (
                    <Loading>
                        <HashLoader size="60px" color={primaryColor} />
                    </Loading>
                );
            }
            if (ready && !rendered) {
                return uploader;
            }
            return null;
        }, [ready, loading, rendered, uploader]);

        return (
            <Wrapper>
                {content}
                <RenderContent show={!loading && rendered}>
                    <Toolbox
                        items={[
                            {
                                icon: 'restore-size',
                                tooltip: t('graph:restore-size'),
                                onClick: () => dispatch('zoom-reset')
                            },
                            {
                                icon: 'zoom-out',
                                tooltip: t('graph:zoom-out'),
                                onClick: () => dispatch('zoom-out')
                            },
                            {
                                icon: 'zoom-in',
                                tooltip: t('graph:zoom-in'),
                                onClick: () => dispatch('zoom-in')
                            }
                        ]}
                        reversed
                        tooltipPlacement="bottom"
                    />
                    <Content>
                        <iframe
                            ref={iframe}
                            src={`${PUBLIC_PATH}/netron/index.html`}
                            frameBorder={0}
                            scrolling="no"
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
                </RenderContent>
            </Wrapper>
        );
    }
);

Graph.displayName = 'Graph';

export default Graph;
