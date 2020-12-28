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

import React, {FunctionComponent} from 'react';
import {rem, sameBorder} from '~/utils/style';

import Icon from '~/components/Icon';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Operations = styled.div`
    --operation-height: ${rem(36)};

    display: flex;
    align-items: center;
    height: var(--operation-height);
    ${sameBorder({radius: 'calc(var(--operation-height) / 2)'})}
    overflow: hidden;

    > a {
        cursor: pointer;
        font-size: ${rem(16)};
        line-height: calc(var(--operation-height) - 2px);

        > span {
            vertical-align: middle;
            display: inline-block;
            padding: 0 0.857142857rem;
            height: ${rem(20)};
            line-height: ${rem(20)};

            > * {
                vertical-align: middle;
            }
        }

        & + a {
            > span {
                border-left: 1px solid var(--border-color);
            }
        }

        &.three-d {
            font-size: ${rem(20)};
        }

        &:hover {
            color: var(--primary-focused-color);
        }

        &:active {
            color: var(--primary-active-color);
        }
    }
`;

type ChartOperationsProps = {
    onReset?: () => unknown;
};

const ChartOperations: FunctionComponent<ChartOperationsProps> = ({onReset}) => {
    const {t} = useTranslation('high-dimensional');

    return (
        <Operations>
            {/* <Tippy content={t('high-dimensional:selection')} placement="bottom" theme="tooltip">
                <a>
                    <span>
                        <Icon type="selection" />
                    </span>
                </a>
            </Tippy>
            <Tippy content={t('high-dimensional:3d-label')} placement="bottom" theme="tooltip">
                <a className="three-d">
                    <span>
                        <Icon type="three-d" />
                    </span>
                </a>
            </Tippy> */}
            <Tippy content={t('high-dimensional:reset-zoom')} placement="bottom" theme="tooltip">
                <a onClick={() => onReset?.()}>
                    <span>
                        <Icon type="reset" />
                    </span>
                </a>
            </Tippy>
        </Operations>
    );
};

export default ChartOperations;
