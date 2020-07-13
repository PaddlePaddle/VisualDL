import React, {FunctionComponent} from 'react';
import {backgroundColor, em, size} from '~/utils/style';

import Icon from '~/components/Icon';
import Properties from '~/components/GraphPage/Properties';
import {Properties as PropertiesType} from '~/resource/graph/types';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const Dialog = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overscroll-behavior: none;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 999;

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
            background-color: #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: ${em(18)};

            > .modal-title {
                flex: auto;
            }

            > .modal-close {
                flex: none;
                ${size(em(14, 18), em(14, 18))}
                font-size: ${em(14, 18)};
                text-align: center;
                cursor: pointer;
            }
        }

        > .modal-body {
            padding: ${em(40)};
            background-color: ${backgroundColor};
            overflow: auto;
            max-height: calc(80vh - ${em(47)});
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
