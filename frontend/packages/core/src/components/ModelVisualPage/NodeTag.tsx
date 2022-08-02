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

import React, {FunctionComponent, useState} from 'react';
import {em, transitionProps} from '~/utils/style';
import Field from '~/components/Field';
import RadioGroup from '~/components/RadioGroup';
import RadioButton from '~/components/RadioButton';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Tag = styled.div`
    width: 100%;
    border-bottom: 1px solid var(--border-color);

    > .panel {

        > .panel-header {
            padding: 0 ${em(10, 18)};
            margin: ${em(10, 18)} 0;
            height: ${em(30, 18)};
            display: flex;
            justify-content: space-between;
            align-items: center;
            ${transitionProps('background-color')}

            > .panel-title {
                font-size: ${em(20, 18)};
            }
        }

        > .panel-body {
            padding: ${em(10)};
            background-color: var(--background-color);
            overflow: auto;

            > .panel-title {
                font-size: ${em(20, 18)};
            }

            > p {
                margin: ${em(15)};

                > .panel-label {
                    margin-right: ${em(10)};
                }
                > span {
                    word-break: break-all;
                }
            }
        }
    }
`;

const StyledField = styled(Field)`
    width: 130px;
    display: flex;
    justify-content: space-between;
`;

export type NodeData = {
    id?: string | number;
    x?: number;
    y?: number;
};

type NodeTagProps = {
    data?: NodeData | null;
    switchStep: (value: string) => unknown;
};

const NodeTag: FunctionComponent<NodeTagProps> = ({data, switchStep}) => {
    const {t} = useTranslation('model-visual');

    const [radioValue, setRadioValue] = useState<string>('join');

    if (!data) {
        return null;
    }

    const {
        id, x, y
    } = data;

    return (
        <Tag>
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">{t('model-visual:data-stage')}</span>
                    <StyledField>
                        <RadioGroup
                            value={radioValue}
                            onChange={value => {
                                setRadioValue(value);
                                switchStep(value);
                                }
                            }
                        >
                            <RadioButton value="join">
                                join
                            </RadioButton>
                            <RadioButton value="update">
                                update
                            </RadioButton>
                        </RadioGroup>
                    </StyledField>
                </div>
                <div className="panel-body">
                    <span className="panel-title">{t('model-visual:node-data')}</span>
                    <p>
                        <span className="panel-label">{t('model-visual:node-id')}:</span>
                        <span>{id || t('model-visual:none-data')}</span>
                    </p>
                    <p>
                        <span className="panel-label">{t('model-visual:node-pos')}:</span>
                        <span>{(x && y) ? `[${x}, ${y}]` : t('model-visual:none-data')}</span>
                    </p>
                </div>
            </div>
        </Tag>
    );
};

export default NodeTag;
