/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import styled from 'styled-components';
import React, {useState, useEffect, useRef, FunctionComponent, useCallback} from 'react';
// import {rem, primaryColor, size} from '~/utils/style';
import {Graph, Shape} from '@antv/x6';
import {Modal, Cascader} from 'antd';
import {toast} from 'react-toastify';
// import dagre from 'dagre';
// import {DagreLayout} from '@antv/layout';
// import {Stencil} from '@antv/x6-plugin-stencil';
// import {Transform} from '@antv/x6-plugin-transform';
// import {Selection} from '@antv/x6-plugin-selection';
import {Snapline} from '@antv/x6-plugin-snapline';
import {Keyboard} from '@antv/x6-plugin-keyboard';
import {Clipboard} from '@antv/x6-plugin-clipboard';
import {Export} from '@antv/x6-plugin-export';
import {DownOutlined} from '@ant-design/icons';
import {Tree} from 'antd';
import {fetcher} from '~/utils/fetch';
// import {Dnd} from '@antv/x6-plugin-dnd';
import {useTranslation} from 'react-i18next';
import {History} from '@antv/x6-plugin-history';
import {
    MinusCircleOutlined,
    PlusOutlined,
    PlusCircleOutlined,
    VerticalAlignBottomOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import {Button, Form, Input, Select, Space} from 'antd';
import {isArray} from 'lodash';
const {TreeNode} = Tree;
import {div} from 'numeric';
const Content = styled.div`
    height: 100%;
    .ant-select-selector {
        .ant-select-selection-item {
            .select_icon {
                display: none;
            }
        }
    }
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
        min-width: 180px;
        width: auto;
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
                min-width: 100px;
                width: auto;
                height: 40px;
                border: 1px solid #8f8f8f;
                padding-left: 10px;
                padding-right: 10px;
                border-radius: 6px;
                text-align: center;
                line-height: 40px;
                margin: 16px;
                cursor: move;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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
    padding-left: 5px;
    padding-right: 5px;
    min-width: 86px;
    color: white;
    background-color: var(--navbar-background-color);
`;
const Buttons2 = styled(Buttons)`
    min-width: 138px;
    height: 32px;
    padding-left: 5px;
    padding-right: 5px;
    line-height: 32px;
    padding-left: 5px;
    padding-right: 5px;
    margin-left: 20px;
`;
const {Option} = Select;
const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 16}
};
interface Option {
    value: string | number;
    label: string;
    children?: Option[];
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
const kindType = ['KIND_AUTO', 'KIND_GPU', 'KIND_CPU', 'KIND_MODEL'];
type ArgumentProps = {
    // upModels: (dirValues: string) => void;
    modelData: any;
    dirValue?: any;
    ChangeServerId?: any;
};
const formItems = ['name', 'backend', 'version', 'maxBatchSize', 'input', 'output', 'instanceGroup', 'optimization'];
const Index: FunctionComponent<ArgumentProps> = ({modelData, dirValue, ChangeServerId}) => {
    // #region 初始化图形
    const [ModelDatas, setModelDatas] = useState<any>(modelData);
    const [flag, setFlag] = useState<boolean>();
    const [flag2, setFlag2] = useState<boolean>();
    // const [Dnds, setDnds] = useState<any>();
    const [graphs, setGraphs] = useState<Graph>();
    // const [edgeMaps, setEdgeMaps] = useState<any>({});
    const [showGpus, setShowGpus] = useState<any>({});

    const configs = {
        'server-name': null,
        'model-repository': 'yolov5_serving/models',
        'backend-config': 'python,shm-default-byte-size=10485760',
        'http-port': 8000,
        'grpc-port': 8001,
        'metrics-port': 8002,
        gpus: null
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [isModalOpen3, setIsModalOpen3] = useState(false);
    const [isModalOpen4, setIsModalOpen4] = useState(false);
    const [isModalOpen5, setIsModalOpen5] = useState(false);
    const [isModalOpen6, setIsModalOpen6] = useState(false);
    const [isModalOpen7, setIsModalOpen7] = useState(false);

    const dndContainerRef = useRef<HTMLInputElement | null>(null);
    const [graphModel, setGraphModel] = useState<any>();
    const [filenames, setFilenames] = useState<any>([]);
    // const [config_filename, setConfig_filename] = useState<any>('');
    const [modelName, setModelName] = useState<string>();

    const [IsEmsembles, setIsEmsembles] = useState<boolean>();
    const [showFlag, setShowFlag] = useState<boolean>(false);
    const [Isopen, setIsopen] = useState<boolean>(false);
    const [selectOptions, setSelectOptions] = useState([]);
    // const [ensembles, setEmsembles] = useState<string>();
    const [steps, setSteps] = useState<any>();
    const [nodeClick, setNodeClick] = useState<any>();
    const [triggerClick, setTriggerClick] = useState<any>();
    const [ensemblesName, setEnsemblesName] = useState<string>();
    const [selectKeys, setSelectKeys] = useState<any>();
    const [configsButton, setConfigsButton] = useState<boolean>(true);
    const [version, setVersion] = useState<any>();
    const [CascaderOptions, setCascaderOptions] = useState<Option[]>([]);

    // const iframe = useRef<HTMLIFrameElement>(null);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [form3] = Form.useForm();
    const [form4] = Form.useForm();

    const [svgs, setSvgs] = useState<string>();
    console.log('form', form.getFieldsValue(true));

    const [treeData, setTreeData] = useState(modelData?.ensembles?.versions);
    const {t, i18n} = useTranslation(['Fastdeploy']);
    const language: string = i18n.language;
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
            }
        },
        items: [
            {
                id: 'top',
                group: 'top'
            },
            // {
            //     id: 'right',
            //     group: 'right'
            // },
            {
                id: 'bottom',
                group: 'bottom'
            }
            // {
            //     id: 'left',
            //     group: 'left'
            // }
        ]
    };
    useEffect(() => {
        const graph = new Graph({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        // Graph.registerEdge(
        //     'custom-edge', // 边名称

        // );
        // const dnd = new Dnd({
        //     target: graph,
        //     scaled: false,
        //     dndContainer: dndContainerRef.current
        // });
        // setDnds(dnd);
        graph.on('node:dblclick', ({node}) => {
            setTriggerClick({
                name: node.id
            });
        });
        setGraphs(graph);
        setFlag(true);
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
        console.log('modelData.ensembles', modelData?.ensembles);
        if (modelData?.ensembles.length === 0) {
            setEnsemblesName('');
            setSelectOptions([]);
        } else {
            const SelectOptions = modelData?.ensembles?.map((ensembles: any) => {
                return {
                    value: ensembles.name,
                    label: ensembles.name
                };
            });
            setSelectOptions(SelectOptions);
            setEnsemblesName(modelData.ensembles[0]?.name);
        }

        setModelDatas(modelData);
    }, [modelData]);
    useEffect(() => {
        if (ensemblesName === undefined || !modelData) {
            return;
        }
        console.log('modelData.ensembles', modelData.ensembles);
        const ensembles = modelData.ensembles?.filter((ensembles: any) => {
            if (ensembles.name === ensemblesName) {
                return ensembles;
            }
        });
        if (ensembles?.length) {
            setSteps(ensembles[0]?.step);
            if (ensembles[0]?.versions) {
                const treedatas = getTreeData(ensembles[0]?.versions);
                const treedata = treedatas?.map((version: any) => {
                    return {
                        ...version,
                        // checkable: false
                        selectable: true,
                        icon: <VerticalAlignBottomOutlined />
                    };
                });
                setTreeData(treedata);
            } else {
                setTreeData([]);
            }
        } else {
            setSteps([]);
            setTreeData([]);
        }
    }, [ensemblesName]);
    useEffect(() => {
        if (!flag || !steps) {
            return;
        }
        graphs?.clearCells();
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
                source: {
                    cell: edge.source,
                    connectionPoint: {
                        name: 'boundary',
                        args: {
                            sticky: true
                        }
                    }
                },
                target: {cell: edge.target, connectionPoint: 'boundary'}, // 没有参数时可以简化写法},
                // shape: 'custom-edge',
                // tools: ['vertices', 'segments'],
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
                }
            });
        }

        const nodess: any = [];
        const postions: any = {};
        let max = 0;
        for (const step of steps) {
            const name = step.modelName;
            if (name.length > max) {
                max = name.length;
            }
            postions[name] = {
                x: step['pos_x'],
                y: step['pos_y'],
                lengths: name.length
            };
        }
        for (let index = 0; index < nodes.length; index++) {
            const node = nodes[index];
            // debugger;
            // debugger;
            // const registers = Object.keys(Shape.HTML.shapeMaps);
            // if (!registers.includes(node.id)) {
            //     Shape.HTML.register({
            //         shape: node.id,
            //         width: 60,
            //         height: 40,
            //         html() {
            //             const div = document.createElement('div');
            //             const textNode = document.createTextNode(node.id);
            //             div.className = 'custom-html';
            //             div.appendChild(textNode);
            //             return div;
            //         }
            //     });
            // }
            const postion = postions[node?.id];
            Shape.HTML.register({
                shape: node.id,
                width: 10 + max * 10,
                // width: 10 + postion['lengths'] * 10,
                height: 40,
                html() {
                    const div = document.createElement('div');
                    const textNode = document.createTextNode(node.id);
                    div.className = 'custom-html';
                    div.appendChild(textNode);
                    return div;
                }
            });

            // debugger;
            // const HtmlNode = graphs?.createNode();
            nodess.push({
                id: node.id,
                shape: node.id,
                size: {
                    width: 10 + max * 10,
                    height: 40
                },
                x: 300 + postion.x * 90,
                y: 50 + postion.y * 80,
                ports: ports
                // tools: ['button-remove']
            });
            // debugger;
            // debugger;
            // graphs?.addEdges(nodeEdges);
            // nodess?.push({
            //     id: node.id,
            //     x: 300 + edgeMaps2[node.id] * 120,
            //     y: 100,
            //     width: 60,
            //     height: 40,
            //     shape: 'html',
            //     size: {
            //         width: 60,
            //         height: 40
            //     },
            //     html: {
            //         render(node: Cell) {
            //             return `<div class='custom-html'>
            //             ${node.id}
            //         <div>`;
            //         }
            //     },
            //     shouldComponentUpdate(node: Cell) {
            //         return node.hasChanged('data');
            //     },
            //     ports: ports
            // });
            // debugger;
        }
        console.log('nodess', nodess, Shape.HTML.shapeMaps);
        // debugger;
        // graphs?.addNodes(nodess);
        // debugger;
        graphs?.fromJSON({
            nodes: nodess,
            edges: nodeEdges
        });
        // setFlag(false);
        setGraphs(graphs);
    }, [steps, flag]);
    const graphPlug = (graph: any) => {
        // graph.use(
        //     new Transform({
        //         resizing: true,
        //         rotating: true
        //     })
        // );
        // graph.use(
        //     new Selection({
        //         enabled: true,
        //         rubberband: true,
        //         showNodeSelectionBox: true
        //     })
        // );
        graph.use(new Export());
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
    const getTreeData = (treedata: any) => {
        const treedatas = treedata?.map((version: any) => {
            let Child: any = '';
            if (version.children) {
                Child = getTreeData(version.children);
            }
            if (Child) {
                return {
                    ...version,
                    children: Child,
                    selectable: false
                };
            }
            return {
                ...version,
                selectable: false
            };
        });
        return treedatas;
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
        // debugger;
        let formBody: any = [];
        const details: any = {
            name: name,
            dir: dir,
            config: JSON.stringify(config)
        };
        // debugger;
        // if (config_filename) {
        //     details['config_filename'] = config_filename;
        // }
        details['config_filename'] = form.getFieldValue('config_filenames');
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
                // debugger;
                // downloadEvt(res.data, fileName);
                // setConfig_filename('');
                setModelDatas(config);
                setIsModalOpen(false);
                const message =
                    language === 'zh' ? `${name} 更新配置成功` : `Update ${name} configuration successfully`;
                toast.success(message, {
                    autoClose: 2000
                });
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
        if (!configsButton) {
            toast.error(t('Fastdeploy:Backup-config'), {
                autoClose: 2000
            });
            return;
        }
        form?.validateFields()
            .then(async values => {
                // debugger;
                // setIsModalOpen(false);
                const ModelData = ModelDatas;
                // debugger;
                const newcpuExecutionAccelerator = values.cpuExecutionAccelerator?.map((item: any) => {
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
                const newgpuExecutionAccelerator = values.gpuExecutionAccelerator?.map((item: any) => {
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
                const newInput = values.input.map((input: any) => {
                    const type = isArray(input.dims);
                    const dimss = type ? input.dims : input.dims.split(',');
                    return {
                        ...input,
                        dims: dimss
                    };
                });

                const newOutput = values.output.map((output: any) => {
                    const type = isArray(output.dims);
                    const dimss = type ? output.dims : output.dims.split(',');
                    return {
                        ...output,
                        dims: dimss
                    };
                });
                const newInstanceGroups = values.instanceGroup.map((group: any) => {
                    if (group.gpus) {
                        const type = isArray(group.gpus);
                        const gpuss = type ? group.gpus : group.gpus.split(',');
                        return {
                            ...group,
                            gpus: gpuss
                        };
                    } else {
                        return {
                            ...group
                        };
                    }
                });
                if (IsEmsembles) {
                    console.log('values', values);
                    const emsembless = ModelDatas.ensembles?.map((ensembles: any) => {
                        if (ensembles.name === ensemblesName) {
                            const newemsembles = {
                                ...ensembles,
                                ...values,
                                input: newInput,
                                output: newOutput,
                                instanceGroup: newInstanceGroups,
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
                    // await getModelData(dirValue);
                    // setIsModalOpen(false);
                } else {
                    // debuggersss;
                    const models = ModelData.models?.map((model: any) => {
                        if (model.name === modelName) {
                            const newmodel = {
                                ...model,
                                ...values,
                                input: newInput,
                                output: newOutput,
                                instanceGroup: newInstanceGroups,
                                optimization: {
                                    cpuExecutionAccelerator: newcpuExecutionAccelerator,
                                    gpuExecutionAccelerator: newgpuExecutionAccelerator
                                }
                            };
                            const newInstanceGroup = newmodel.instanceGroup.map((item: any) => {
                                if (item.kind !== 'KIND_CPU' && item.kind !== 'KIND_MODEL') {
                                    return item;
                                } else {
                                    return {
                                        count: item.count,
                                        gpus: undefined,
                                        kind: item.kind
                                    };
                                }
                            });
                            newmodel.instanceGroup = newInstanceGroup;
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
                    // await getModelData(dirValue);
                    // setModelDatas(ModelData);
                }
            })
            .catch(errorInfo => {
                console.log('errorInfo', errorInfo);
                // alert(errorInfo);
            });
    };
    const handleOk2 = () => {
        // console.log(111);
        // setIsModalOpen2(false);
        form2
            ?.validateFields()
            .then(values => {
                const bodys = {
                    ...values,
                    default_model_name: ensemblesName
                };
                if (svgs) {
                    bodys['ensemble-img'] = svgs;
                }
                let formBody: any = [];
                const details: any = {
                    config: JSON.stringify(bodys)
                };
                // debugger;
                for (const property in details) {
                    const encodedKey = encodeURIComponent(property);
                    const encodedValue = encodeURIComponent(details[property]);
                    formBody.push(encodedKey + '=' + encodedValue);
                }
                formBody = formBody.join('&');
                console.log('formBody', formBody);

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
                        toast.success(t('Fastdeploy:Launch-server-successfully'), {
                            autoClose: 2000
                        });
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
    const handleOk3 = () => {
        // console.log(111);
        // setIsModalOpen2(false);
        form3
            ?.validateFields()
            .then(values => {
                console.log('valuesssss', values);

                const pretrain_model_name = values.models[values.models.length - 1];
                // const version = selectedKeys[0];
                const name = IsEmsembles ? ensemblesName : modelName;
                fetcher(
                    '/fastdeploy/download_pretrain_model' +
                        `?dir=${dirValue}` +
                        `&name=${name}` +
                        `&version=${version}` +
                        `&pretrain_model_name=${pretrain_model_name}`
                ).then(
                    (res: any) => {
                        const ModelData = ModelDatas;
                        if (IsEmsembles) {
                            console.log('values', values);

                            const emsembless = ModelDatas.ensembles?.map((ensembles: any) => {
                                if (ensembles.name === ensemblesName) {
                                    const newemsembles = {
                                        ...ensembles,
                                        versions: res
                                    };
                                    return newemsembles;
                                } else {
                                    return ensembles;
                                }
                            });
                            ModelData.ensembles = emsembless;
                            // await getModelData(dirValue);
                            // setIsModalOpen(false);
                        } else {
                            // debuggersss;
                            const models = ModelData.models?.map((model: any) => {
                                if (model.name === modelName) {
                                    const newmodel = {
                                        ...model,
                                        versions: res
                                    };
                                    return newmodel;
                                } else {
                                    return model;
                                }
                            });
                            // models.delete('cpuExecutionAccelerator');
                            // models.delete('gpuExecutionAccelerator');
                            ModelData.models = models;

                            // await getModelData(dirValue);
                            // setModelDatas(ModelData);
                        }
                        const treedatas = getTreeData(res);
                        const treedata = treedatas?.map((version: any) => {
                            return {
                                ...version,
                                // checkable: false
                                selectable: true
                            };
                        });
                        form.setFields([
                            {
                                name: 'versions',
                                value: res
                            }
                        ]);
                        setTreeData(treedata);
                        setModelDatas(ModelData);
                        setCascaderOptions([]);
                        setIsModalOpen3(false);
                        setSelectKeys(null);
                        toast.success(t('Download-successfully'), {
                            autoClose: 2000
                        });
                    },
                    res => {
                        console.log(res);
                        setIsModalOpen(false);
                        setSelectKeys(null);
                    }
                );
            })
            .catch(errorInfo => {
                alert(errorInfo);
            });
    };
    const handleOk4 = () => {
        const modelNames = IsEmsembles ? ensemblesName : modelName;
        const name = form.getFieldValue('config_filenames');
        fetcher(
            '/fastdeploy/set_default_config_for_model' +
                `?dir=${dirValue}` +
                `&name=${modelNames}` +
                `&config_filename=${name}`
        ).then(
            (res: any) => {
                console.log('set_default_config_for_model', res);
                setIsModalOpen4(false);
                // const name = form.getf
                // setConfig_filename(name);
                fetcher('/fastdeploy/get_config_filenames_for_model' + `?dir=${dirValue}` + `&name=${modelNames}`).then(
                    (res: any) => {
                        // debugger;
                        setFilenames(res);
                        toast.success(t('Set-successfully'), {
                            autoClose: 2000
                        });
                        if (name !== 'config.pbtxt') {
                            onGetConfigModel('config.pbtxt');
                        }
                    }
                );
            },
            res => {
                console.log(res);
            }
        );
    };
    const handleOk5 = () => {
        const modelNames = IsEmsembles ? ensemblesName : modelName;
        fetcher(
            '/fastdeploy/delete_resource_for_model' +
                `?dir=${dirValue}` +
                `&name=${modelNames}` +
                `&version=${version}` +
                `&resource_filename=${selectKeys}`
        ).then(
            (res: any) => {
                const ModelData = ModelDatas;
                if (IsEmsembles) {
                    const emsembless = ModelDatas.ensembles?.map((ensembles: any) => {
                        if (ensembles.name === ensemblesName) {
                            const newemsembles = {
                                ...ensembles,
                                versions: res
                            };
                            return newemsembles;
                        } else {
                            return ensembles;
                        }
                    });
                    ModelData.ensembles = emsembless;
                } else {
                    // debuggersss;
                    const models = ModelData.models?.map((model: any) => {
                        if (model.name === modelName) {
                            const newmodel = {
                                ...model,
                                versions: res
                            };
                            return newmodel;
                        } else {
                            return model;
                        }
                    });
                    ModelData.models = models;
                }
                const treedatas = getTreeData(res);
                const treedata = treedatas?.map((version: any) => {
                    return {
                        ...version,
                        selectable: true
                    };
                });
                form.setFields([
                    {
                        name: 'versions',
                        value: res
                    }
                ]);
                setTreeData(treedata);
                setModelDatas(ModelData);
                setIsModalOpen5(false);
                toast.success(t('Delete-resource-successfully'), {
                    autoClose: 2000
                });
            },
            res => {
                console.log(res);
            }
        );
    };
    const handleOk6 = () => {
        form4?.validateFields().then(values => {
            console.log('valuesssss', values);
            const new_filename = values['new_filename'];
            const modelNames = IsEmsembles ? ensemblesName : modelName;
            fetcher(
                '/fastdeploy/rename_resource_for_model' +
                    `?dir=${dirValue}` +
                    `&name=${modelNames}` +
                    `&version=${version}` +
                    `&new_filename=${new_filename}` +
                    `&resource_filename=${selectKeys}`
            ).then(
                (res: any) => {
                    const ModelData = ModelDatas;
                    if (IsEmsembles) {
                        const emsembless = ModelDatas.ensembles?.map((ensembles: any) => {
                            if (ensembles.name === ensemblesName) {
                                const newemsembles = {
                                    ...ensembles,
                                    versions: res
                                };
                                return newemsembles;
                            } else {
                                return ensembles;
                            }
                        });
                        ModelData.ensembles = emsembless;
                    } else {
                        // debuggersss;
                        const models = ModelData.models?.map((model: any) => {
                            if (model.name === modelName) {
                                const newmodel = {
                                    ...model,
                                    versions: res
                                };
                                return newmodel;
                            } else {
                                return model;
                            }
                        });
                        ModelData.models = models;
                    }
                    const treedatas = getTreeData(res);
                    const treedata = treedatas?.map((version: any) => {
                        return {
                            ...version,
                            selectable: true
                        };
                    });
                    form.setFields([
                        {
                            name: 'versions',
                            value: res
                        }
                    ]);
                    setTreeData(treedata);
                    setModelDatas(ModelData);
                    setIsModalOpen6(false);
                    form4.setFields([
                        {
                            name: 'new_filename',
                            value: ''
                        }
                    ]);
                    toast.success(t('Rename-successfully'), {
                        autoClose: 2000
                    });
                },
                res => {
                    console.log(res);
                }
            );
        });
    };
    const handleOk7 = async () => {
        const modelNames = IsEmsembles ? ensemblesName : modelName;
        fetcher(
            '/fastdeploy/delete_config_for_model' +
                `?dir=${dirValue}` +
                `&name=${modelNames}` +
                `&config_filename=${selectKeys}`
        ).then((res: any) => {
            console.log('delete_config', res);
            setFilenames(res);
            onGetConfigModel(res[0]);
            setIsModalOpen7(false);
            toast.success(t('Delete-config-successfully'), {
                autoClose: 2000
            });
        });
        // onGetConfigModel()
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
    const handleCancel3 = () => {
        setSelectKeys(null);
        setIsModalOpen3(false);
    };
    const handleCancel4 = () => {
        setIsModalOpen4(false);
    };
    const handleCancel5 = () => {
        setIsModalOpen5(false);
    };
    const handleCancel6 = () => {
        setIsModalOpen6(false);
    };
    const handleCancel7 = () => {
        setIsModalOpen7(false);
    };
    // const onFinish = (values: any) => {
    //     console.log('Received values of form:', values);
    // };

    // const handleChange = () => {
    //     form.setFieldsValue({});
    // };
    const onSelect = (selectedKeys: any) => {
        // debugger;
        console.log('selected', selectedKeys);
        setSelectKeys(selectedKeys);
        setVersion(selectedKeys);
        fetcher('/fastdeploy/get_pretrain_model_list').then((res: any) => {
            setCascaderOptions(res);
            setIsModalOpen3(true);
        });
    };
    const onDelete_config = (selectedKeys: any) => {
        setSelectKeys(selectedKeys);
        setIsModalOpen7(true);
    };
    const onDelete = (selectedKeys: any) => {
        console.log('selected', selectedKeys, treeData);
        let versions = '';
        for (const trees of treeData) {
            if (trees.key === selectedKeys) {
                versions = trees.key;
                return;
            }
            if (trees.children) {
                for (const trees2 of trees.children) {
                    if (trees2.key === selectedKeys) {
                        versions = trees.key;
                        setSelectKeys(selectedKeys);
                        setVersion(versions);
                        setIsModalOpen5(true);
                        return;
                    }
                }
            }
        }
    };
    const onRename = (selectedKeys: any) => {
        // debugger;
        console.log('selected', selectedKeys);
        let versions = '';
        for (const trees of treeData) {
            if (trees.key === selectedKeys) {
                versions = trees.key;
                return;
            }
            if (trees.children) {
                for (const trees2 of trees.children) {
                    if (trees2.key === selectedKeys) {
                        versions = trees.key;
                        setSelectKeys(selectedKeys);
                        setVersion(versions);
                        setIsModalOpen6(true);
                        return;
                    }
                }
            }
        }
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
        const newShowGpus = [];
        if (modelss?.instanceGroup) {
            for (const item of modelss?.instanceGroup) {
                if (item.kind !== 'KIND_CPU' && item.kind !== 'KIND_MODEL') {
                    newShowGpus.push(true);
                } else {
                    newShowGpus.push(false);
                }
            }
        }
        setShowGpus(newShowGpus);

        // form.setFieldsValue({});
        for (const item of formItems) {
            if (!modelss[item]) {
                modelss[item] = undefined;
            }
        }
        console.log('modelss', modelss);

        form.setFieldsValue(modelss);
    };
    const onFill2 = (config: any) => {
        form2.setFieldsValue(config);
    };
    const onFill3 = () => {
        form3.setFieldsValue({
            models: []
        });
    };

    const getmodelData = (model: any, name: string) => {
        setModelName(name);
        setGraphModel(model);
        if (model?.versions) {
            const treedatas = getTreeData(model?.versions);
            const treedata = treedatas?.map((version: any) => {
                return {
                    ...version,
                    // checkable: false
                    selectable: true,
                    icon: <VerticalAlignBottomOutlined />
                };
            });
            setTreeData(treedata);
        } else {
            setTreeData([]);
        }

        if (IsEmsembles) {
            setIsEmsembles(false);
        }
        const flag = !showFlag;
        setShowFlag(flag);
    };
    const changeEmsembles = () => {
        setIsEmsembles(true);
        setShowFlag(!showFlag);
    };
    const EnsemblesNameChange = (value: string) => {
        setEnsemblesName(value);
    };
    const getTreeNode = useCallback(
        (data: any) => {
            // debugger;
            if (data && data.length > 0) {
                return data.map((item: any) => {
                    if (item.children) {
                        return (
                            <TreeNode
                                key={item.key}
                                title={
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div
                                            style={{
                                                marginRight: '20px'
                                            }}
                                        >
                                            {item.title}
                                        </div>
                                        <VerticalAlignBottomOutlined
                                            onClick={() => {
                                                onSelect(item.key);
                                            }}
                                        />
                                    </div>
                                }
                            >
                                {getTreeNode(item.children)}
                            </TreeNode>
                        );
                    }
                    return (
                        <TreeNode
                            key={item.key}
                            title={
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div
                                        style={{
                                            marginRight: '20px'
                                        }}
                                        onClick={() => {
                                            onRename(item.key);
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                    <DeleteOutlined
                                        onClick={() => {
                                            onDelete(item.key);
                                        }}
                                    />
                                </div>
                            }
                        ></TreeNode>
                    );
                });
            }
            return [];
        },
        [treeData]
    );
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
        if (isModalOpen && modelData) {
            if (!IsEmsembles) {
                fetcher('/fastdeploy/get_config_filenames_for_model' + `?dir=${dirValue}` + `&name=${modelName}`).then(
                    (res: any) => {
                        // debugger;
                        setFilenames(res);
                        graphModel && onFill(graphModel);
                    }
                );
            } else {
                for (const ensembles of modelData.ensembles) {
                    if (ensembles.name === ensemblesName) {
                        if (ensembles?.versions) {
                            const treedatas = getTreeData(ensembles?.versions);
                            const treedata = treedatas?.map((version: any) => {
                                return {
                                    ...version,
                                    // checkable: false
                                    selectable: true
                                };
                            });
                            setTreeData(treedata);
                        } else {
                            setTreeData([]);
                        }
                        fetcher(
                            '/fastdeploy/get_config_filenames_for_model' + `?dir=${dirValue}` + `&name=${ensemblesName}`
                        ).then((res: any) => {
                            // debugger;
                            setFilenames(res);
                            onFill(ensembles);
                        });

                        return;
                    }
                }
            }
        }
    }, [isModalOpen, graphModel, IsEmsembles]);
    useEffect(() => {
        if (isModalOpen2 && dirValue) {
            onFill2({
                'server-name': configs['server-name'],
                'backend-config': configs['backend-config'],
                'metrics-port': configs['metrics-port'],
                'http-port': configs['http-port'],
                'grpc-port': configs['grpc-port'],
                'model-repository': dirValue,
                gpus: configs['gpus']
            });
            const styles = `.custom-html {
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
            }`;
            graphs &&
                graphs.toPNG(
                    (dataUri: string) => {
                        console.log('dataUri', dataUri);
                        setSvgs(dataUri);
                        // debugger;
                    },

                    {copyStyles: true, preserveDimensions: true, stylesheet: styles, padding: 50}
                );
        }
    }, [dirValue, isModalOpen2]);
    useEffect(() => {
        if (isModalOpen3) {
            onFill3();
        }
    }, [isModalOpen3]);
    useEffect(() => {
        if (!triggerClick) {
            return;
        }
        const name = triggerClick.name;
        for (const model of modelData.models) {
            if (model.name === name) {
                setNodeClick({
                    name: model.name,
                    data: model
                });
                return;
            }
        }
    }, [triggerClick]);
    const onConfig = () => {
        setIsModalOpen4(true);
    };
    const onGetConfigModel = (value: string) => {
        const modelNames = IsEmsembles ? ensemblesName : modelName;
        fetcher(
            '/fastdeploy/get_config_for_model' +
                `?dir=${dirValue}` +
                `&name=${modelNames}` +
                `&config_filename=${value}`
        ).then((res: any) => {
            form.setFields([
                {
                    name: 'versions',
                    value: res.versions
                }
            ]);
            const treedatas = getTreeData(res?.versions);
            const treedata = treedatas?.map((version: any) => {
                return {
                    ...version,
                    // checkable: false
                    selectable: true,
                    icon: <VerticalAlignBottomOutlined />
                };
            });
            setTreeData(treedata);
            setIsopen(false);
            // setModelDatas(ModelData)
            res && onFill(res);
            if (value.includes('vdlbackup')) {
                setConfigsButton(false);
            } else {
                setConfigsButton(true);
            }
        });
    };
    console.log('graphssss');
    console.log('showFlag', showFlag);
    // const createhtml = svg => {
    //     return {__html: svg};
    // };
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
                            ModelDatas?.models?.map((model: any) => {
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
                                left: language === 'zh' ? '-180px' : '-200px',
                                minWidth: '160px'
                            }}
                            onClick={changeEmsembles}
                        >
                            {t('Fastdeploy:ensemble-configuration')}
                        </Buttons>
                        <Buttons
                            style={{
                                width: '160px'
                            }}
                            onClick={() => {
                                setIsModalOpen2(true);
                            }}
                        >
                            {t('Fastdeploy:launch-server')}
                        </Buttons>
                    </div>
                </div>
            </div>
            <Modal
                width={800}
                title={IsEmsembles ? t('Fastdeploy:Ensemble-configuration') : t('Fastdeploy:Model-configuration')}
                visible={isModalOpen}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:update')}
                // footer={!configsButton ? null : ''}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form {...layout} form={form} name="dynamic_form_complex" autoComplete="off">
                    <Form.Item label="config_filenames">
                        <div style={{display: 'flex'}}>
                            <Form.Item
                                name="config_filenames"
                                rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                style={{
                                    marginBottom: '0px',
                                    // width: '340px'
                                    width: language === 'zh' ? '340px' : '316px'
                                }}
                            >
                                <Select
                                    onChange={value => {
                                        onGetConfigModel(value);
                                    }}
                                    onDropdownVisibleChange={() => {
                                        setIsopen(true);
                                    }}
                                >
                                    {filenames?.map((item: string) => (
                                        <Option key={item} value={item}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div
                                                    title={item}
                                                    style={{
                                                        overflow: 'hidden',
                                                        width: '298px',
                                                        whiteSpace: 'nowrap',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {item}
                                                </div>
                                                <DeleteOutlined
                                                    style={{
                                                        display: Isopen ? 'nomal' : 'none'
                                                    }}
                                                    onClick={() => {
                                                        onDelete_config(item);
                                                    }}
                                                />
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Buttons2 onClick={onConfig}>{t('Fastdeploy:set-as-launch-config')}</Buttons2>
                        </div>
                    </Form.Item>
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
                        <Input />treeData
                    </Form.Item> */}
                    <Form.Item name="versions" label="versions">
                        <Tree
                            showLine
                            showIcon
                            // selectedKeys={selectKeys}
                            switcherIcon={<DownOutlined />}
                            defaultExpandedKeys={['0-0-0']}
                            // onSelect={onSelect}
                            // treeData={treeData}
                        >
                            {getTreeNode(treeData)}
                        </Tree>
                    </Form.Item>
                    <Form.Item
                        name="maxBatchSize"
                        label="maxBatchSize"
                        // rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="input">
                        <Form.List name="input">
                            {fields => (
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
                                                >{`${t('Fastdeploy:variable')}${index + 1}`}</div>
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
                            {fields2 => (
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
                                                >{`${t('Fastdeploy:variable')}${index + 1}`}</div>
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
                    <Form.Item label="instanceGroup">
                        <Form.List name="instanceGroup">
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
                                                >{`${t('Fastdeploy:instance')}${index + 1}`}</div>
                                                <MinusCircleOutlined onClick={() => remove(field.name)} />
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
                                                    {/* <Input /> */}
                                                    <Select
                                                        onChange={value => {
                                                            // form?.validateFields().then(values => {
                                                            //     console.log('valuess', values);
                                                            // });
                                                            console.log('valuess', value);

                                                            const newShowGpus = [...showGpus];
                                                            if (value !== 'KIND_CPU' && value !== 'KIND_MODEL') {
                                                                if (!newShowGpus[index]) {
                                                                    newShowGpus[index] = true;
                                                                }
                                                            } else {
                                                                if (newShowGpus[index]) {
                                                                    newShowGpus[index] = false;
                                                                }
                                                            }
                                                            setShowGpus(newShowGpus);
                                                        }}
                                                    >
                                                        {kindType?.map(item => (
                                                            <Option key={item} value={item}>
                                                                {item}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                {showGpus[index] && (
                                                    <Form.Item
                                                        {...field}
                                                        label="gpus"
                                                        labelCol={{span: 4}}
                                                        name={[field.name, 'gpus']}
                                                        rules={[
                                                            {required: true, message: '该字段为必填项请填写对应信息'}
                                                        ]}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => {
                                                const newShowGpus = [...showGpus, true];
                                                setShowGpus(newShowGpus);
                                                add();
                                            }}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Add sights
                                        </Button>
                                    </Form.Item>
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
                title={t('Fastdeploy:Launch-parameters-configuration')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:launch')}
                visible={isModalOpen2}
                onOk={handleOk2}
                onCancel={handleCancel2}
            >
                <Form {...layout} form={form2} name="dynamic_form_complex" autoComplete="off">
                    <Form.Item
                        name={'server-name'}
                        label={'server-name'}
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: '该字段为必填项请填写对应信息'
                        //     }
                        // ]}
                    >
                        <Input />
                    </Form.Item>
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
                    <Form.Item
                        name={'gpus'}
                        label={'gpus'}
                        // rules={[
                        //     {
                        //         // required: true,
                        //         message: '该字段为必填项请填写对应信息'
                        //     }
                        // ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                width={800}
                title={t('Fastdeploy:Download-pre-trained-model')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:ok')}
                visible={isModalOpen3}
                onOk={handleOk3}
                onCancel={handleCancel3}
            >
                <Form {...layout} form={form3} name="dynamic_form_complex" autoComplete="off">
                    <Form.Item
                        name={'models'}
                        label={t('Fastdeploy:Pre-trained')}
                        rules={[
                            {
                                required: true,
                                message: '该字段为必填项请填写对应信息'
                            }
                        ]}
                    >
                        <Cascader options={CascaderOptions} placeholder="Please select" />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                width={800}
                title={t('Fastdeploy:set-as-launch-config')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:ok')}
                visible={isModalOpen4}
                onOk={handleOk4}
                onCancel={handleCancel4}
            >
                {t('Fastdeploy:The-config')}
            </Modal>
            <Modal
                width={800}
                title={t('Fastdeploy:Delete-resource-file')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:ok')}
                visible={isModalOpen5}
                onOk={handleOk5}
                onCancel={handleCancel5}
            >
                {`${t('Fastdeploy:Confirm-delete-resource')} ${selectKeys}`}
            </Modal>
            <Modal
                width={800}
                title={t('Fastdeploy:Rename-resource-file')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:ok')}
                visible={isModalOpen6}
                onOk={handleOk6}
                onCancel={handleCancel6}
            >
                <Form {...layout} form={form4} name="dynamic_form_complex" autoComplete="off">
                    <Form.Item
                        name={'new_filename'}
                        label={'新文件名'}
                        rules={[
                            {
                                required: true,
                                message: '该字段为必填项请填写对应信息'
                            }
                        ]}
                        style={{
                            marginBottom: '0px'
                        }}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                width={800}
                title={t('Fastdeploy:Delete-config-file')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:ok')}
                visible={isModalOpen7}
                onOk={handleOk7}
                onCancel={handleCancel7}
            >
                {`${t('Fastdeploy:Confirm-delete-config')} ${selectKeys}`}
            </Modal>

            {/* <iframe
                ref={iframe}
                src={PUBLIC_PATH + netron}
                frameBorder={0}
                scrolling="yes"
                marginWidth={0}
                marginHeight={0}
            ></iframe> */}
            {/* <div dangerouslySetInnerHTML={createhtml(svgs)}></div> */}
            {/* <div>
                <img src={svgs} alt="" />
            </div> */}
        </Content>
    );
};
export default Index;
