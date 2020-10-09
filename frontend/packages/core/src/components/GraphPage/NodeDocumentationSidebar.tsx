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

import React, {FunctionComponent, useCallback} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {borderRadius, em, transitionProps} from '~/utils/style';

import type {Documentation as DocumentationType} from '~/resource/graph/types';
import GraphSidebar from '~/components/GraphPage/GraphSidebar';
import styled from 'styled-components';

const Documentation = styled.div`
    overflow: hidden;
    word-break: break-word;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', 'Ubuntu', 'Droid Sans', sans-serif;

    h1 {
        font-size: ${em(18)};
        margin: ${em(10)} 0;
    }

    h2 {
        font-size: ${em(16)};
        margin: ${em(10)} 0;
    }

    h3 {
        font-size: ${em(14)};
        margin: ${em(10)} 0;
    }

    p {
        line-height: 1.5;
        margin: ${em(10)} 0;
    }

    dl {
        line-height: 1.5;
        margin: ${em(10)} 0;

        > dt {
            font-weight: 700;
        }

        > dd {
            margin-left: ${em(20)};
        }
    }

    pre {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        background-color: var(--code-background-color);
        color: var(--code-color);
        padding: ${em(10)};
        border-radius: ${borderRadius};
        overflow: auto;
        ${transitionProps('color')}

        code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
        }
    }

    code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        background-color: var(--code-background-color);
        color: var(--code-color);
        padding: ${em(2)} ${em(4)};
        border-radius: ${em(2)};
        ${transitionProps('color')}
    }
`;

type NodeDocumentationSidebarProps = {
    data?: DocumentationType | null;
    onClose?: () => unknown;
};

const NodeDocumentationSidebar: FunctionComponent<NodeDocumentationSidebarProps> = ({data, onClose}) => {
    const {t} = useTranslation('graph');

    const list = useCallback(
        (items: {name: string; type?: string | string[]; description: string}[]) =>
            items.map((item, index) => (
                <dl key={index}>
                    <dt>
                        {item.name}
                        {item.type && (
                            <>
                                :{' '}
                                {'string' === typeof item.type ? (
                                    <code>{item.type}</code>
                                ) : (
                                    item.type.map((i, j) => (
                                        <React.Fragment key={j}>
                                            {j ? ',' : null}
                                            <code>{i}</code>
                                        </React.Fragment>
                                    ))
                                )}
                            </>
                        )}
                    </dt>
                    <dd dangerouslySetInnerHTML={{__html: item.description}}></dd>
                </dl>
            )),
        []
    );

    return (
        <GraphSidebar title={t('graph:node-documentation')} onClose={onClose}>
            <Documentation>
                <h1>{data?.name}</h1>
                {data?.summary && <p dangerouslySetInnerHTML={{__html: data.summary}}></p>}
                {data?.description && <p dangerouslySetInnerHTML={{__html: data.description}}></p>}
                {data?.attributes && (
                    <>
                        <h2>{t('graph:documentation.attributes')}</h2>
                        {list(data.attributes)}
                    </>
                )}
                {data?.inputs && (
                    <>
                        <h2>
                            {t('graph:documentation.inputs')}
                            {data?.inputs_range && ` (${data.inputs_range.replace(/&#8734;/g, '∞')})`}
                        </h2>
                        {list(data.inputs)}
                    </>
                )}
                {data?.outputs && (
                    <>
                        <h2>
                            {t('graph:documentation.outputs')}
                            {data?.outputs_range && ` (${data.outputs_range.replace(/&#8734;/g, '∞')})`}
                        </h2>
                        {list(data.outputs)}
                    </>
                )}
                {data?.type_constraints && (
                    <>
                        <h2>{t('graph:documentation.type-constraints')}</h2>
                        {list(
                            data.type_constraints.map(({type_param_str, allowed_type_strs, description}) => ({
                                name: type_param_str,
                                type: allowed_type_strs,
                                description
                            }))
                        )}
                    </>
                )}
                {data?.examples && (
                    <>
                        <h2>{t('graph:documentation.examples')}</h2>
                        {data.examples.map((example, index) => (
                            <React.Fragment key={index}>
                                <h3>{example.summary}</h3>
                                <pre>{example.code}</pre>
                            </React.Fragment>
                        ))}
                    </>
                )}
                {data?.references && (
                    <>
                        <h2>{t('graph:documentation.references')}</h2>
                        <ul>
                            {data.references.map((reference, index) => (
                                <li key={index} dangerouslySetInnerHTML={{__html: reference.description}}></li>
                            ))}
                        </ul>
                    </>
                )}
                {data && data.domain && data.since_version && data.support_level && (
                    <>
                        <h2>{t('graph:documentation.support')}</h2>
                        <dl>
                            {/* prettier-ignore */}
                            <Trans i18nKey="graph:documentation.support-info">
                                In domain <code>{{domain: data.domain}}</code> since version <code>{{since_version: data.since_version}}</code> at support level <code>{{support_level: data.support_level}}</code>.
                            </Trans>
                        </dl>
                    </>
                )}
            </Documentation>
        </GraphSidebar>
    );
};

export default NodeDocumentationSidebar;
