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

import React, {FunctionComponent, useState, useEffect} from 'react';
import {ToolsType} from '~/components/GraphG6';
import NodeSearch from '~/components/ModelVisualPage/NodeSearch';
import Checkbox from '~/components/Checkbox';
import {em} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Controller = styled.div`
    width: 100%;
    padding: ${em(10, 18)};
    margin-bottom: ${em(25, 18)};
`;

const BehaviorController = styled.div`
    width: 100%;
    border-bottom: 1px solid var(--border-color);
    overflow: hidden;

    > .checkbox {
        width: 100%;
        margin: ${em(12, 18)} ${em(20, 18)};
    }
`;

type GraphG6ControllerProps = {
    searchList: string[];
    onSelect: (value: string) => unknown;
    setMinimapDisplay: (value: boolean) => unknown;
    setTools: (type: ToolsType, value: boolean) => unknown;
};

const GraphG6Controller: FunctionComponent<GraphG6ControllerProps> = ({
    searchList,
    onSelect,
    setMinimapDisplay,
    setTools,
}) => {
    const {t} = useTranslation(['model-visual']);
    const [canvasDrag, setCanvasDrag] = useState<boolean>(true);
    const [canvasZoom, setCanvasZoom] = useState<boolean>(true);
    const [nodeDrag, setNodeDrag] = useState<boolean>(true);
    const [activateRelations, setActivateRelations] = useState<boolean>(false);

    useEffect(
        () => {
            setTools(ToolsType.canvasDrag, canvasDrag);
        },
        [canvasDrag]
    );

    useEffect(
        () => {
            setTools(ToolsType.canvasZoom, canvasZoom);
        },
        [canvasZoom]
    );

    useEffect(
        () => {
            setTools(ToolsType.nodeDrag, nodeDrag);
        },
        [nodeDrag]
    );

    useEffect(
        () => {
            setTools(ToolsType.activateRelations, activateRelations);
        },
        [activateRelations]
    );

    return (
        <Controller>
            <NodeSearch searchList={searchList} onSelect={onSelect} />
            <BehaviorController>
                <p>{t('model-visual:tools.behavior-controller')}</p>
                <div className="checkbox">
                    <Checkbox checked={true} onChange={setMinimapDisplay}>
                        {t('model-visual:tools.display-minimap')}
                    </Checkbox>
                </div>
                <div className="checkbox">
                    <Checkbox checked={canvasDrag} onChange={setCanvasDrag}>
                        {t('model-visual:tools.drag-canvas')}
                    </Checkbox>
                </div>
                <div className="checkbox">
                    <Checkbox checked={canvasZoom} onChange={setCanvasZoom}>
                        {t('model-visual:tools.zoom-canvas')}
                    </Checkbox>
                </div>
                <div className="checkbox">
                    <Checkbox checked={nodeDrag} onChange={setNodeDrag}>
                        {t('model-visual:tools.drag-node')}
                    </Checkbox>
                </div>
                <div className="checkbox">
                    <Checkbox checked={activateRelations} onChange={setActivateRelations}>
                        {t('model-visual:tools.activate-relations')}
                    </Checkbox>
                </div>
            </BehaviorController>
        </Controller>
    );
};

export default GraphG6Controller;
