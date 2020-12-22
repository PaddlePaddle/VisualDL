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

import React, {FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {borderRadius, em, rem, size, transitionProps, zIndexes} from '~/utils/style';

import Button from '~/components/Button';
import Icon from '~/components/Icon';
import styled from 'styled-components';

const Dialog = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overscroll-behavior: none;
    background-color: var(--dark-mask-color);
    z-index: ${zIndexes.dialog};
    ${transitionProps('background-color')}

    > .modal {
        width: ${rem(700)};
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.08);
        background-color: var(--background-color);
        border-radius: ${borderRadius};
        ${transitionProps('background-color')}

        > .modal-header {
            padding: 0 ${em(40, 16)};
            height: ${em(55, 16)};
            line-height: ${em(55, 16)};
            text-align: center;
            font-size: ${em(16)};
            font-weight: 700;
            position: relative;
            border-bottom: 1px solid var(--border-color);

            > .modal-close {
                position: absolute;
                right: 0;
                ${size(em(55, 16), em(55, 16))}
                line-height: ${em(55, 16)};
                font-size: ${em(20, 16)};
                text-align: center;
                cursor: pointer;
                color: var(--text-lighter-color);
            }
        }

        > .modal-body {
            margin: ${rem(40)} 0;
            height: ${rem(314)};
        }
    }
`;

const STEP1_TSV_EXAMPLE = `0.1\\t0.2\\t0.5\\t0.9\n0.2\\t0.1\\t5.0\\t0.2\n0.4\\t0.1\\t7.0\\t0.8`;
const STEP2_TSV_EXAMPLE = `Pokémon\\tSpecies\nWartortle\\tTurtle\nVenusaur\\tSeed\nCharmeleon\\tFlame`;

const Uploader = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: space-between;

    > .item {
        flex: 1;
        padding: 0 ${rem(40)};
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;

        &:not(:last-child) {
            border-right: 1px solid var(--border-color);
        }

        .desc {
            height: 30%;
            line-height: 1.7;

            .tip {
                color: var(--text-light-color);
            }
        }

        pre {
            height: 40%;
            margin: 0;
            padding: ${rem(30)} ${rem(40)};
            color: var(--code-color);
            background-color: var(--code-background-color);
        }
    }
`;

type UploadDialogProps = {
    open?: boolean;
    hasVector?: boolean;
    onClose?: () => unknown;
    onChangeVectorFile?: (file: File) => unknown;
    onChangeMetadataFile?: (file: File) => unknown;
};

const UploadDialog: FunctionComponent<UploadDialogProps> = ({
    open,
    hasVector,
    onClose,
    onChangeVectorFile,
    onChangeMetadataFile
}) => {
    const {t} = useTranslation('high-dimensional');

    const [show, setShow] = useState(!!open);
    useEffect(() => setShow(!!open), [open]);

    const close = useCallback(() => onClose?.(), [onClose]);

    const vectorFileInput = useRef<HTMLInputElement>(null);
    const metadataFileInput = useRef<HTMLInputElement>(null);
    const changeVectorFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const target = e.target;
            if (target && target.files && target.files.length) {
                onChangeVectorFile?.(target.files[0]);
            }
        },
        [onChangeVectorFile]
    );
    const changeMetadataFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const target = e.target;
            if (target && target.files && target.files.length) {
                onChangeMetadataFile?.(target.files[0]);
            }
        },
        [onChangeMetadataFile]
    );
    const clickVectorFileInput = useCallback(() => {
        if (vectorFileInput.current) {
            vectorFileInput.current.value = '';
            vectorFileInput.current.click();
        }
    }, []);
    const clickMetadataFileInput = useCallback(() => {
        if (metadataFileInput.current) {
            metadataFileInput.current.value = '';
            metadataFileInput.current.click();
        }
    }, []);

    if (!show) {
        return null;
    }

    return (
        <Dialog>
            <div className="modal">
                <div className="modal-header">
                    {t('high-dimensional:upload-from-computer')}
                    <a className="modal-close" onClick={close}>
                        <Icon type="close" />
                    </a>
                </div>
                <div className="modal-body">
                    <Uploader>
                        <div className="item">
                            <div className="desc">
                                <Trans i18nKey="high-dimensional:upload.step1">
                                    Step 1: Load a TSV file of vectors.
                                    <br />
                                    Example of 3 vectors with dimension 4:
                                </Trans>
                            </div>
                            <pre>{STEP1_TSV_EXAMPLE}</pre>
                            <Button type="primary" onClick={clickVectorFileInput}>
                                {t('high-dimensional:select-file')}
                            </Button>
                        </div>
                        <div className="item">
                            <div className="desc">
                                <Trans i18nKey="high-dimensional:upload.step2">
                                    Step 2 (optional): Load a TSV file of metadata.
                                    <br />
                                    Example of 3 data points and 2 columns.
                                    <br />
                                    <span className="tip">
                                        Note: If there is more than one column, the first row will be parsed as column
                                        labels.
                                    </span>
                                </Trans>
                            </div>
                            <pre>{STEP2_TSV_EXAMPLE}</pre>
                            <Button type="primary" disabled={!hasVector} onClick={clickMetadataFileInput}>
                                {t('high-dimensional:select-file')}
                            </Button>
                        </div>
                    </Uploader>
                </div>
            </div>
            <input
                ref={vectorFileInput}
                type="file"
                multiple={false}
                onChange={changeVectorFile}
                style={{
                    display: 'none'
                }}
            />
            <input
                ref={metadataFileInput}
                type="file"
                multiple={false}
                onChange={changeMetadataFile}
                style={{
                    display: 'none'
                }}
            />
        </Dialog>
    );
};

export default UploadDialog;
