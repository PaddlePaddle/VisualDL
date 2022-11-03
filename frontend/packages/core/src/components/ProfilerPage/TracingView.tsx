/*---------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import React, {useRef, useEffect} from 'react';
import {fetcher} from '~/utils/fetch';
import {position, rem, size, primaryColor} from '~/utils/style';
import styled from 'styled-components';
import GridLoader from 'react-spinners/GridLoader';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
// import tracing from '/__snowpack__/link/packages/netron/dist/index.html';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
const toolboxHeight = rem(40);
const Content = styled.div`
    position: relative;
    height: calc(100% - ${toolboxHeight});
    > .loading {
        ${size('100%')}
        ${position('absolute', 0, null, null, 0)}
        display: flex;
        justify-content: center;
        align-items: center;
    }
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
            fetcher('/profiler/trace' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then((res: any) => {
                setTraceData(res);
            });
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
            const data = JSON.stringify(traceData);
            iframeRef.current?.contentWindow?.postMessage({msg: 'data', data}, '*');
            iframeRef.current?.focus();
        }
    }, [traceData, traceViewReady]);
    const SetIframeActive = () => {
        iframeRef.current?.focus();
    };
    return (
        <Content>
            {!traceViewReady && (
                <div className="loading">
                    <GridLoader color={primaryColor} size="10px" />
                </div>
            )}
            <ClickAwayListener onClickAway={SetIframeActive}>
                <iframe
                    ref={iframeRef}
                    src={PUBLIC_PATH + '/__snowpack__/link/packages/trace/dist/trace_embedding.html'}
                    frameBorder={0}
                    scrolling="no"
                    marginWidth={0}
                    marginHeight={0}
                ></iframe>
            </ClickAwayListener>
        </Content>
    );
};
export default TracingView;
