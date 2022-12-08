/* eslint-disable prettier/prettier */
import styled from 'styled-components';
import React, {useState, useEffect, useRef, useCallback, useMemo, FunctionComponent} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import {Graph, Shape} from '@antv/x6';
import {Modal} from 'antd';
// import dagre from 'dagre';
import {DagreLayout} from '@antv/layout';
import {Stencil} from '@antv/x6-plugin-stencil';
import {Transform} from '@antv/x6-plugin-transform';
import {Selection} from '@antv/x6-plugin-selection';
import {Snapline} from '@antv/x6-plugin-snapline';
import {Keyboard} from '@antv/x6-plugin-keyboard';
import {Clipboard} from '@antv/x6-plugin-clipboard';
import {DownOutlined} from '@ant-design/icons';
import {Tree} from 'antd';
import {fetcher} from '~/utils/fetch';
import type {DataNode, TreeProps} from 'antd/es/tree';
import {Dnd} from '@antv/x6-plugin-dnd';
import {History} from '@antv/x6-plugin-history';
import {MinusCircleOutlined, PlusOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {Button, Form, Input, Select, Space} from 'antd';
// import netron from '@visualdl/netron3';
// import {use} from 'chai';
// import { model } from '../../store/graph/selectors';
// import ref from '../../../types/static';
import {height} from '../Select';
const Content = styled.div`
    height: 100%;
    #container {
        height: 100%;
        display: flex;
        border: 1px solid #dfe3e8;
        .custom-html {
            width: 100%;
            height: 100%;
            border-radius: 1em;
            perspective: 600px;
            text-align: center;
            line-height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-shadow: 0 0.125em 0.3125em rgba(0, 0, 0, 0.25), 0 0.02125em 0.06125em rgba(0, 0, 0, 0.25);
        }
    }
    #stencil_content {
        width: 180px;
        height: 100%;
        position: relative;
        border-right: 1px solid #dfe3e8;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        border-left: 1px solid #dfe3e8;
        .stencli_select {
            height: 50px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid #dfe3e8;
        }
        #stencil {
            height: 80%;
            .dnd-rect {
                width: 100px;
                height: 40px;
                border: 1px solid #8f8f8f;
                border-radius: 6px;
                text-align: center;
                line-height: 40px;
                margin: 16px;
                cursor: move;
            }
        }
        #buttonContent {
            display: flex;
            position: absolute;
            width: 100%;
            bottom: 1%;
            display: flex;
            justify-content: center;
        }
    }
    #graph-container {
        width: calc(100% - 180px);
        height: 100%;
    }
    .x6-widget-stencil {
        background-color: #fff;
    }
    .x6-widget-stencil-title {
        background-color: #fff;
    }
    .x6-widget-stencil-group-title {
        background-color: #fff !important;
    }
    .x6-widget-transform {
        margin: -1px 0 0 -1px;
        padding: 0px;
        border: 1px solid #239edd;
    }
    .x6-widget-transform > div {
        border: 1px solid #239edd;
    }
    .x6-widget-transform > div:hover {
        background-color: #3dafe4;
    }
    .x6-widget-transform-active-handle {
        background-color: #3dafe4;
    }
    .x6-widget-transform-resize {
        border-radius: 0;
    }
    .x6-widget-selection-inner {
        border: 1px solid #239edd;
    }
    .x6-widget-selection-box {
        opacity: 0;
    }
`;
const SelectContent = styled.div`
    height: 50px;
    width: 100%;
    display: flex;
    align-items: center;
    .ant-select {
        .ant-select-selector {
            height: 100%;
            border: none;
            .ant-select-selection-placeholder {
                line-height: 50px;
            }
            .ant-select-selection-item {
                line-height: 50px;
            }
        }
    }
`;
const Buttons = styled.div`
    height: 2.5714285714285716rem;
    line-height: 2.5714285714285716rem;
    text-align: center;
    font-size: 16px;
    margin-left: 2px;
    width: 86px;
    color: white;
    background-color: var(--navbar-background-color);
`;
const {Option} = Select;

const areas = [
    {label: 'Beijing', value: 'Beijing'},
    {label: 'Shanghai', value: 'Shanghai'}
];

const sights = {
    Beijing: ['Tiananmen', 'Great Wall'],
    Shanghai: ['Oriental Pearl', 'The Bund']
};
const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 16}
};
type SightsKeys = keyof typeof sights;
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

let IFRAME_HOST = `${window.location.protocol}//${window.location.host}`;
if (PUBLIC_PATH.startsWith('http')) {
    const url = new URL(PUBLIC_PATH);
    IFRAME_HOST = `${url.protocol}//${url.host}`;
}
const dataType = [
    'TYPE_BOOL',
    'TYPE_UINT8',
    'TYPE_UINT16',
    'TYPE_UINT32',
    'TYPE_UINT64',
    'TYPE_INT8',
    'TYPE_INT16',
    'TYPE_INT32',
    'TYPE_INT64',
    'TYPE_FP16',
    'TYPE_FP32',
    'TYPE_FP64',
    'TYPE_STRING',
    'TYPE_BF16'
];
type ArgumentProps = {
    modelData: any;
    dirValue?: any;
    ChangeServerId?: any;
};
const index: FunctionComponent<ArgumentProps> = ({modelData, dirValue, ChangeServerId}) => {
    // #region 初始化图形
    const [ModelDatas, setModelDatas] = useState<any>(modelData);
    const [flag, setFlag] = useState<boolean>();
    const [flag2, setFlag2] = useState<boolean>();
    const [Dnds, setDnds] = useState<any>();
    const [graphs, setGraphs] = useState<Graph>();
    const [edgeMaps, setEdgeMaps] = useState<any>({});
    const [configs, setConfigs] = useState<any>({
        'model-repository': 'yolov5_serving/models',
        'backend-config': 'python,shm-default-byte-size=10485760',
        'http-port': 8000,
        'grpc-port': 8001,
        'metrics-port': 8002
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);

    const dndContainerRef = useRef<HTMLInputElement | null>(null);
    const [graphModel, setGraphModel] = useState<any>();
    const [modelName, setModelName] = useState<string>();

    const [IsEmsembles, setIsEmsembles] = useState<boolean>();
    const [showFlag, setShowFlag] = useState<boolean>(false);
    const [selectOptions, setSelectOptions] = useState([]);
    // const [ensembles, setEmsembles] = useState<string>();
    const [steps, setSteps] = useState<any>();
    const [nodeClick, setNodeClick] = useState<any>();

    const [ensemblesName, setEnsemblesName] = useState<string>();

    const iframe = useRef<HTMLIFrameElement>(null);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();

    console.log('form', form.getFieldsValue(true));

    const [treeData, setTreeData] = useState(modelData.ensembles?.versions);
    const ports = {
        groups: {
            top: {
                position: 'top',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            },
            right: {
                position: 'right',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            },
            bottom: {
                position: 'bottom',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            },
            left: {
                position: 'left',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            }
        },
        items: [
            // {
            //     id: 'top',
            //     group: 'top'
            // },
            {
                id: 'right',
                group: 'right'
            },
            // {
            //     id: 'bottom',
            //     group: 'bottom'
            // },
            {
                id: 'left',
                group: 'left'
            }
        ]
    };
    useEffect(() => {
        const graph = new Graph({
            container: document.getElementById('graph-container')!,
            grid: true,
            mousewheel: {
                enabled: true,
                zoomAtMousePosition: true,
                minScale: 0.5,
                maxScale: 3
                // modifiers: ['ctrl', 'meta']
            },
            panning: true,
            // scroller: {
            //     enabled: true,
            //     pannable: true,
            //     pageVisible: true,
            //     pageBreak: false
            // },
            connecting: {
                router: {
                    name: 'manhattan',
                    args: {
                        padding: 1
                    }
                },
                connector: {
                    name: 'rounded',
                    args: {
                        radius: 8
                    }
                },
                anchor: 'center',
                connectionPoint: 'anchor',
                allowBlank: false,
                snap: {
                    radius: 20
                },
                createEdge() {
                    return new Shape.Edge({
                        attrs: {
                            line: {
                                stroke: '#A2B1C3',
                                strokeWidth: 2,
                                targetMarker: {
                                    name: 'block',
                                    width: 12,
                                    height: 8
                                }
                            }
                        },
                        zIndex: 0
                    });
                },
                validateConnection({targetMagnet}) {
                    return !!targetMagnet;
                }
            },
            highlighting: {
                magnetAdsorbed: {
                    name: 'stroke',
                    args: {
                        attrs: {
                            fill: '#5F95FF',
                            stroke: '#5F95FF'
                        }
                    }
                }
            }
        });
        Graph.registerEdge(
            'custom-edge', // 边名称
            {
                // 基类
                inherit: 'edge',
                // 属性样式
                attrs: {
                    line: {
                        stroke: '#5755a1'
                    }
                },
                // 默认标签
                defaultLabel: {
                    markup: [
                        {
                            tagName: 'rect',
                            selector: 'body'
                        },
                        {
                            tagName: 'text',
                            selector: 'label'
                        }
                    ],
                    attrs: {
                        label: {
                            fill: 'black',
                            fontSize: 14,
                            textAnchor: 'middle',
                            textVerticalAnchor: 'middle',
                            pointerEvents: 'none'
                        },
                        body: {
                            ref: 'label',
                            fill: 'white',
                            stroke: '#5755a1',
                            strokeWidth: 2,
                            rx: 4,
                            ry: 4,
                            refWidth: '140%',
                            refHeight: '140%',
                            refX: '-20%',
                            refY: '-20%'
                        }
                    },
                    position: {
                        distance: 100, // 绝对定位
                        options: {
                            absoluteDistance: true
                        }
                    }
                },
                tools: ['vertices', 'segments']
            }
        );
        // const dnd = new Dnd({
        //     target: graph,
        //     scaled: false,
        //     dndContainer: dndContainerRef.current
        // });
        // setDnds(dnd);
        graph.on('node:dblclick', ({node}) => {
            // reset()
            // node.attr('body/stroke', 'orange')；
            console.log('nodesss', node, modelData.models);
            for (const model of modelData.models) {
                if (model.name === node.id) {
                    setNodeClick({
                        name: model.name,
                        data: model
                    });
                    return;
                }
            }
        });
        setGraphs(graph);
        setFlag(true);
        // form.setFieldsValue(modelss);
        // onFill(modelData.models[0]);
    }, []);
    useEffect(() => {
        if (!flag || !graphs) {
            return;
        }
        graphPlug(graphs);
    }, [flag]);
    useEffect(() => {
        if (flag2 && graphs) {
            graphRegion(graphs);
        }
    }, [flag2]);
    useEffect(() => {
        if (!modelData) {
            return;
        }
        console.log('modelData.ensembles', modelData.ensembles);
        const SelectOptions = modelData.ensembles?.map((ensembles: any) => {
            return {
                value: ensembles.name,
                label: ensembles.name
            };
        });
        setEnsemblesName(modelData.ensembles[0]?.name);
        setSelectOptions(SelectOptions);
    }, [modelData]);
    useEffect(() => {
        if (!ensemblesName) {
            return;
        }
        console.log('modelData.ensembles', modelData.ensembles);
        const ensembles = modelData.ensembles?.filter((ensembles: any) => {
            if (ensembles.name === ensemblesName) {
                return ensembles;
            }
        });
        setSteps(ensembles[0]?.step);
        setTreeData(ensembles[0]?.versions);
    }, [ensemblesName]);
    useEffect(() => {
        if (!flag || !steps) {
            return;
        }
        const edgeMap: any = {};

        steps?.map((node: any) => {
            const inputs = node.inputModels;
            for (const input of inputs) {
                let tuple = edgeMap[input];
                if (!tuple) {
                    tuple = {from: [], to: []};
                    edgeMap[input] = tuple;
                }
                tuple.to.push(node.modelName);
            }
            const outputs = node.outputModels;
            for (const output of outputs) {
                let tuple = edgeMap[output];
                if (!tuple) {
                    tuple = {from: [], to: []};
                    edgeMap[output] = tuple;
                }
                tuple.from.push(node.modelName);
            }
        });

        console.log('edgeMap', edgeMap);
        const edges = [];
        const nodes = [];
        for (const name of Object.keys(edgeMap)) {
            // Shape.HTML.register({
            //     shape: name,
            //     width: 60,
            //     height: 40,
            //     html() {
            //         const div = document.createElement('div');
            //         const textNode = document.createTextNode(name);
            //         div.className = 'custom-html';
            //         div.appendChild(textNode);
            //         return div;
            //     }
            // });
            nodes.push({
                id: `${name}`,
                width: 60,
                height: 40,
                label: name
            });
            const node = edgeMap[name];
            for (const output of node.to) {
                // edges.push([name, output]);
                edges.push({
                    source: name,
                    target: output
                });
            }
            console.log('nodes', nodes);
            console.log('edges', edges);
            // const dagreLayout = new DagreLayout({
            //     type: 'dagre',
            //     rankdir: 'BT',
            //     align: 'UR',
            //     ranksep: 35,
            //     nodesep: 15,
            //     controlPoints: true
            // });
            // const data = {
            //     edges: edges,
            //     nodes: nodes
            // };
            // const model = dagreLayout.layout(data);
            // console.log('model', model);
        }

        const nodeEdges = [];
        for (const edge of edges) {
            nodeEdges.push({
                source: {cell: edge.source, port: 'right'},
                target: {cell: edge.target, port: 'left'},
                shape: 'custom-edge',
                tools: ['vertices', 'segments']
            });
        }
        const edgeMaps: any = {};
        for (const edge of Object.keys(edgeMap)) {
            edgeMaps[edge] = edgeMap[edge].from.length;
        }
        console.log('edgeMaps', edgeMaps);
        const edgeMaps2: any = {};
        for (const edge of Object.keys(edgeMaps)) {
            let level = edgeMaps[edge];
            // 自身的等级

            // 自身的输入
            const map = edgeMap[edge].from;
            for (const edge of map) {
                level += edgeMaps[edge];
            }
            edgeMaps2[edge] = level;
        }
        console.log('edgeMaps2', edgeMaps2);
        const nodess: any = [];
        for (let index = 0; index < nodes.length; index++) {
            const node = nodes[index];
            Shape.HTML.register({
                shape: node.id,
                width: 60,
                height: 40,
                html() {
                    const div = document.createElement('div');
                    const textNode = document.createTextNode(node.id);
                    div.className = 'custom-html';
                    div.appendChild(textNode);
                    return div;
                }
            });
            const HtmlNode = graphs?.createNode({
                id: node.id,
                shape: node.id,
                size: {
                    width: 60,
                    height: 40
                },
                x: 300 + edgeMaps2[node.id] * 120,
                y: 100,
                ports: ports
                // tools: ['button-remove']
            });
            nodess.push(HtmlNode);
        }
        console.log('nodess', nodess);
        graphs?.addEdges(nodeEdges);
        graphs?.addNodes(nodess);
    }, [steps, flag]);
    const graphPlug = (graph: any) => {
        graph.use(
            new Transform({
                resizing: true,
                rotating: true
            })
        );
        graph.use(
            new Selection({
                enabled: true,
                rubberband: true,
                showNodeSelectionBox: true
            })
        );
        graph.use(
            new Snapline({
                enabled: true,
                sharp: true
            })
        );
        graph.use(
            new Keyboard({
                enabled: true
            })
        );
        graph.use(
            new Clipboard({
                enabled: true
            })
        );
        graph.use(
            new History({
                enabled: true
            })
        );
        setFlag2(true);
    };
    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
            ports[i].style.visibility = show ? 'visible' : 'hidden';
        }
    };
    const graphRegion = (graph: any) => {
        graph.bindKey(['meta+c', 'ctrl+c'], () => {
            const cells = graph.getSelectedCells();
            if (cells.length) {
                graph.copy(cells);
            }
            return false;
        });
        graph.bindKey(['meta+x', 'ctrl+x'], () => {
            const cells = graph.getSelectedCells();
            if (cells.length) {
                graph.cut(cells);
            }
            return false;
        });
        graph.bindKey(['meta+v', 'ctrl+v'], () => {
            if (!graph.isClipboardEmpty()) {
                const cells = graph.paste({offset: 32});
                graph.cleanSelection();
                graph.select(cells);
            }
            return false;
        });

        //undo redo
        graph.bindKey(['meta+z', 'ctrl+z'], () => {
            if (graph.canUndo()) {
                graph.undo();
            }
            return false;
        });
        graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
            if (graph.canRedo()) {
                graph.redo();
            }
            return false;
        });

        // select all
        graph.bindKey(['meta+a', 'ctrl+a'], () => {
            const nodes = graph.getNodes();
            if (nodes) {
                graph.select(nodes);
            }
        });

        //delete
        graph.bindKey('backspace', () => {
            const cells = graph.getSelectedCells();
            if (cells.length) {
                graph.removeCells(cells);
            }
        });

        // zoom
        graph.bindKey(['ctrl+1', 'meta+1'], () => {
            const zoom = graph.zoom();
            if (zoom < 1.5) {
                graph.zoom(0.1);
            }
        });
        graph.bindKey(['ctrl+2', 'meta+2'], () => {
            const zoom = graph.zoom();
            if (zoom > 0.5) {
                graph.zoom(-0.1);
            }
        });
        graph.on('node:mouseenter', () => {
            const container = document.getElementById('graph-container')!;
            const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
            showPorts(ports, true);
        });
        graph.on('node:mouseleave', () => {
            const container = document.getElementById('graph-container')!;
            const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
            showPorts(ports, false);
        });
    };
    const upModelData = (name: any, dir: string, config: any) => {
        let formBody: any = [];
        const details: any = {
            name: name,
            dir: dir,
            config: JSON.stringify(config)
        };
        for (const property in details) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + '=' + encodedValue);
        }
        formBody = formBody.join('&');
        // formData.append('name', name);
        // formData.append('dir', dir);
        // formData.append('config', JSON.stringify(config));
        fetcher(`/fastdeploy/config_update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody
        }).then(
            (res: any) => {
                console.log('blobres', res);
                // downloadEvt(res.data, fileName);
                setModelDatas(config);
                setIsModalOpen(false);
            },
            res => {
                console.log('blobres', res);
            }
        );
    };
    // const startDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    //     const target = e.currentTarget;
    //     const type = target.getAttribute('data-type');
    //     console.log('types', target, e);
    //     showModal();
    // };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        // onfinish();
        form?.validateFields()
            .then(values => {
                // setIsModalOpen(false);
                const ModelData = ModelDatas;
                const newcpuExecutionAccelerator = values.cpuExecutionAccelerator?.map((item: any, index: number) => {
                    // const parameters =
                    const newObject: any = {};
                    // newObject[item.key] = item.value;
                    if (item.parameters) {
                        for (const param of item.parameters) {
                            newObject[param['key']] = param['value'];
                        }
                    }

                    return {
                        name: item.name,
                        parameters: newObject
                    };
                });
                const newgpuExecutionAccelerator = values.gpuExecutionAccelerator?.map((item: any, index: number) => {
                    const newObject: any = {};
                    if (item.parameters) {
                        for (const param of item.parameters) {
                            newObject[param['key']] = param['value'];
                        }
                    }
                    return {
                        name: item.name,
                        parameters: newObject
                    };
                });
                if (IsEmsembles) {
                    console.log('values', values);

                    const emsembless = ModelDatas.ensembles?.map((ensembles: any) => {
                        if (ensembles.name === ensemblesName) {
                            const newemsembles = {
                                ...ensembles,
                                ...values,
                                optimization: {
                                    cpuExecutionAccelerator: newcpuExecutionAccelerator,
                                    gpuExecutionAccelerator: newgpuExecutionAccelerator
                                }
                            };

                            delete newemsembles['cpuExecutionAccelerator'];
                            delete newemsembles['gpuExecutionAccelerator'];
                            return newemsembles;
                        } else {
                            return ensembles;
                        }
                    });
                    ModelData.ensembles = emsembless;
                    // setModelDatas(ModelData);
                    console.log('ModelDatas', ModelData);

                    upModelData(ensemblesName, dirValue, ModelData);
                    // setIsModalOpen(false);
                } else {
                    const models = ModelData.models?.map((model: any) => {
                        if (model.name === modelName) {
                            const newmodel = {
                                ...model,
                                ...values,
                                optimization: {
                                    cpuExecutionAccelerator: newcpuExecutionAccelerator,
                                    gpuExecutionAccelerator: newgpuExecutionAccelerator
                                }
                            };
                            delete newmodel['cpuExecutionAccelerator'];
                            delete newmodel['gpuExecutionAccelerator'];
                            return newmodel;
                        } else {
                            return model;
                        }
                    });
                    // models.delete('cpuExecutionAccelerator');
                    // models.delete('gpuExecutionAccelerator');
                    ModelData.models = models;
                    console.log('ModelDatas', ModelData);
                    upModelData(modelName, dirValue, ModelData);
                    // setModelDatas(ModelData);
                }
            })
            .catch(errorInfo => {
                // console.log('errorInfo', errorInfo);
                // alert(errorInfo);
            });
    };
    const handleOk2 = () => {
        // console.log(111);
        // setIsModalOpen2(false);
        form2
            ?.validateFields()
            .then(values => {
                setConfigs(values);
                // const formData = new FormData();
                // const configs = JSON.stringify(values);
                // formData.append('config', configs);
                let formBody: any = [];
                const details: any = {
                    config: JSON.stringify(values)
                };
                for (const property in details) {
                    const encodedKey = encodeURIComponent(property);
                    const encodedValue = encodeURIComponent(details[property]);
                    formBody.push(encodedKey + '=' + encodedValue);
                }
                formBody = formBody.join('&');
                fetcher(`/fastdeploy/start_server`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    body: formBody
                }).then(
                    (res: any) => {
                        console.log('resss', res);
                        // ChangeServerId(res.id);
                        ChangeServerId(res);
                        setIsModalOpen2(false);
                    },
                    res => {
                        console.log(res);
                        setIsModalOpen2(false);
                    }
                );
            })
            .catch(errorInfo => {
                alert(errorInfo);
            });
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        if (nodeClick) {
            setNodeClick(undefined);
        }
    };
    const handleCancel2 = () => {
        setIsModalOpen2(false);
    };
    const onFinish = (values: any) => {
        console.log('Received values of form:', values);
    };

    const handleChange = () => {
        form.setFieldsValue({});
    };
    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };
    const onFill = (models: any) => {
        const newcpu = models?.optimization?.cpuExecutionAccelerator?.map((cpu: any) => {
            const attr = Object.keys(cpu);
            const attr2 = cpu[attr[1]] && Object.keys(cpu[attr[1]]);
            const parameters = attr2?.map((key: any) => {
                return {
                    key: key,
                    value: cpu?.parameters?.[key]
                };
            });
            return {
                name: cpu.name,
                parameters: parameters
            };
        });

        const newgpu = models?.optimization?.gpuExecutionAccelerator?.map((gpu: any) => {
            const attr = Object.keys(gpu);
            const attr2 = gpu[attr[1]] && Object.keys(gpu[attr[1]]);
            const parameters = attr2?.map((key: any) => {
                return {
                    key: key,
                    value: gpu?.parameters?.[key]
                };
            });
            return {
                name: gpu.name,
                parameters: parameters
            };
        });

        const modelss = {
            ...models,
            cpuExecutionAccelerator: newcpu,
            gpuExecutionAccelerator: newgpu
        };
        form.setFieldsValue(modelss);
    };
    const onFill2 = (config: any) => {
        form2.setFieldsValue(config);
    };

    const getmodelData = (model: any, name: string) => {
        setModelName(name);
        setGraphModel(model);
        if (IsEmsembles) {
            setIsEmsembles(false);
        }
        const flag = !showFlag;
        setShowFlag(flag);
    };
    const changeEmsembles = (model: any) => {
        setIsEmsembles(true);
        setShowFlag(!showFlag);
        // setTreeData(model.ensembles.versions);
    };
    const EnsemblesNameChange = (value: string) => {
        setEnsemblesName(value);
    };
    useEffect(() => {
        if (!flag) {
            return;
        }
        showModal();
    }, [showFlag]);
    useEffect(() => {
        if (!nodeClick) {
            return;
        }
        getmodelData(nodeClick.data, nodeClick.name);
    }, [nodeClick]);
    useEffect(() => {
        if (isModalOpen) {
            if (!IsEmsembles) {
                graphModel && onFill(graphModel);
            } else {
                // modelData && onFill(modelData.ensembles[0]);
                for (const ensembles of modelData.ensembles) {
                    if (ensembles.name === ensemblesName) {
                        onFill(ensembles);
                        return;
                    }
                }
            }
        }
    }, [isModalOpen, graphModel, IsEmsembles]);
    useEffect(() => {
        if (isModalOpen2 && dirValue) {
            onFill2({
                'backend-config': configs['backend-config'],
                'metrics-port': configs['metrics-port'],
                'http-port': configs['http-port'],
                'grpc-port': configs['grpc-port'],
                'model-repository': dirValue
            });
        }
    }, [dirValue, isModalOpen2]);
    console.log('graphs', treeData);
    console.log('showFlag', showFlag);

    return (
        <Content
            style={{
                height: '100%',
                width: '100%'
            }}
        >
            <div id="container">
                <div id="graph-container"></div>
                <div id="stencil_content">
                    <div className="stencli_select">
                        <SelectContent>
                            <Select
                                style={{width: '100%', height: '50px'}}
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                // filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                value={ensemblesName}
                                options={selectOptions}
                                onChange={value => {
                                    EnsemblesNameChange(value);
                                }}
                            />
                        </SelectContent>
                    </div>
                    <div id="stencil" ref={dndContainerRef}>
                        {modelData &&
                            modelData.models?.map((model: any, index: number) => {
                                return (
                                    <div
                                        data-type={model.name}
                                        className="dnd-rect"
                                        key={model.name}
                                        // onMouseDown={startDrag}
                                        onClick={() => {
                                            getmodelData(model, model.name);
                                        }}
                                    >
                                        {model.name}
                                    </div>
                                );
                            })}
                    </div>
                    <div id="buttonContent">
                        <Buttons
                            style={{
                                position: 'absolute',
                                left: '-180px',
                                width: '160px'
                            }}
                            onClick={changeEmsembles}
                        >
                            ensemble配置
                        </Buttons>
                        <Buttons
                            style={{
                                width: '160px'
                            }}
                            onClick={() => {
                                setIsModalOpen2(true);
                            }}
                        >
                            启动服务
                        </Buttons>
                    </div>
                </div>
            </div>
            <Modal
                width={800}
                title={IsEmsembles ? '配置emsemble' : '配置模型'}
                visible={isModalOpen}
                cancelText={'取消'}
                okText={'更新'}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form {...layout} form={form} name="dynamic_form_complex" autoComplete="off">
                    <Form.Item
                        name="name"
                        label="name"
                        rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    {!IsEmsembles ? (
                        <Form.Item
                            name="backend"
                            label="backend"
                            rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                        >
                            <Input disabled={true} />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            name="platform"
                            label="platform"
                            rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                        >
                            <Input disabled={true} />
                        </Form.Item>
                    )}
                    {/* <Form.Item name="platform" label="platform" rules={[{required: true, message: 'Missing area'}]}>
                        <Input />
                    </Form.Item> */}
                    <Form.Item name="version" label="version">
                        <Tree
                            showLine
                            switcherIcon={<DownOutlined />}
                            defaultExpandedKeys={['0-0-0']}
                            onSelect={onSelect}
                            treeData={treeData}
                        />
                    </Form.Item>
                    <Form.Item
                        name="maxBatchSize"
                        label="maxBatchSize"
                        rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="input">
                        <Form.List name="input">
                            {(fields, {add, remove}) => (
                                <div>
                                    {fields?.map((field: any, index: number) => (
                                        <div key={field.key}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    marginBottom: '10px',
                                                    paddingTop: index ? '10px' : '40px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        marginRight: '10px'
                                                    }}
                                                >{`变量${index + 1}`}</div>
                                                {/* <MinusCircleOutlined onClick={() => remove(field.name)} /> */}
                                            </div>
                                            <div key={field.key}>
                                                <Form.Item
                                                    {...field}
                                                    label="name"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'name']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="dataType"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'dataType']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Select>
                                                        {/* {(sights[form.getFieldValue('area') as SightsKeys] || []).map(
                                                            item => (
                                                                <Option key={item} value={item}>
                                                                    {item}
                                                                </Option>
                                                            )
                                                        )} */}
                                                        {dataType?.map(item => (
                                                            <Option key={item} value={item}>
                                                                {item}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="dims"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'dims']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    ))}

                                    {/* <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add sights
                                        </Button>
                                    </Form.Item> */}
                                </div>
                            )}
                        </Form.List>
                    </Form.Item>
                    <div></div>
                    <Form.Item label="output">
                        <Form.List name="output">
                            {(fields2, {add, remove}) => (
                                <div>
                                    {fields2?.map((field: any, index: number) => (
                                        <div key={field.key}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    marginBottom: '10px',
                                                    paddingTop: index ? '10px' : '40px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        marginRight: '10px'
                                                    }}
                                                >{`变量${index + 1}`}</div>
                                                {/* <MinusCircleOutlined onClick={() => remove(field.name)} /> */}
                                            </div>
                                            <div key={field.key}>
                                                <Form.Item
                                                    {...field}
                                                    label="name"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'name']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="dataType"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'dataType']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Select>
                                                        {dataType?.map(item => (
                                                            <Option key={item} value={item}>
                                                                {item}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="dims"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'dims']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    ))}

                                    {/* <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add sights
                                        </Button>
                                    </Form.Item> */}
                                </div>
                            )}
                        </Form.List>
                    </Form.Item>
                    <Form.Item label="instance_group">
                        <Form.List name="instance_group">
                            {(fields3, {add, remove}) => (
                                <div>
                                    {fields3?.map((field: any, index: number) => (
                                        <div key={field.key}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    marginBottom: '10px',
                                                    paddingTop: index ? '10px' : '40px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        marginRight: '10px'
                                                    }}
                                                >{`变量${index + 1}`}</div>
                                                {/* <MinusCircleOutlined onClick={() => remove(field.name)} /> */}
                                            </div>
                                            <div key={field.key}>
                                                <Form.Item
                                                    {...field}
                                                    label="count"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'count']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="kind"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'kind']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    {/* <Select>
                                                        {(sights[form.getFieldValue('area') as SightsKeys] || []).map(
                                                            item => (
                                                                <Option key={item} value={item}>
                                                                    {item}
                                                                </Option>
                                                            )
                                                        )}
                                                    </Select> */}
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="gpus"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'gpus']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    ))}

                                    {/* <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add sights
                                        </Button>
                                    </Form.Item> */}
                                </div>
                            )}
                        </Form.List>
                    </Form.Item>
                    <Form.Item name="optimization" label="optimization">
                        <div>
                            <Form.List name="cpuExecutionAccelerator">
                                {(fields4, {add, remove}) => (
                                    <div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                marginBottom: '10px',
                                                paddingTop: '40px',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginRight: '10px'
                                                }}
                                            >{`cpuExecutionAccelerator`}</div>
                                            <PlusCircleOutlined onClick={() => add()} />
                                        </div>
                                        {fields4?.map(field => (
                                            <Space align="baseline" key={field.key}>
                                                <div>
                                                    <div
                                                        style={{
                                                            display: 'flex'
                                                        }}
                                                    >
                                                        <Form.Item
                                                            name={[field.name, 'name']}
                                                            fieldKey={[field.name, 'name']}
                                                            label={'name'}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: '该字段为必填项请填写对应信息'
                                                                }
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                        <MinusCircleOutlined
                                                            style={{
                                                                marginLeft: '10px',
                                                                marginTop: '10px'
                                                            }}
                                                            onClick={() => remove(field.name)}
                                                        />
                                                    </div>
                                                    <Form.Item>
                                                        <Form.List name={[field.name, 'parameters']} key={field.key}>
                                                            {(fields5, {add: addTest, remove: removeTest}) => (
                                                                <div
                                                                    style={{
                                                                        paddingLeft: '60px'
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            marginBottom: '10px'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                marginRight: '10px'
                                                                            }}
                                                                        >
                                                                            parameters
                                                                        </div>
                                                                        <PlusCircleOutlined onClick={() => addTest()} />
                                                                    </div>
                                                                    {fields5?.map(fields => (
                                                                        <Space align="baseline" key={fields.key}>
                                                                            <Form.Item
                                                                                {...fields}
                                                                                name={[fields.name, 'key']}
                                                                                fieldKey={[fields.name, 'key']}
                                                                                rules={[
                                                                                    {
                                                                                        required: true,
                                                                                        message:
                                                                                            '该字段为必填项请填写对应信息'
                                                                                    }
                                                                                ]}
                                                                            >
                                                                                <Input />
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                {...fields}
                                                                                name={[fields.name, 'value']}
                                                                                fieldKey={[fields.name, 'value']}
                                                                                rules={[
                                                                                    {
                                                                                        required: true,
                                                                                        message:
                                                                                            '该字段为必填项请填写对应信息'
                                                                                    }
                                                                                ]}
                                                                            >
                                                                                <Input />
                                                                            </Form.Item>
                                                                            <MinusCircleOutlined
                                                                                onClick={() => removeTest(fields.name)}
                                                                            />
                                                                        </Space>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </Form.List>
                                                    </Form.Item>
                                                </div>
                                            </Space>
                                        ))}
                                    </div>
                                )}
                            </Form.List>
                        </div>
                        <div>
                            <Form.List name="gpuExecutionAccelerator">
                                {(fields6, {add, remove}) => (
                                    <div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                marginBottom: '10px',
                                                paddingTop: '40px',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginRight: '10px'
                                                }}
                                            >{`gpuExecutionAccelerator`}</div>
                                            <PlusCircleOutlined onClick={() => add()} />
                                        </div>
                                        {fields6?.map(field => (
                                            <Space align="baseline" key={field.key}>
                                                <div>
                                                    <div
                                                        style={{
                                                            display: 'flex'
                                                        }}
                                                    >
                                                        <Form.Item
                                                            name={[field.name, 'name']}
                                                            fieldKey={[field.name, 'name']}
                                                            label={'name'}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: '该字段为必填项请填写对应信息'
                                                                }
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                        <MinusCircleOutlined
                                                            style={{
                                                                marginLeft: '10px',
                                                                marginTop: '10px'
                                                            }}
                                                            onClick={() => remove(field.name)}
                                                        />
                                                    </div>
                                                    <Form.Item>
                                                        <Form.List name={[field.name, 'parameters']} key={field.key}>
                                                            {(fields7, {add: addTest, remove: removeTest}) => (
                                                                <div
                                                                    style={{
                                                                        paddingLeft: '60px'
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            marginBottom: '10px'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                marginRight: '10px'
                                                                            }}
                                                                        >
                                                                            parameters
                                                                        </div>
                                                                        <PlusCircleOutlined onClick={() => addTest()} />
                                                                    </div>
                                                                    {fields7?.map(fields => (
                                                                        <Space align="baseline" key={fields.key}>
                                                                            <Form.Item
                                                                                {...fields}
                                                                                name={[fields.name, 'key']}
                                                                                fieldKey={[fields.name, 'key']}
                                                                                rules={[
                                                                                    {
                                                                                        required: true,
                                                                                        message:
                                                                                            '该字段为必填项请填写对应信息'
                                                                                    }
                                                                                ]}
                                                                            >
                                                                                <Input />
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                {...fields}
                                                                                name={[fields.name, 'value']}
                                                                                fieldKey={[fields.name, 'value']}
                                                                                rules={[
                                                                                    {
                                                                                        required: true,
                                                                                        message:
                                                                                            '该字段为必填项请填写对应信息'
                                                                                    }
                                                                                ]}
                                                                            >
                                                                                <Input />
                                                                            </Form.Item>
                                                                            <MinusCircleOutlined
                                                                                onClick={() => removeTest(fields.name)}
                                                                            />
                                                                        </Space>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </Form.List>
                                                    </Form.Item>
                                                </div>
                                            </Space>
                                        ))}
                                    </div>
                                )}
                            </Form.List>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                width={800}
                title="配置启动参数"
                cancelText={'取消'}
                okText={'启动'}
                visible={isModalOpen2}
                onOk={handleOk2}
                onCancel={handleCancel2}
            >
                <Form {...layout} form={form2} name="dynamic_form_complex" autoComplete="off">
                    <Form.Item
                        name={'model-repository'}
                        label={'model-repository'}
                        rules={[
                            {
                                required: true,
                                message: '该字段为必填项请填写对应信息'
                            }
                        ]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item
                        name={'backend-config'}
                        label={'backend-config'}
                        rules={[
                            {
                                required: true,
                                message: '该字段为必填项请填写对应信息'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        // name={'shm-default-byte-size'}
                        // label={'shm-default-byte-size'}
                        name={'http-port'}
                        label={'http-port'}
                        rules={[
                            {
                                required: true,
                                message: '该字段为必填项请填写对应信息'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        // name={'shm-default-byte-size'}
                        // label={'shm-default-byte-size'}
                        name={'grpc-port'}
                        label={'grpc-port'}
                        rules={[
                            {
                                required: true,
                                message: '该字段为必填项请填写对应信息'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        // name={'shm-default-byte-size'}
                        // label={'shm-default-byte-size'}
                        name={'metrics-port'}
                        label={'metrics-port'}
                        rules={[
                            {
                                required: true,
                                message: '该字段为必填项请填写对应信息'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            {/* <iframe
                ref={iframe}
                src={PUBLIC_PATH + netron}
                frameBorder={0}
                scrolling="yes"
                marginWidth={0}
                marginHeight={0}
            ></iframe> */}
        </Content>
    );
};
export default index;
