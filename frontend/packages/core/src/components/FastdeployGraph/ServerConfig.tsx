import React, {useState, useEffect, useRef, FunctionComponent} from 'react';
import {
    MinusCircleOutlined,
    PlusOutlined,
    PlusCircleOutlined,
    DownOutlined,
    VerticalAlignBottomOutlined
} from '@ant-design/icons';
import {Button, Form, Input, Select, Space} from 'antd';
import type {TreeProps} from 'antd/es/tree';
import {Tree} from 'antd';
import styled from 'styled-components';
import {Modal} from 'antd';
import {Child} from '../ProfilerPage/OperatorView/type';
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
    #graph-container {
        width: calc(100% - 180px);
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
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
};
const ServerConfig: FunctionComponent<ArgumentProps> = ({modelData}) => {
    const [graphModel, setGraphModel] = useState<any>();
    const [modelName, setModelName] = useState<string>();
    const [nodeClick, setNodeClick] = useState<any>();
    const [showFlag, setShowFlag] = useState<boolean>();
    const [IsEmsembles, setIsEmsembles] = useState<boolean>();
    const [showGpus, setShowGpus] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ensemblesName, setEnsemblesName] = useState<string>();
    const [form] = Form.useForm();
    const [treeData, setTreeData] = useState(modelData?.ensembles[0]?.versions);
    const getmodelData = (model: any, name: string) => {
        setModelName(name);
        setGraphModel(model);
        const treedata = model.versions.map((version: any) => {
            return {
                ...version
                // icon: <VerticalAlignBottomOutlined />
            };
        });
        // const treedatas = getTreeData(model.versions);
        // const treedata = treedatas.map((version: any) => {
        //     return {
        //         ...version,
        //         checkable: true,
        //         icon:<VerticalAlignBottomOutlined />,
        //     };
        // });
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
                <div id="graph-container">
                    <img src={modelData && modelData['ensemble-img']} alt="" />
                </div>
                <div id="stencil_content">
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
                    <div id="buttonContent">
                        <Buttons
                            style={{
                                width: '160px'
                            }}
                            onClick={changeEmsembles}
                        >
                            ensemble配置
                        </Buttons>
                    </div>
                </div>
            </div>
            <Modal
                width={800}
                title={IsEmsembles ? '配置ensemble' : '配置模型'}
                visible={isModalOpen}
                cancelText={'取消'}
                okText={'确定'}
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
                                                >{`实例${index + 1}`}</div>
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
