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

import React, {FunctionComponent, useState, useEffect, useRef, useCallback, useImperativeHandle} from 'react';
import G6, {Graph, GraphData, GraphOptions, NodeConfig} from '@antv/g6';
import styled from 'styled-components';

const GraphG6Container = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--background-color);
`;

const MinimapContainer = styled.div.attrs<{minimapDisplay: boolean}>(({minimapDisplay}) => ({
    style: {
        display: minimapDisplay ? 'block' : 'none'
    }
}))<{minimapDisplay: boolean}>`
    position: absolute;
    top: 0;
    right: 0;
    border: 1px solid var(--border-color);
    background: var(--background-focused-color);
`;

export type NodeModel = {
    id: string;
    x?: number;
    y?: number;
    getModel?: () => unknown;
};

export enum ToolsType {
    canvasDrag = 'drag-canvas',
    canvasZoom = 'zoom-canvas',
    nodeDrag = 'drag-node',
    activateRelations = 'activate-relations'
};
export interface GraphG6Method {
    repaintGraphG6: () => unknown;
}

type ToolsMap = {
    [index in ToolsType]: boolean;
};

type GraphG6Props = {
    graphG6Ref: React.MutableRefObject<GraphG6Method>;
    graphData: GraphData | null;
    graphOptions: GraphOptions;
    minimapDisplay: boolean;
    toolsMap: ToolsMap;
    locationId: string | null;
    getSelectStatus: (isSelected: boolean) => unknown;
    getNodeModel: (model: NodeModel) => unknown;
    updateNodeData?: (model: NodeModel) => unknown;
};

const GraphG6: FunctionComponent<GraphG6Props> = ({
    graphG6Ref,
    graphData,
    graphOptions,
    minimapDisplay,
    toolsMap,
    locationId,
    getSelectStatus,
    getNodeModel,
    updateNodeData
}) => {
    const ref = useRef<HTMLDivElement>(null);;

    const [graph, setGraph] = useState<Graph | null>(null);

    const loadGraph = useCallback(
        () => {
            if(!graph) {
                setGraph(new G6.Graph({
                    ...graphOptions,
                    plugins: [
                        new G6.Minimap({
                            container: 'GraphG6Minimap',
                            size: [225, 150]
                        })
                    ]
                }));
            }
            graph?.off('nodeselectchange', nodeSelectChange);
            graph?.off('node:dragend', dragNodeUpdate);
            graph?.on('nodeselectchange', nodeSelectChange);
            graph?.on('node:dragend', dragNodeUpdate);
            graphData && graph?.read(graphData);
            return () => {
                graph?.off('nodeselectchange', nodeSelectChange);
                graph?.off('node:dragend', dragNodeUpdate);
            }
        },
        [graph, graphData, graphOptions]
    );

    const dragNodeUpdate = useCallback(
        ev => {
            const node = ev?.target ?? null;
            if (node) {
                const model = graph?.findById(node?.cfg?.parent?.cfg?.id)?.getModel() ?? null;
                model && updateNodeData?.(model as NodeConfig ?? null);
            }
        },
        [graph]
    );

    const nodeSelectChange = useCallback(
        ev => {
            getSelectStatus(ev.select);
            if (Boolean(ev.select)) {
                const node = ev?.target ?? null;
                node && getNodeModel(node?.getModel() ?? null);
            }
        },
        []
    );

    const searchNodeLocation = useCallback(
        (id: string) => {
            graph?.focusItem(id, true, {
                easing: 'easeCubic',
                duration: 400
            });
            const node = graph?.findById(id);
            if (node) {
                const selectedNodes = graph?.findAllByState('node', 'selected') || [];
                selectedNodes.forEach(node => node.setState('selected', false));
                node?.setState('selected', true);
                getSelectStatus(true);
                getNodeModel((node.getModel() as NodeConfig) ?? null);
            }
        },
        [graph]
    );

    useEffect(
        () => {
            graphOptions && loadGraph();
        },
        [graphData, graphOptions]
    );

    useEffect(
        () => {
            if (graph) {
                const addBehaviors = [];
                const removeBehaviors = [];
                toolsMap['drag-canvas'] ? addBehaviors.push('drag-canvas') : removeBehaviors.push('drag-canvas');
                toolsMap['zoom-canvas'] ? addBehaviors.push('zoom-canvas') : removeBehaviors.push('zoom-canvas');
                toolsMap['drag-node'] ? addBehaviors.push('drag-node') : removeBehaviors.push('drag-node');
                toolsMap['activate-relations'] ? addBehaviors.push('activate-relations') : removeBehaviors.push('activate-relations');
                graph.addBehaviors(addBehaviors, 'default');
                graph.removeBehaviors(removeBehaviors, 'default');
            }
        },
        [graph, toolsMap]
    );

    useEffect(
        () => {
            locationId && searchNodeLocation(locationId);
        },
        [locationId]
    );

    useImperativeHandle(graphG6Ref, () =>({
        repaintGraphG6: () => {
            graph?.changeSize(0, 0);
            const width = ref.current?.clientWidth;
            const height = ref.current?.clientHeight;
            (width && height) && graph?.changeSize(width, height);
        }
    }));

    return (
        <GraphG6Container
            ref={ref}
            id={typeof graphOptions.container === 'string'
                ? graphOptions.container
                : 'GraphG6'
            }
        >
            <MinimapContainer id="GraphG6Minimap" minimapDisplay={minimapDisplay} />
        </GraphG6Container>
    );
}

export default GraphG6;
