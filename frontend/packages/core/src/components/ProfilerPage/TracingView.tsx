/*---------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import React, {FunctionComponent, useCallback, useRef, useMemo, useState, useEffect} from 'react';
import {fetcher} from '~/utils/fetch';
import {contentHeight, position, primaryColor, rem, size, transitionProps} from '~/utils/style';
import styled from 'styled-components';
// import tracing from '/__snowpack__/link/packages/netron/dist/index.html';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
const toolboxHeight = rem(40);
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
`;
export interface IProps {
    runs: string;
    workers: string;
    spans: string;
    views: string;
    // iframeRef: React.RefObject<HTMLIFrameElement>;
}

const TracingView: React.FC<IProps> = props => {
    const {runs, workers, spans, views} = props;
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [traceData, setTraceData] = React.useState<Promise<string> | null>(null);
    const [traceViewReady, setTraceViewReady] = React.useState(false);

    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/trace' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: any) => {
                    console.log('res',res);
                    setTraceData(res);
                }
            );
        }
    }, [runs, workers, spans, views]);

    React.useEffect(() => {
        function callback(event: MessageEvent) {
            const data = event.data || {};
            if (data.msg === 'ready') {
                setTraceViewReady(true);
            }
        }

        window.addEventListener('message', callback);
        return () => {
            window.removeEventListener('message', callback);
        };
    }, []);

    React.useEffect(() => {
        if (traceData && traceViewReady) {
            traceData.then(data => {
                console.log('函数执行了');
                iframeRef.current?.contentWindow?.postMessage({msg: 'data', data}, '*');
            });
        }
    }, [traceData, traceViewReady]);
    const SetIframeActive = () => {
        iframeRef.current?.focus();
    };

    return (
        <Content>
            <iframe
                ref={iframeRef}
                src={PUBLIC_PATH + '/__snowpack__/link/packages/trace/dist/trace_embedding.html'}
                frameBorder={0}
                scrolling="no"
                marginWidth={0}
                marginHeight={0}
            ></iframe>
        </Content>
    );
};
export default TracingView;
