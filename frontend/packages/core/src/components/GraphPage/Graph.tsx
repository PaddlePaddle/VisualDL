// @ts-nocheck
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

import type {Documentation, OpenedResult, Properties, SearchItem, SearchResult} from '~/resource/graph/types';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {contentHeight, position, primaryColor, rem, em, size, transitionProps} from '~/utils/style';
import ChartToolbox from '~/components/ChartToolbox';
import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import useTheme from '~/hooks/useTheme';
import {useTranslation} from 'react-i18next';
import G6 from '@antv/g6';
import {isArray, valuesIn} from 'lodash';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

let IFRAME_HOST = `${window.location.protocol}//${window.location.host}`;
if (PUBLIC_PATH.startsWith('http')) {
    const url = new URL(PUBLIC_PATH);
    IFRAME_HOST = `${url.protocol}//${url.host}`;
}

const toolboxHeight = rem(40);

const Wrapper = styled.div`
    position: relative;
    height: ${contentHeight};
    background-color: var(--background-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    ${transitionProps('background-color')}
`;

const RenderContent = styled.div<{show: boolean}>`
    position: absolute;
    top: 0;
    left: 0;
    ${size('100%', '100%')}
    opacity: ${props => (props.show ? 1 : 0)};
    z-index: ${props => (props.show ? 0 : -1)};
    pointer-events: ${props => (props.show ? 'auto' : 'none')};
`;

const Toolbox = styled(ChartToolbox)`
    height: ${toolboxHeight};
    border-bottom: 1px solid var(--border-color);
    padding: 0 ${rem(20)};
    ${transitionProps('border-color')}
`;

const Content = styled.div`
    position: relative;
    height: calc(100% - ${toolboxHeight});

    > iframe {
        ${size('100%', '100%')}
        border: none;
    }

    > .powered-by {
        display: block;
        ${position('absolute', null, null, rem(20), rem(30))}
        color: var(--graph-copyright-color);
        font-size: ${rem(14)};
        user-select: none;

        img {
            height: 1em;
            filter: var(--graph-copyright-logo-filter);
            vertical-align: middle;
        }
    }
    > #container {
    }
    > .miniapp {
        position:absolute;
        right:0;
        bottom:0;
    }
    .edge-path {
        stroke: #666;
        stroke-width: 1px;
        fill: none;
    }
    .edge-path-control-dependency {
        stroke-dasharray: 3, 2;
    }
    .graph-Node {
        background: rgba(228,157,109,0.70);
        border: 1px solid #B16330;
        text-align: center;
        border-radius: 4px;
        border-radius: 4px;
    }
    .graph-virtual {
        border： node
        text-align: center;
    }
    .graph-Groups{
        background: rgba(155,185,232,0.70);
        border: 1px solid black;
        border-radius: ${em(8)} ${em(8)} ${em(8)} ${em(8)};
        border-radius: ${em(8)} ${em(8)} ${em(8)} ${em(8)};
        position:relative;
        display:flex;
        justify-content:center;
        align-item:center;
    }
    .Groups-content{
        height:100%
    }
    .Groups-button{
        position:absolute;
        top:0%;
        right:5%;
        line-height:16px;
        color:white;
        font-size:${em(24)};
    }

`;

const Loading = styled.div`
    ${size('100%', '100%')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
    font-size: ${rem(16)};
    line-height: ${rem(60)};
`;
const Hide = styled.div`
    display: none;
`;

export type GraphRef = {
    export(type: 'svg' | 'png'): void;
    changeGraph(name: string): void;
    search(value: string): void;
    select(item: SearchItem): void;
    showModelProperties(): void;
    showNodeDocumentation(data: Properties): void;
};
interface theObj {
    [key: string]: any; //动态添加属性
}
type Datas = {
    nodes: theObj;
    edges: theObj[];
    combos: theObj[];
};

type GraphProps = {
    files: FileList | File[] | null;
    uploader: JSX.Element;
    showAttributes: boolean;
    showInitializers: boolean;
    showNames: boolean;
    horizontal: boolean;
    model: unknown;
    selectResult: theObj;
    runs: number;
    getNodeData: any;
    getModelData:any
    onRendered?: () => unknown;
    onOpened?: (data: OpenedResult) => unknown;
    onSearch?: (data: SearchResult) => unknown;
    onShowModelProperties?: (data: Properties) => unknown;
    onShowNodeProperties?: (data: Properties) => unknown;
    onShowNodeDocumentation?: (data: Documentation) => unknown;
};
const Graphs = React.forwardRef<GraphRef, GraphProps>(
    (
        {
            files,
            uploader,
            runs,
            getNodeData,
            getModelData,
            showAttributes,
            showInitializers,
            showNames,
            horizontal,
            model,
            selectResult
        },
        ref
    ) => {
        let graph = null;
        const refs = React.useRef(null);
        const UNIQ_GRAPH_ID = 'UNIQ_GRAPH_ID';
        const {t} = useTranslation('graph');
        const theme = useTheme();
        const [loading, setLoading] = useState(false);
        const [rendered, setRendered] = useState(false);
        const [nodeMap, setNodeMap] = useState(null);
        const [attrMap, setAttrMap] = useState(null);
        const [edgeMap, setEdgeMap] = useState(null);
        const [graphs, setGraphs] = useState(null);
        // const [graphConfig, setConfig] = useState(null);
        const [infoDatas, setInfoDatas] = useState(null);
        const [allNodes, setAllNodes] = useState(null);
        const [startNodes, setStartNodes] = useState(null);
        const [expendnodes, setExpendnodes] = useState([]);
        const [allExpend, setAllExpend] = useState(null);
        const iframe = useRef<HTMLIFrameElement>(null);
        // 初版数据的构建
        useEffect(() => {
            if (!model) {
                return;
            }
            const infoDatas: any = {};
            infoDatas.nodes = new Map();
            infoDatas.edges = new Map();
            infoDatas.combos = new Map();
            let nodeMap = new Map();
            let edgeMap = new Map();
            let attrMap = new Map();
            for (let i = 0; i < model.nodes.length; i++) {
                let node = model.nodes[i];
                nodeMap.set(node.name, node);
            }
            for (let i = 0; i < model.edges.length; i++) {
                let node = model.edges[i];
                edgeMap.set(node.from_node + node.to_node, node);
            }
            for (let i = 0; i < model.vars.length; i++) {
                let node = model.vars[i];
                attrMap.set(node.name, node);
            }
            setEdgeMap(edgeMap);
            setNodeMap(nodeMap);
            setAttrMap(attrMap);
            if (nodeMap.get('/').children_node.length) {
                nodeMap.get('/').children_node.forEach(item => {
                    infoDatas.nodes.set(item, {
                        id: item,
                        label: item,
                        level: item.split('/').length
                    });
                });
            }
            console.log('infoDatas', infoDatas);
            setInfoDatas(infoDatas);
        }, [model]);
        // 构建grouph的参数
        useEffect(() => {
            const container = document.getElementById('container');
            const minimapConatiner = document.getElementById('app-minimap');
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const minimap = new G6.Minimap({
                container: minimapConatiner,
                size: [150, 100]
            });
            const graphConfigs = {
                container: 'container',
                width,
                height: height,
                fitView: true,
                fitViewPadding: 30,
                animate: true,
                groupByTypes: false,
                modes: {
                    default: [
                        {
                            type: 'drag-canvas',
                            allowDragOnItem: true
                        },
                        'zoom-canvas',
                        {
                            type: 'collapse-expand-combo',
                            relayout: true
                        }
                    ]
                },
                layout: {
                    type: 'dagre',
                    sortByCombo: false,
                    controlPoints: true,
                    align: undefined,
                    rankdir: horizontal ? 'LR' : 'TB',
                    ranksep: horizontal ? 40 : 80,
                    comboPadding: [10, 50, 10, 50],
                    nodesep: horizontal ? 40 : 80
                },
                defaultNode: {
                    type: 'card-node',
                    size: [180, 60],
                    anchorPoints: horizontal
                        ? [
                              [0, 0.5],
                              [1, 0.5]
                          ]
                        : [
                              [0.5, 0],
                              [0.5, 1]
                          ]
                },
                defaultEdge: {
                    type: 'polyline',
                    size: 1,
                    color: 'black',
                    labelCfg: {
                        autoRotate: true,
                        refY: -10
                    },
                    style: {
                        endArrow: {
                            path: 'M 0,0 L 8,4 L 8,-4 Z',
                            fill: '#e2e2e2'
                        },
                        radius: 50
                    }
                },
                edgeStateStyles: {
                    highlight: {
                        stroke: 'red' // 这个颜色可以根据个人喜好进行修改
                    }
                },
                nodeStateStyles: {
                    highlight: {
                        // stroke: 'red' // 这个颜色可以根据个人喜好进行修改
                        'main-box': {
                            stroke: 'black'
                        }
                    }
                },
                comboStateStyles: {
                    highlight: {
                        stroke: 'red'
                    }
                },
                defaultCombo: {
                    type: 'rect',
                    style: {
                        fillOpacity: 0.1,
                        fill: '#C4E3B2',
                        stroke: '#F6BD16',
                        radius: [8, 8, 0, 0]
                    }
                },
                plugins: [minimap]
            };
            if (graphs) {
                graphs.destroy();
                const newGraphs = new G6.Graph(graphConfigs);
                // setConfig(graphConfigs);
                setGraphs(newGraphs);
            } else {
                const graphs = new G6.Graph(graphConfigs);
                // setConfig(graphConfigs);
                setGraphs(graphs);
            }
        }, [horizontal, model]);
        // 选择框依赖
        useEffect(() => {
            // 节点已经被选中
            // 搜索框逻辑
            // 向上查找infodatas如果有就以那个节点的edges 获取ID，拿到edges作为逐层展开，
            // 如果一直没有就到最上级拿到最初始的那个，那个的edges是确定的
            if (infoDatas && selectResult) {
                console.log('selectResult', selectResult);
                let node = selectResult.name;
                const nodes = infoDatas.nodes;
                const expendnodes = [];
                while (node) {
                    if (nodes.get(node)) {
                        console.log('nodes.get(node)', nodes.get(node), selectResult.name, nodes);
                        setExpendnodes(expendnodes);
                        break;
                    } else {
                        // 向上一层,将每层要展开的nodes 存起来
                        node = node.substring(0, node.lastIndexOf('/'));
                        expendnodes.push(node);
                    }
                }
            }
        }, [selectResult]);
        // render graph 图
        useEffect(() => {
            if (!infoDatas || !graphs) {
                return;
            }
            // debugger
            RegisterNode(graphs);
            RegisterVirtuaNode(graphs);
            const data: Datas = {
                nodes: [],
                edges: [],
                combos: []
            };
            const infoData = infoDatas;
            getdata(data, infoData);
            graphs.on('node:dblclick', evt => {
                const node = nodeMap.get(evt.item._cfg.id);
                if (node && node.children_node.length) {
                    setLoading(true);
                    nodeClick(evt);
                }
            });
            graphs.on('node:click', e => {
                let item = e.item;
                graphs.setAutoPaint(false);
                graphs.getNodes().forEach(node => {
                    graphs.clearItemStates(node);
                    graphs.setItemState(node, 'dark', true);
                });
                graphs.setItemState(item, 'dark', false);
                graphs.setItemState(item, 'highlight', true);
                console.log('item', item);

                graphs.getEdges().forEach(edge => {
                    if (edge.getSource() === item) {
                        graphs.setItemState(edge.getTarget(), 'dark', false);
                        graphs.setItemState(edge.getTarget(), 'highlight', true);
                        graphs.setItemState(edge, 'highlight', true);
                        edge.toFront();
                    } else if (edge.getTarget() === item) {
                        graphs.setItemState(edge.getSource(), 'dark', false);
                        graphs.setItemState(edge.getSource(), 'highlight', true);
                        graphs.setItemState(edge, 'highlight', true);
                        edge.toFront();
                    } else {
                        graphs.setItemState(edge, 'highlight', false);
                    }
                });
                graphs.paint();
                graphs.setAutoPaint(true);
                label_info(item._cfg.id);
            });
            graphs.on('combo:click', e => {
                let item = e.item;
                graphs.setAutoPaint(false);
                graphs.getCombos().forEach(combo => {
                    graphs.clearItemStates(combo);
                    graphs.setItemState(combo, 'dark', true);
                });
                graphs.setItemState(item, 'dark', false);
                graphs.setItemState(item, 'highlight', true);
                graphs.getEdges().forEach(edge => {
                    console.log('edge.getSource()');
                    if (edge.getSource()._cfg.id === item._cfg.id + '-input') {
                        graphs.setItemState(edge.getTarget(), 'dark', false);
                        graphs.setItemState(edge.getTarget(), 'highlight', true);
                        graphs.setItemState(edge, 'highlight', true);
                        edge.toFront();
                    } else if (edge.getSource()._cfg.id === item._cfg.id + '-output') {
                        graphs.setItemState(edge.getTarget(), 'dark', false);
                        graphs.setItemState(edge.getTarget(), 'highlight', true);
                        graphs.setItemState(edge, 'highlight', true);
                        edge.toFront();
                    } else if (edge.getTarget()._cfg.id === item._cfg.id + '-input') {
                        graphs.setItemState(edge.getSource(), 'dark', false);
                        graphs.setItemState(edge.getSource(), 'highlight', true);
                        graphs.setItemState(edge, 'highlight', true);
                        edge.toFront();
                    } else if (edge.getTarget()._cfg.id === item._cfg.id + '-output') {
                        graphs.setItemState(edge.getSource(), 'dark', false);
                        graphs.setItemState(edge.getSource(), 'highlight', true);
                        graphs.setItemState(edge, 'highlight', true);
                        edge.toFront();
                    } else {
                        graphs.setItemState(edge, 'highlight', false);
                    }
                });
                graphs.paint();
                graphs.setAutoPaint(true);
                label_info(item._cfg.id);
            });
            graphs.data(data);
            console.log('finlydata1', data);
            graphs.render();
            console.log('graphs', graphs);
        }, [graphs]);
        // 选择框展开
        useEffect(()=>{
            if(!graphs) {
                return
            }
            // debugger
            console.log('infoDatas',infoDatas);
            graphs.on('node:dblclick', evt => {
                const node = nodeMap.get(evt.item._cfg.id);
                if (node && node.children_node.length) {
                    setLoading(true);
                    nodeClick(evt);
                }
            });
            graphs.on('combo:dblclick', (evt) => {
                console.log('combosevt', evt);
                const evts = evt.item._cfg;
                const infoData = infoDatas;
                // debugger
                const combstree = [];
                for (let value of infoDatas.combos.values()) {
                    const Level = evts.id.split('/').length;
                    const isInclude = value.id.includes(evts.id);
                    if (value.level > Level && isInclude) {
                        // 比他小的层级 并且在他的后代节点
                        combstree.push(value);
                    }
                }
                const newCombstree = combstree.sort((a, b) => {
                    return b.level - a.level;
                });
                console.log('newCombstree', newCombstree);
                newCombstree.forEach(combos => {
                    combosClick(combos.id, infoData, false);
                });
                combosClick(evts.id, infoData, true);
                const data: Datas = {
                    nodes: [],
                    edges: [],
                    combos: []
                };
                getdata(data, infoData);
                setInfoDatas(infoData);
                console.log('finlydata6', data);
                graphs.data(data);
                graphs.render();
                viewPort(evts.id);
            });
        },[infoDatas])
        useEffect(() => {
            if (!expendnodes.length || !graphs) {
                return;
            }
            setLoading(true);
            const newExpendnodes = expendnodes.reverse();
            console.log('newExpendnodes', newExpendnodes);
            const infoData = infoDatas;
            for (let i = 0; i < newExpendnodes.length; i++) {
                const name = newExpendnodes[i];
                nodeExpend(name, infoData);
            }
            setInfoDatas(infoData);
            const data: Datas = {
                nodes: [],
                edges: [],
                combos: []
            };
            getdata(data, infoData);
            graphs.data(data);
            graphs.render();
            viewPort(selectResult.name);
        }, [expendnodes]);
        useEffect(() => {
            if (!nodeMap) {
                return;
            }
            const infoData: any = {};
            infoData.nodes = new Map();
            infoData.edges = new Map();
            infoData.combos = new Map();
            getAllNodes('/', infoData);
            setAllNodes(infoData);
            console.log('infoDataExpends', infoData);
        }, [model, nodeMap]);
        useEffect(() => {
            if (!nodeMap) {
                return;
            }
            const infoData: any = {};
            infoData.nodes = new Map();
            infoData.edges = new Map();
            infoData.combos = new Map();
            if (nodeMap.get('/').children_node.length) {
                nodeMap.get('/').children_node.forEach(item => {
                    infoData.nodes.set(item, {
                        id: item,
                        label: item,
                        level: item.split('/').length
                    });
                });
            }
            setStartNodes(infoData);
            console.log('infoDataStarts', infoData);
        }, [model, nodeMap]);

        useEffect(() => {
            setTimeout(() => {
                if (allExpend !== null) {
                    if (allExpend) {
                        allExpends();
                    } else {
                        startExpends();
                    }
                }
            }, 500);
        }, [allExpend]);

        // ref 函数暴露
        useImperativeHandle(ref, () => ({
            toSVG() {
                graphs.downloadFullImage('graph', 'image/svg');
            },
            toPNG() {
                graphs.downloadFullImage('graph', 'image/png', {
                    backgroundColor: 'white',
                    padding: 50
                });
            },
            getModelData() {
                // debugger
                BuildModelData()
            }
        }));

        // modldata 弹窗

        const BuildModelData = ()=>{
            if (!nodeMap) {
                return;
            }
            const modelData = {
                groups: [
                    {
                        name: 'inputs',
                        properties: []
                    },
                    {
                        name: 'outputs',
                        properties: []
                    }
                ],
                properties: [
                    {
                        name: 'format',
                        values: [
                            {
                                value: 'PaddlePaddle'
                            }
                        ]
                    }
                ]
            };
            const inputnodes = [];
            const outputnodes = [];
            if (nodeMap.get('/').children_node.length) {
                nodeMap.get('/').children_node.forEach(item => {
                    const node = nodeMap.get(item);
                    if (node.children_node.length === 0 && node.output_nodes.length === 0) {
                        // 输出节点
                        inputnodes.push(item);
                    } else if (node.children_node.length === 0 && node.input_nodes.length === 0) {
                        // 输入节点
                        outputnodes.push(item);
                    }
                });
            }
            inputnodes.forEach((name,index) => {
                const node =  nodeMap.get(name);
                const properties = {
                    name: index, // 输入节点的个数
                    values: [
                        // 输入节点的input_vars的个数
                    ]
                };
                // debugger
                Object.keys(node.input_vars).forEach((item)=>{
                    node.input_vars[item].forEach(item => {
                        const attr = attrMap.get(item);
                        const vars = {
                            children: [
                                // 对应vars
                                {
                                    name: 'type', // 固定
                                    value: attr.type, //type值, // 对应types
                                    type: 'code' // 固定
                                }
                            ],
                            name: 'name',
                            value: item // input_var
                        }
                        properties.values.push(vars)
                    });
                })
                modelData.groups[0].properties.push(properties);
            });
            outputnodes.forEach((name,index) => {
                const node =  nodeMap.get(name);
                const properties = {
                    name: index, // 输入节点的个数
                    values: [
                        // 输入节点的input_vars的个数
                    ]
                };
                // debugger
                Object.keys(node.output_vars).forEach((item)=>{
                    node.output_vars[item].forEach(item => {
                        const attr = attrMap.get(item);
                        const vars = {
                            children: [
                                // 对应vars
                                {
                                    name: 'type', // 固定
                                    value: attr.type, //type值, // 对应types
                                    type: 'code' // 固定
                                }
                            ],
                            name: 'name',
                            value: item // input_var
                        }
                        properties.values.push(vars)
                    });
                })
                modelData.groups[1].properties.push(properties);
            });
            console.log('modelDataes',modelData);
            getModelData(modelData);
        }
        // 获取所有节点
        const getAllNodes = (path: string, infoData: any) => {
            const node = nodeMap.get(path);
            if (node.children_node.length) {
                node.children_node.forEach(item => {
                    const children_node = nodeMap.get(item);
                    if (children_node.children_node.length) {
                        const combos = {
                            id: children_node.name,
                            label: children_node.name,
                            level: children_node.name.split('/').length
                        };
                        if (children_node.parent_node !== '/') {
                            combos.parentId = children_node.parent_node;
                        }
                        infoData.combos.set(children_node.name, combos);
                        getAllNodes(children_node.name, infoData);
                    } else {
                        infoData.nodes.set(item, {
                            id: item,
                            label: item,
                            level: item.split('/').length
                        });
                    }
                });
            }
        };
        // 侧边栏展示
        const label_info = (id: string) => {
            const nodeData = {
                groups: [
                    {
                        name: 'attributes',
                        properties: []
                    },
                    {
                        name: 'inputs', //在这个节点inputvars中取值
                        properties: []
                    },
                    {
                        name: 'outputs',
                        properties: []
                    }
                ],
                metadata: [],
                properties: []
            };
            const node = nodeMap.get(id);
            nodeData.properties.push({
                name: 'type',
                values: [
                    {
                        documentation: false,
                        value: node.type
                    }
                ]
            });
            Object.keys(node.attrs).forEach(item => {
                const nodeattr = {
                    name: item, // node attr 属性名
                    values: []
                };
                if (isArray(node.attrs[item]) && node.attrs[item].length > 0) {
                    node.attrs[item].forEach(value => {
                        nodeattr.values.push({
                            value: value, // node attr 属性值
                            children: [
                                {
                                    name: 'type', // 固定
                                    value: typeof value === 'number' ? 'int32' : typeof value, // 由value值的类型判断 数字 int32  文字 string
                                    type: 'code' // 固定
                                }
                            ]
                        });
                    });
                } else {
                    nodeattr.values.push({
                        value: node.attrs[item], // node attr 属性值
                        children: [
                            {
                                name: 'type', // 固定
                                value: typeof node.attrs[item] === 'number' ? 'int32' : typeof node.attrs[item], // 由value值的类型判断 数字 int32  文字 string
                                type: 'code' // 固定
                            }
                        ]
                    });
                }
                nodeData.groups[0].properties.push(nodeattr);
            });
            Object.keys(node.input_vars).forEach(item => {
                const nodeVar = {
                    name: item, // node attr 属性名
                    values: []
                };
                node.input_vars[item].forEach(item => {
                    const attr = attrMap.get(item);
                    nodeVar.values.push({
                        name: 'name', // 固定
                        value: attr.name, // x找到的attrs对应的名字
                        children: [
                            {
                                name: 'type', // 固定
                                value: attr.type, //type值
                                type: 'code' // 固定
                            }
                        ]
                    });
                });
                nodeData.groups[1].properties.push(nodeVar);
            });
            Object.keys(node.output_vars).forEach(item => {
                const nodeVar = {
                    name: item, // node attr 属性名
                    values: []
                };
                node.output_vars[item].forEach(item => {
                    const attr = attrMap.get(item);
                    nodeVar.values.push({
                        name: 'name', // 固定
                        value: attr.name, // x找到的attrs对应的名字
                        children: [
                            {
                                name: 'type', // 固定
                                value: attr.type, //type值
                                type: 'code' // 固定
                            }
                        ]
                    });
                });
                nodeData.groups[2].properties.push(nodeVar);
            });
            getNodeData(nodeData);
        };

        // 搜索框逐层展开
        const combosClick = async (Id: any, infoData: any, tag: boolean) => {
            const evts = graphs.findById(Id)._cfg;
            // 将combos身上的edge 还原到node节点上
            // 删除combos下的节点 除了 node 节点外 还需要删除combos节点
            console.log('evtsNodes', evts.nodes);
            console.log('edge._cfg.model', evts);
            for (let index = 0; index < evts.nodes.length; index++) {
                const node = evts.nodes[index]._cfg;
                // graphs.removeItem(node.id);
                infoData.nodes.delete(node.id);
            }
            for (let value of infoData.combos.values()) {
                const combos = value;
                if (combos.id === evts.id) {
                    infoData.combos.delete(value.id);
                    const node = {
                        id: evts.id,
                        label: evts.id,
                        level: evts.id.split('/').length
                    };
                    if (evts.model.parentId) {
                        node.comboId = evts.model.parentId;
                    }
                    if (tag) {
                        infoData.nodes.set(node.id, node);
                    }
                    break;
                }
            }
            graphs.removeItem(evts.id);
        };

        // 叶子节点点击事件
        const nodeClick = (evt: any) => {
            console.log('evts', evt);
            if (evt.item._cfg.currentShape === 'card-node') {
                const infoData = infoDatas;
                nodeExpend(evt.item._cfg.id, infoData);
                setInfoDatas(infoData);
                const data: Datas = {
                    nodes: [],
                    edges: [],
                    combos: []
                };
                getdata(data, infoData);
                console.log('finlydata2', data);
                graphs.data(data);
                graphs.render();
                viewPort(evt.item._cfg.id);
            }
        };
        // 全展开
        const allExpends = () => {
            const infoData = allNodes;
            const data: Datas = {
                nodes: [],
                edges: [],
                combos: []
            };
            getdata(data, infoData);
            console.log('finlydataall', allNodes);
            setInfoDatas(allNodes);
            graphs.data(data);
            graphs.render();
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };
        // 全缩回
        const startExpends = () => {
            const infoData = startNodes;
            const data: Datas = {
                nodes: [],
                edges: [],
                combos: []
            };
            getdata(data, infoData);
            console.log('finlydataall', data);
            setInfoDatas(startNodes);
            graphs.data(data);
            graphs.render();
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };
        // 节点聚焦事件
        const viewPort = (Id: string) => {
            setTimeout(() => {
                const node = graphs.findById(Id);
                console.log('viewPort', node, graphs.findById(Id));
                if (node) {
                    graphs.focusItem(Id);
                }
            }, 0);
            setLoading(false);
        };

        // 节点展开
        const nodeExpend = (name: string, infoData: any) => {
            const node = nodeMap.get(name);
            if (!node || !node.children_node.length) {
                return;
            }
            if (node && node.children_node.length) {
                // 如果节点下面存在子节点 则将节点更改combos
                for (let value of infoDatas.nodes.values()) {
                    const nodes = value;
                    if (nodes.id === name) {
                        infoData.nodes.delete(nodes.id);
                        const combos = {
                            id: node.name,
                            label: node.name,
                            level: node.name.split('/').length
                        };
                        if (node.parent_node !== '/') {
                            combos.parentId = node.parent_node;
                        }
                        infoData.combos.set(node.name, combos);
                        break;
                    }
                }
                infoData.nodes.set(node.name + '-input', {
                    id: node.name + '-input',
                    label: node.name + '-input',
                    type: 'virtual-node',
                    comboId: node.name
                });
                infoData.nodes.set(node.name + '-output', {
                    id: node.name + '-output',
                    label: node.name + '-output',
                    type: 'virtual-node',
                    comboId: node.name
                });
                node.children_node.forEach(item => {
                    // 构建子节点之间的关系
                    infoData.nodes.set(item, {
                        id: item,
                        label: item,
                        comboId: node.name,
                        level: node.name.split('/').length
                    });
                });
            }
        };

        // render前数据处理
        const getdata = (data: Datas, infoData: any) => {
            const edges: any[] = [];
            const nodes: any[] = [];
            const combos: any[] = [];
            const nodeObjects = {a: 1};
            nodes.push({
                id: '/feed_0',
                label: '/feed_0'
            });
            edgeTree('/feed_0', edges, nodes, combos, nodeObjects, infoData);
            console.log('finlyedges', edges);
            data.edges = edges;
            data.nodes = nodes;
            data.combos = combos;
            return data;
        };

        // 数据处理树构建
        const edgeTree = (name: string, edges: any[], nodes: any[], combos: any[], nodeObject: any, infoData: any) => {
            // 先行判断rootNode 是否叶子或者非叶子节点
            const rootNode = nodeMap.get(name);
            let from_node = rootNode && rootNode.name;
            const arrays = rootNode.edge_output_nodes;
            if (arrays.length) {
                // 如果没有输出节点了那么就代表这个支线走完了
                arrays.forEach(node => {
                    // 存在于nodes中，那么此时就是叶子节点
                    const path = rootNode.name + node;
                    const edge = edgeMap.get(path);
                    // 进行一次判断 如果这些存在于自己的子级那么就用input去指，如果不存在则换为out去指
                    let isChildren = rootNode.children_node.indexOf(node);
                    if (isChildren === -1) {
                        if (infoData.combos.get(rootNode.name)) {
                            from_node = rootNode.name + '-output';
                        } else {
                            from_node = rootNode.name;
                        }
                    } else {
                        if (infoData.combos.get(rootNode.name)) {
                            from_node = rootNode.name + '-input';
                        } else {
                            from_node = rootNode.name;
                        }
                    }
                    if (infoData.nodes.get(node)) {
                        edges.push({
                            source: from_node,
                            target: node,
                            label: edge.label
                        });
                        if (!nodeObject.hasOwnProperty(node)) {
                            nodeObject[node] = true;
                            const combo = nodeMap.get(node)?.parent_node;
                            nodes.push({
                                id: node,
                                label: node,
                                comboId: combo
                            });
                            edgeTree(node, edges, nodes, combos, nodeObject, infoData);
                        }
                    } else if (infoData.combos.get(node)) {
                        // 存在于nodes中，那么此时就是非叶子节点
                        // 此时进行两个判断 是否是自己的父节点，如果是父节点那么指向父节点output,如果不是那么就指向这个combos的input
                        const path = rootNode.name + node;
                        const edge = edgeMap.get(path);
                        if (infoData.combos.get(node).id === rootNode.parent_node) {
                            let to_node = node + '-output';
                            edges.push({
                                source: from_node,
                                target: to_node,
                                label: edge.label
                            });
                        } else {
                            let to_node = node + '-input';
                            edges.push({
                                source: from_node,
                                target: to_node,
                                label: edge.label
                            });
                        }
                        if (!nodeObject.hasOwnProperty(node)) {
                            nodeObject[node] = true;
                            const combo = {
                                id: node,
                                label: node
                            };
                            if (nodeMap.get(node)?.parent_node !== '/') {
                                combo.parentId = nodeMap.get(node)?.parent_node;
                            }
                            combos.push(combo);
                            nodes.push({
                                id: node + '-output',
                                label: node + '-output',
                                type: 'virtual-node',
                                comboId: node
                            });
                            nodes.push({
                                id: node + '-input',
                                label: node + '-output',
                                type: 'virtual-node',
                                comboId: node
                            });
                            edgeTree(node, edges, nodes, combos, nodeObject, infoData);
                        }
                    }
                    // const ischildNodes = nodeMap.get(node)?.children_node && infoData.nodes.get(node)
                    const childNodes = nodeMap.get(node)?.children_node;
                    if (childNodes && childNodes.length > 0) {
                        childNodes.forEach(node => {
                            if (infoData.nodes.get(node)) {
                                const isRoot = nodeMap.get(node).edge_input_nodes.length;
                                if (!isRoot) {
                                    // ，没有输入只有输出小型跟节点
                                    if (!nodeObject.hasOwnProperty(node)) {
                                        nodeObject[node] = true;
                                        const combo = nodeMap.get(node)?.parent_node;
                                        nodes.push({
                                            id: node,
                                            label: node,
                                            comboId: combo
                                        });
                                        edgeTree(node, edges, nodes, combos, nodeObject, infoData);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        };
        const content = useMemo(() => {
            console.log('loading', loading, rendered);
            if (loading) {
                return (
                    <Loading>
                        <HashLoader size="60px" color={primaryColor} />
                    </Loading>
                );
            }
            if (!runs && !loading) {
                return uploader;
            }
            // return null;
        }, [loading, rendered, uploader, runs]);
        const RegisterNode = (graph: any) => {
            G6.registerNode('card-node', {
                drawShape: function drawShape(cfg, group) {
                    let title = '';
                    if (cfg.type === 'card-node') {
                        const name = cfg.id.substring(cfg.id.lastIndexOf('/') + 1);
                        title = name;
                        const node = nodeMap.get(cfg.id);
                        console.log('nodecfg', cfg.id, node);
                        const color = '#E49D6D';
                        const r = 8;
                        const shape = group.addShape('rect', {
                            attrs: {
                                x: -90,
                                y: -30,
                                width: 180,
                                height: 60,
                                stroke: color,
                                radius: r
                            },
                            name: 'main-box',
                            draggable: true
                        });

                        group.addShape('rect', {
                            // 头部
                            attrs: {
                                x: -90,
                                y: -30,
                                width: 180,
                                height: 30,
                                fill: color,
                                radius: [r, r, 0, 0]
                            },
                            name: 'title-box',
                            draggable: true
                        });
                        if (node && node.children_node.length) {
                            group.addShape('text', {
                                // 头部
                                attrs: {
                                    textBaseline: 'top',
                                    x: 70,
                                    y: -25,
                                    fontSize: 20,
                                    text: '+',
                                    fill: 'white'
                                },
                                name: `index-button`
                            });
                        }
                        group.addShape('text', {
                            attrs: {
                                textBaseline: 'top',
                                x: -63,
                                y: -20,
                                text: title,
                                fill: 'rgba(0,0,0, 0.4)',
                                radius: [0, 0, r, r]
                            },
                            name: `index-title`
                        });
                        group.addShape('text', {
                            attrs: {
                                textBaseline: 'top',
                                x: -63,
                                y: 5,
                                text: 'Filter (32 x 3 x 3 x 3)',
                                fill: 'rgba(0,0,0, 0.4)',
                                radius: [0, 0, r, r]
                            },
                            name: `index-title`
                        });
                        return shape;
                    }
                }
            });
        };
        const RegisterVirtuaNode = (graph: any) => {
            G6.registerNode('virtual-node', {
                options: {
                    size: [10, 10]
                },
                drawShape: function drawShape(cfg, group) {
                    let title = '';
                    if (cfg.type === 'virtual-node') {
                        const name = cfg.id.substring(cfg.id.lastIndexOf('/') + 1);
                        title = name;
                    }
                    const color = '#E49D6D';
                    const r = 8;
                    const shape = group.addShape('ellipse', {
                        attrs: {
                            rx: 1,
                            ry: 1,
                            fill: '#000'
                        },
                        name: 'virtual-box',
                        draggable: true
                    });
                    return shape;
                }
            });
        };
        return (
            <Wrapper>
                {runs ? content : <div></div>}
                <RenderContent show={!loading && runs}>
                    <Toolbox
                        items={[
                            {
                                icon: 'zoom-in',
                                tooltip: t('graph:zoom-in')
                                // onClick: () => dispatch('zoom-in')
                            },
                            {
                                icon: 'zoom-out',
                                tooltip: t('graph:zoom-out')
                                // onClick: () => dispatch('zoom-out')
                            },
                            {
                                icon: 'restore-size',
                                tooltip: t('graph:restore-size'),
                                onClick: () => {
                                    setLoading(true);
                                    if (!allExpend) {
                                        setAllExpend(true);
                                    } else {
                                        setAllExpend(false);
                                    }
                                }
                            }
                        ]}
                        reversed
                        tooltipPlacement="bottom"
                    />
                    <Content>
                        <div id="container" ref={refs} style={{width: '100%', height: '100%'}}></div>
                        <div id="app-minimap" className="miniapp" />
                    </Content>
                </RenderContent>
            </Wrapper>
        );
    }
);

Graphs.displayName = 'Graphs';

export default Graphs;
