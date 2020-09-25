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
import {em, size, transitionProps, zIndexes} from '~/utils/style';

import Icon from '~/components/Icon';
import Properties from '~/components/GraphPage/Properties';
import type {Properties as PropertiesType} from '~/resource/graph/types';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Dialog = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overscroll-behavior: none;
    background-color: var(--mask-color);
    z-index: ${zIndexes.dialog};
    ${transitionProps('background-color')}

    > .modal {
        width: ${em(536)};
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.08);

        > .modal-header {
            padding: 0 ${em(40, 18)};
            height: ${em(47, 18)};
            background-color: var(--model-header-background-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: ${em(18)};
            ${transitionProps('background-color')}

            > .modal-title {
                flex: auto;
            }

            > .modal-close {
                flex: none;
                ${size(em(20, 18), em(20, 18))}
                font-size: ${em(20, 18)};
                text-align: center;
                cursor: pointer;
            }
        }

        > .modal-body {
            padding: ${em(40)};
            background-color: var(--background-color);
            overflow: auto;
            max-height: calc(80vh - ${em(47)});
            ${transitionProps('background-color')}
        }
    }
`;

type ModelPropertiesDialogProps = {
    data?: PropertiesType | null;
    onClose?: () => unknown;
};

const ModelPropertiesDialog: FunctionComponent<ModelPropertiesDialogProps> = ({data, onClose}) => {
    const {t} = useTranslation('graph');

    if (!data) {
        return null;
    }

    return (
        <Dialog>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{t('graph:model-properties')}</span>
                    <a className="modal-close" onClick={() => onClose?.()}>
                        <Icon type="close" />
                    </a>
                </div>
                <div className="modal-body">
                    <Properties {...data} expand />
                </div>
            </div>
        </Dialog>
    );
};

export default ModelPropertiesDialog;
