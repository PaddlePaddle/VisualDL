import React, {FunctionComponent} from 'react';
import {backgroundColor, em, size} from '~/utils/style';

import Property from '~/components/GraphsPage/Property';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const Dialog = styled.div<{open?: boolean}>`
    display: ${props => (props.open ? 'block' : 'none')};
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
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

        > .modal-header {
            padding: 0 ${em(40, 18)};
            height: ${em(47, 18)};
            background-color: #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: ${em(18)};

            > .modal-title {
                flex: 1 1 auto;
            }

            > .modal-close {
                flex: 0 0 auto;
                ${size(em(20), em(20))}
                font-size: ${em(20, 18)};
                text-align: center;
                cursor: pointer;
            }
        }

        > .modal-body {
            padding: ${em(40)};
            background-color: ${backgroundColor};
        }
    }
`;

type Property = {
    name: string;
    value: string;
};

type ModelPropertiesDialogProps = {
    properties?: Property[];
    onClose?: () => unknown;
};

const ModelPropertiesDialog: FunctionComponent<ModelPropertiesDialogProps> = ({properties, onClose}) => {
    const {t} = useTranslation('graphs');

    return (
        <Dialog open={!!properties}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{t('graphs:model-properties')}</span>
                    <a className="modal-close" onClick={() => onClose?.()}>
                        X
                    </a>
                </div>
                <div className="modal-body">
                    {properties?.map((property, index) => (
                        <Property {...property} key={index} />
                    ))}
                </div>
            </div>
        </Dialog>
    );
};

export default ModelPropertiesDialog;
