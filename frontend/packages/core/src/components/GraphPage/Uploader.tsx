import React, {FunctionComponent, useCallback, useState} from 'react';
import {em, primaryColor, sameBorder, size, textLightColor} from '~/utils/style';

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
            color: props.actived ? primaryColor : undefined
        })}
    background-color: ${props => (props.actived ? '#f2f6ff' : '#f9f9f9')};
    ${size('43.2%', '68%')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > .upload-icon {
        font-size: ${em(64)};
        color: ${primaryColor};
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
            color: ${textLightColor};
            text-align: right;
            padding-right: ${em(10)};
            font-size: ${em(16)};
            width: ${em(250)};
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
