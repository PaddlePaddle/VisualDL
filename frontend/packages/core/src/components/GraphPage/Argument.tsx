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

import type {Argument as ArgumentType, Property as PropertyType} from '~/resource/graph/types';
import React, {FunctionComponent, useMemo, useState} from 'react';
import {em, sameBorder, transitionProps} from '~/utils/style';

import Icon from '~/components/Icon';
import styled from 'styled-components';

const Wrapper = styled.div`
    ${sameBorder({radius: true})}

    & + & {
        margin-top: ${em(10)};
    }

    > .argument-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${em(8)} ${em(10)};
        line-height: 1.5;
        box-sizing: content-box;
        min-height: 1em;

        > .argument-text {
            flex: auto;
            overflow: hidden;
            word-break: break-all;
        }

        > .argument-raw {
            overflow: auto;
            width: 100%;

            pre {
                margin: 0;
            }
        }

        > .argument-operation {
            flex: none;
            cursor: pointer;
            font-size: ${em(14)};
            margin-left: ${em(10)};
            color: var(--text-lighter-color);
            ${transitionProps('color')}

            &:hover,
              &:active {
                color: var(--text-light-color);
            }
        }

        &:not(:first-child) {
            border-top: 1px solid var(--border-color);
            ${transitionProps('border-color')}
        }
    }
`;

type ArgumentProps = {
    value: ArgumentType | PropertyType;
    expand?: boolean;
    showNodeDocumentation?: () => unknown;
};

const Argument: FunctionComponent<ArgumentProps> = ({value, expand, showNodeDocumentation}) => {
    const [expanded, setExpanded] = useState(expand ?? false);

    const expandable = useMemo(() => {
        const argument = value as ArgumentType;
        return !!(argument.children && argument.children.length);
    }, [value]);

    return (
        <Wrapper>
            <div className="argument-row">
                <span className="argument-text">
                    {value.name ? (
                        <>
                            {value.name}: <b>{value.value}</b>
                        </>
                    ) : (
                        new String(value.value).split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {index !== 0 && <br />}
                                {line}
                            </React.Fragment>
                        ))
                    )}
                </span>
                {(value as PropertyType).documentation && (
                    <a className="argument-operation" onClick={() => showNodeDocumentation?.()}>
                        <Icon type="question-circle" />
                    </a>
                )}
                {expandable && (
                    <a className="argument-operation" onClick={() => setExpanded(e => !e)}>
                        <Icon type={expanded ? 'minus' : 'plus'} />
                    </a>
                )}
            </div>
            {expandable &&
                expanded &&
                (value as ArgumentType)?.children?.map((item, index) => (
                    <div className="argument-row" key={index}>
                        {item.type === 'raw' ? (
                            <span className="argument-raw">
                                <pre>{item.value}</pre>
                            </span>
                        ) : (
                            <span className="argument-text">
                                {item.name ? `${item.name}: ` : ''}
                                <b>{item.type === 'code' ? <code>{item.value}</code> : item.value}</b>
                            </span>
                        )}
                    </div>
                ))}
        </Wrapper>
    );
};

export default Argument;
