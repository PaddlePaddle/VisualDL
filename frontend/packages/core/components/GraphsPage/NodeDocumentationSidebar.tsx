import React, {FunctionComponent, useCallback} from 'react';
import {Trans, useTranslation} from '~/utils/i18n';
import {borderRadius, em, textLightColor} from '~/utils/style';

import {Documentation as DocumentationType} from '~/resource/graphs/types';
import GraphSidebar from '~/components/GraphsPage/GraphSidebar';
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
        background-color: rgba(216, 216, 216, 0.5);
        color: ${textLightColor};
        padding: ${em(10)};
        border-radius: ${borderRadius};
        overflow: auto;

        code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
        }
    }

    code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        background-color: rgba(216, 216, 216, 0.5);
        color: ${textLightColor};
        padding: ${em(2)} ${em(4)};
        border-radius: ${em(2)};
    }
`;

type NodeDocumentationSidebarProps = {
    data?: DocumentationType | null;
    onClose?: () => unknown;
};

const NodeDocumentationSidebar: FunctionComponent<NodeDocumentationSidebarProps> = ({data, onClose}) => {
    const {t} = useTranslation('graphs');

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
        <GraphSidebar title={t('graphs:node-documentation')} onClose={onClose}>
            <Documentation>
                <h1>{data?.name}</h1>
                {data?.summary && <p dangerouslySetInnerHTML={{__html: data.summary}}></p>}
                {data?.description && <p dangerouslySetInnerHTML={{__html: data.description}}></p>}
                {data?.attributes && (
                    <>
                        <h2>{t('graphs:documentation.attributes')}</h2>
                        {list(data.attributes)}
                    </>
                )}
                {data?.inputs && (
                    <>
                        <h2>
                            {t('graphs:documentation.inputs')}
                            {data?.inputs_range && ` (${data.inputs_range.replace(/&#8734;/g, '∞')})`}
                        </h2>
                        {list(data.inputs)}
                    </>
                )}
                {data?.outputs && (
                    <>
                        <h2>
                            {t('graphs:documentation.outputs')}
                            {data?.outputs_range && ` (${data.outputs_range.replace(/&#8734;/g, '∞')})`}
                        </h2>
                        {list(data.outputs)}
                    </>
                )}
                {data?.type_constraints && (
                    <>
                        <h2>{t('graphs:documentation.type-constraints')}</h2>
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
                        <h2>{t('graphs:documentation.examples')}</h2>
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
                        <h2>{t('graphs:documentation.references')}</h2>
                        <ul>
                            {data.references.map((reference, index) => (
                                <li key={index} dangerouslySetInnerHTML={{__html: reference.description}}></li>
                            ))}
                        </ul>
                    </>
                )}
                {data && data.domain && data.since_version && data.support_level && (
                    <>
                        <h2>{t('graphs:documentation.support')}</h2>
                        <dl>
                            {/* prettier-ignore */}
                            <Trans i18nKey="graphs:documentation.support-info">
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
