/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, FunctionComponent} from 'react';
import {MinusCircleOutlined, DownOutlined, VerticalAlignBottomOutlined} from '@ant-design/icons';
import {Graph, Shape} from '@antv/x6';
import {Form, Input, Select, Space} from 'antd';
import type {TreeProps} from 'antd/es/tree';
import {Tree} from 'antd';
import styled from 'styled-components';
import {Modal} from 'antd';
// import {Child} from '../ProfilerPage/OperatorView/type';
import {useTranslation} from 'react-i18next';
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
    .graph-containers {
        width: calc(100% - 180px);
        height: 100%;
        // display: flex;
        // align-items: center;
        // justify-content: center;
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
const formItems = ['name', 'backend', 'version', 'maxBatchSize', 'input', 'output', 'instanceGroup', 'optimization'];
const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 16}
};
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
const {Option} = Select;
type ArgumentProps = {
    modelData: any;
    serverId: string;
};
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
const ServerConfig: FunctionComponent<ArgumentProps> = ({modelData, serverId}) => {
    const graphContainer = `graph-containers${serverId}`;
    // const [ModelDatas, setModelDatas] = useState<any>(modelData);
    const [steps, setSteps] = useState<any>();
    const [selectOptions, setSelectOptions] = useState([]);
    const [graphModel, setGraphModel] = useState<any>();
    // const [modelName, setModelName] = useState<string>();
    const [nodeClick, setNodeClick] = useState<any>();
    const [showFlag, setShowFlag] = useState<boolean>();
    const [IsEmsembles, setIsEmsembles] = useState<boolean>();
    const [showGpus, setShowGpus] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ensemblesName, setEnsemblesName] = useState<string>();
    const [triggerClick, setTriggerClick] = useState<any>();
    const [flag, setFlag] = useState<boolean>();
    const [graphs, setGraphs] = useState<Graph>();

    const [form] = Form.useForm();
    const [treeData, setTreeData] = useState(modelData?.ensembles[0]?.versions);
    const {t} = useTranslation(['Fastdeploy']);
    const getmodelData = (model: any, name: string) => {
        // setModelName(name);
        setGraphModel(model);
        const treedata = model.versions.map((version: any) => {
            return {
                ...version
            };
        });
        setTreeData(treedata);
        if (IsEmsembles) {
            setIsEmsembles(false);
        }
        const flag = !showFlag;
        setShowFlag(flag);
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
        form.setFieldsValue(modelss);
    };
    const changeEmsembles = () => {
        setIsEmsembles(true);
        setShowFlag(!showFlag);
        // setTreeData(modelData.ensembles[0].versions);
        const treedata = modelData.ensembles[0].versions.map((version: any) => {
            return {
                ...version
                // checkable: false
                // icon: <VerticalAlignBottomOutlined />
            };
        });
        // const treedatas = getTreeData(modelData.ensembles[0].versions);
        // const treedata = treedatas.map((version: any) => {
        //     return {
        //         ...version,
        //         checkable: true
        //     };
        // });
        setTreeData(treedata);
    };
    const getTreeData = (treedata: any) => {
        const treedatas = treedata.map((version: any) => {
            let Child: any = '';
            if (version.children) {
                Child = getTreeData(version.children);
            }
            if (Child) {
                return {
                    ...version,
                    children: Child,
                    checkable: false
                };
            }
            return {
                ...version,
                checkable: false
            };
        });
        return treedatas;
    };
    const handleOk = () => {
        // onfinish();
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        if (nodeClick) {
            setNodeClick(undefined);
        }
    };
    const onSelect: TreeProps['onSelect'] = (selectedKeys: any, info: any) => {
        console.log('selected', selectedKeys, info);
    };
    const showModal = () => {
        setIsModalOpen(true);
    };
    const EnsemblesNameChange = (value: string) => {
        setEnsemblesName(value);
    };
    useEffect(() => {
        const graph = new Graph({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            container: document.getElementById(graphContainer)!,
            grid: true,
            mousewheel: {
                enabled: false,
                zoomAtMousePosition: true,
                minScale: 0.5,
                maxScale: 3
                // modifiers: ['ctrl', 'meta']
            },
            panning: false,
            // scroller: {
            //     enabled: true,
            //     pannable: true,
            //     pageVisible: true,
            //     pageBreak: false
            // },
            translating: {
                restrict: false
            },
            interacting: {
                edgeMovable: false,
                nodeMovable: false
            },
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
        graph.on('node:dblclick', ({node}) => {
            setTriggerClick({
                name: node.id
            });
        });
        // debugger;
        setGraphs(graph);
        setFlag(true);
    }, []);
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
    useEffect(() => {
        if (!nodeClick) {
            return;
        }
        getmodelData(nodeClick.data, nodeClick.name);
    }, [nodeClick]);
    useEffect(() => {
        if (!modelData) {
            return;
        }
        console.log('modelData.ensembles', modelData?.ensembles);
        const SelectOptions = modelData?.ensembles?.map((ensembles: any) => {
            return {
                value: ensembles.name,
                label: ensembles.name
            };
        });
        setEnsemblesName(modelData.ensembles[0]?.name);
        // setModelDatas(modelData);
        setSelectOptions(SelectOptions);
    }, [modelData]);
    useEffect(() => {
        if (!ensemblesName || !modelData) {
            return;
        }
        console.log('modelData.ensembles', modelData.ensembles);
        const ensembles = modelData.ensembles?.filter((ensembles: any) => {
            if (ensembles.name === ensemblesName) {
                return ensembles;
            }
        });
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
    }, [ensemblesName]);
    useEffect(() => {
        if (!flag || !steps) {
            return;
        }
        // debugger;
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

        console.log('edgeMap', edgeMap);
        const edges = [];
        const nodes = [];
        for (const name of Object.keys(edgeMap)) {
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
        }
        console.log('nodess', nodess, Shape.HTML.shapeMaps);
        // debugger;
        graphs?.fromJSON({
            nodes: nodess,
            edges: nodeEdges
        });
        // setFlag(false);
        setGraphs(graphs);
    }, [steps, flag]);
    useEffect(() => {
        if (showFlag !== undefined) {
            showModal();
        }
    }, [showFlag]);
    useEffect(() => {
        if (isModalOpen && modelData) {
            if (!IsEmsembles) {
                graphModel && onFill(graphModel);
            } else {
                // modelData && onFill(modelData.ensembles[0]);
                for (const ensembles of modelData.ensembles) {
                    // debugger;
                    if (ensembles.name === ensemblesName) {
                        onFill(ensembles);
                        return;
                    }
                }
            }
        }
    }, [isModalOpen, graphModel, IsEmsembles]);

    return (
        <Content
            style={{
                height: '100%',
                width: '100%'
            }}
        >
            <div id="container">
                <div id={graphContainer} className="graph-containers">
                    {/* <img src={modelData && modelData['ensemble-img']} alt="" /> */}
                </div>
                <div id="stencil_content">
                    <div id="stencil">
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
                        <div id="stencil">
                            {modelData &&
                                modelData.models?.map((model: any) => {
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
                    </div>
                    <div id="buttonContent">
                        <Buttons
                            style={{
                                width: '160px'
                            }}
                            onClick={changeEmsembles}
                        >
                            {t('Fastdeploy:ensemble-configuration')}
                        </Buttons>
                    </div>
                </div>
            </div>
            <Modal
                width={800}
                title={IsEmsembles ? t('Fastdeploy:Ensemble-configuration') : t('Fastdeploy:Model-configuration')}
                visible={isModalOpen}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:ok')}
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
                            showIcon
                            switcherIcon={<DownOutlined />}
                            defaultExpandedKeys={['0-0-0']}
                            selectable={true}
                            onSelect={onSelect}
                            treeData={treeData}
                        />
                    </Form.Item>
                    <Form.Item
                        name="maxBatchSize"
                        label="maxBatchSize"
                        // rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                    >
                        <Input disabled={true} />
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
                                                    <Input disabled={true} />
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="dataType"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'dataType']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Select disabled={true}>
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
                                                    <Input disabled={true} />
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
                                                    <Input disabled={true} />
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    label="dataType"
                                                    labelCol={{span: 4}}
                                                    name={[field.name, 'dataType']}
                                                    rules={[{required: true, message: '该字段为必填项请填写对应信息'}]}
                                                >
                                                    <Select disabled={true}>
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
                                                    <Input disabled={true} />
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
                            {(fields3, {}) => (
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
                                                    <Input disabled={true} />
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
                                                        disabled={true}
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
                                                        <Input disabled={true} />
                                                    </Form.Item>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <Form.Item>
                                        {/* <Button
                                            type="dashed"
                                            onClick={() => {
                                                const newShowGpus = [...showGpus, true];
                                                setShowGpus(newShowGpus);
                                                add();
                                            }}
                                            disabled={true}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Add sights
                                        </Button> */}
                                    </Form.Item>
                                </div>
                            )}
                        </Form.List>
                    </Form.Item>
                    <Form.Item name="optimization" label="optimization">
                        <div>
                            <Form.List name="cpuExecutionAccelerator">
                                {(fields4, {}) => (
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
                                            {/* <PlusCircleOutlined disabled={true} onClick={() => add()} /> */}
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
                                                            // onClick={() => remove(field.name)}
                                                        />
                                                    </div>
                                                    <Form.Item>
                                                        <Form.List name={[field.name, 'parameters']} key={field.key}>
                                                            {(fields5, {}) => (
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
                                                                        {/* <PlusCircleOutlined onClick={() => addTest()} /> */}
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
                                                                            // onClick={() => removeTest(fields.name)}
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
                                {(fields6, {}) => (
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
                                            {/* <PlusCircleOutlined disabled={true} onClick={() => add()} /> */}
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
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                        <MinusCircleOutlined
                                                            style={{
                                                                marginLeft: '10px',
                                                                marginTop: '10px'
                                                            }}
                                                            // onClick={() => remove(field.name)}
                                                        />
                                                    </div>
                                                    <Form.Item>
                                                        <Form.List name={[field.name, 'parameters']} key={field.key}>
                                                            {(fields7, {}) => (
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
                                                                        {/* <PlusCircleOutlined onClick={() => addTest()} /> */}
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
                                                                                <Input disabled={true} />
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
                                                                                <Input disabled={true} />
                                                                            </Form.Item>
                                                                            <MinusCircleOutlined
                                                                            // onClick={() => removeTest(fields.name)}
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
        </Content>
    );
};

export default ServerConfig;
