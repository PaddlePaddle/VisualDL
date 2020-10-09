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

import React, {FunctionComponent, useCallback, useState} from 'react';
import {em, sameBorder, size, transitionProps} from '~/utils/style';

import Button from '~/components/Button';
import Icon from '~/components/Icon';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const DropZone = styled.div<{actived: boolean}>`
    ${props =>
        sameBorder({
            width: '1px',
            type: 'dashed',
            radius: em(16),
            color: props.actived ? 'var(--primary-color)' : undefined
        })}
    background-color: ${props =>
        props.actived ? 'var(--graph-uploader-active-background-color)' : 'var(--graph-uploader-background-color)'};
    ${size('43.2%', '68%')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    ${transitionProps('border-color', 'background-color')}

    > .upload-icon {
        font-size: ${em(64)};
        color: var(--primary-color);
        ${transitionProps('color')}
    }

    > span {
        font-size: ${em(18)};
        line-height: 3.2;
    }

    > .upload-button {
        min-width: ${em(155)};
    }
`;

const SupportTable = styled.table`
    max-width: 68%;
    margin-top: ${em(32)};

    td {
        vertical-align: text-top;
        line-height: 2;

        &:first-of-type {
            color: var(--text-light-color);
            text-align: right;
            padding-right: ${em(10)};
            font-size: ${em(16)};
            width: ${em(250)};
            ${transitionProps('color')}
        }
    }
`;

type UploaderProps = {
    onClickUpload?: () => unknown;
    onDropFiles?: (files: FileList) => unknown;
};

const Uploader: FunctionComponent<UploaderProps> = ({onClickUpload, onDropFiles}) => {
    const {t} = useTranslation('graph');

    const [actived, setActived] = useState(false);
    const onClick = useCallback(() => onClickUpload?.(), [onClickUpload]);
    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setActived(false);
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                onDropFiles?.(e.dataTransfer.files);
            }
        },
        [onDropFiles]
    );
    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
            return;
        }
        setActived(false);
    }, []);

    return (
        <>
            <DropZone
                actived={actived}
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onDragEnter={() => setActived(true)}
                onDragLeave={onDragLeave}
            >
                <Icon type="upload" className="upload-icon" />
                <span>{t('graph:upload-tip')}</span>
                <Button type="primary" rounded className="upload-button" onClick={onClick}>
                    {t('graph:upload-model')}
                </Button>
            </DropZone>
            <SupportTable>
                <tbody>
                    <tr>
                        <td>{t('graph:supported-model')}</td>
                        <td>{t('graph:supported-model-list')}</td>
                    </tr>
                    <tr>
                        <td>{t('graph:experimental-supported-model')}</td>
                        <td>{t('graph:experimental-supported-model-list')}</td>
                    </tr>
                </tbody>
            </SupportTable>
        </>
    );
};

export default Uploader;
