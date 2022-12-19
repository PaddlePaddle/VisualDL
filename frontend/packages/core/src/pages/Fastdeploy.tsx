import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import {Tabs} from 'antd';
import Input from '~/components/Input';
import Content from '~/components/Content';
import FastdeployGraph from '~/components/FastdeployGraph';
import ServerBox from '~/components//FastdeployGraph/serverBox';
import {toast} from 'react-toastify';
import {fetcher} from '~/utils/fetch';
import HashLoader from 'react-spinners/HashLoader';
import {Select} from 'antd';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Modal} from 'antd';
import {filter} from '../resource/hyper-parameter/filter';
import {number} from 'echarts';

interface IAnyObj {
    [index: string]: unknown;
}

type TabPosition = 'left' | 'right' | 'top' | 'bottom';
const InputContent = styled.div`
    display: flex;
    height: ${rem(50)};
    justify-content: center;
    align-items: center;
    padding: 10px;
    .inputWrapper {
        width: 500px;
        border-radius: 0px;
        flex: 1;
    }
    .titleName {
        flex: 1;
        font-size: 28px;
    }
`;
const Contents = styled.div`
    height: 100%;
    background: white;
    display: flex;
    flex-direction: column;
`;
const Contents2 = styled.div`
    height: 100%;
    background: white;
    display: flex;
    justify-content: center;

    .inputContents {
        margin-top: 200px;
        width: 600px;
        height: 60px;
        display: flex;
        align-items: center;
        .ant-select-selector {
            height: 60px;
            .ant-select-selection-placeholder {
                line-height: 60px;
            }
            .ant-select-selection-item {
                line-height: 60px;
            }
        }
    }
    .inputButton {
        font-size: 24px;
        height: 40px;
        line-height: 40px;
        width: 80px;
        color: white;
        text-align: center;
        background-color: var(--navbar-background-color);
        margin-left: 20px;
    }
`;
const SelectContent = styled.div`
    height: 60px;
    display: flex;
    align-items: center;
    .ant-select {
        .ant-select-selector {
            height: 100%;
            .ant-select-selection-placeholder {
                line-height: 60px;
            }
            .ant-select-selection-item {
                line-height: 60px;
                color: black;
            }
        }
    }
`;
const Buttons = styled.div`
    height: ${rem(36)};
    line-height: ${rem(36)};
    text-align: center;
    font-size: 16px;
    margin-left: 20px;
    width: 100px;
    color: white;
    background-color: var(--navbar-background-color);
`;

const Titles = styled.div`
    font-size: 20px;
    padding-top: 150px;
    padding-bottom: 20px;
    text-align: center;
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
const TabsContent = styled.div`
    padding: 20px 10px 0px 10px;
    flex: 1;
    .ant-tabs-content-left {
        height: 100%;
    }
    .ant-tabs-nav-add {
        display: none;
    }
    .ant-tabs-nav-list {
        .ant-tabs-tab:nth-of-type(1) {
            .ant-tabs-tab-remove {
                display: none;
            }
        }
    }
`;
function App() {
    const {t} = useTranslation(['togglegraph']);
    const [show, setShow] = useState({
        show: true,
        show2: false
    });
    const [mode, setMode] = useState<TabPosition>('left');
    const [dirValue, setDirValue] = useState('.');
    const [dirs, setDirs] = useState('');
    const [selectOptions, setSelectOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modelData, setModelData] = useState<any>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [targetKeys, setTargetKey] = useState('');
    const [serverId, setServerId] = useState<number>();
    const [serverModels, setServerModels] = useState<any>([]);
    const [opens, setOPens] = useState(false);
    const [opens2, setOPens2] = useState(false);
    const [metric, setMetric] = useState(false);
    useEffect(() => {
        GetServerList();
    }, []);
    useEffect(() => {
        // const Graphs: any = Graph;
        // getModelData();
        getDir(dirValue);
    }, [dirValue]);
    useEffect(() => {
        if (serverId !== undefined) {
            // outDatas(serverId);
            const serverModel = serverModels;
            let flag = false;
            for (const model of serverModels) {
                if (model.id === serverId) {
                    flag = true;
                }
            }
            if (flag) {
                const newServerModel = serverModel.map((model: any) => {
                    if (model.id === serverId) {
                        return {
                            Id: serverId,
                            flag: !model.flag
                        };
                    } else {
                        return model;
                    }
                });
                setServerModels(newServerModel);
            } else {
                const newServerModel = [
                    ...serverModel,
                    {
                        Id: serverId,
                        flag: true
                    }
                ];
                setServerModels(newServerModel);
            }
        }
    }, [serverId]);
    // useEffect(() => {
    //     if (serverId !== undefined) {
    //         metricDatas(serverId);
    //     }
    // }, [metric]);
    // useEffect(() => {
    //     debugger;
    //     if (!serverModels.length) {
    //         return;
    //     }
    //     setReforce(!reforce);
    // }, [serverModels.length]);
    const GetServerList = () => {
        setLoading(true);
        fetcher(`/fastdeploy/get_server_list`, {
            method: 'GET'
        }).then(
            (res: any) => {
                const ServerModel = res.map((Id: number) => {
                    return {
                        flag: true,
                        Id: Id
                    };
                });
                setServerModels(ServerModel);
                // ChangeServerId(res[0]);
                setLoading(false);
            },
            res => {
                console.log('get_server_output', res);
                // setServerId(undefined);
                setLoading(false);
            }
        );
    };
    // const outDatas = (serverId: number) => {
    //     let length = 0;
    //     for (const model of serverModels) {
    //         if (model.id === serverId) {
    //             length = model.text.length;
    //         }
    //     }
    //     fetcher(`/fastdeploy/get_server_output?server_id=${serverId}` + `&length=${length}`, {
    //         method: 'GET'
    //     }).then(
    //         (res: any) => {
    //             console.log('get_server_output', res);
    //             const serverModel = serverModels;
    //             console.log('serverModelsss', serverModel);

    //             const newServerModel = serverModel.map((model: any) => {
    //                 console.log('model.id === serverId', serverId, model.id, model);
    //                 if (model.id === serverId) {
    //                     return {
    //                         ...model,
    //                         text: model.text + res,
    //                         lengths: model.text.length + res.length,
    //                         id: model.id
    //                     };
    //                 } else {
    //                     return model;
    //                 }
    //             });
    //             const flag = serverModel.some((model: any) => {
    //                 return model.id === serverId;
    //             });
    //             if (!flag) {
    //                 newServerModel.push({
    //                     text: res,
    //                     lengths: res.length,
    //                     id: serverId
    //                 });
    //             }
    //             console.log('newServerModel', newServerModel);
    //             setServerModels(newServerModel);
    //             metricDatas(serverId);
    //             ChangeServerId(serverId);
    //             // setMetric(!metric);
    //             // setServerId(undefined);
    //             // setLoading(false);
    //         },
    //         res => {
    //             console.log('get_server_output', res);
    //             // setServerId(undefined);
    //             setLoading(false);
    //         }
    //     );
    // };
    // const metricDatas = (serverId: number) => {
    //     fetcher(`/fastdeploy/get_server_metric?server_id=${serverId}`, {
    //         method: 'GET'
    //     }).then(
    //         (res: any) => {
    //             console.log('get_server_metric', res);

    //             const serverModel = serverModels;
    //             const newServerModel = serverModel.map((model: any) => {
    //                 if (model.id === serverId) {
    //                     return {
    //                         ...model,
    //                         metric: res
    //                     };
    //                 } else {
    //                     return model;
    //                 }
    //             });
    //             // const flag = serverModel.some((model: any) => {
    //             //     return model.id === serverId;
    //             // });
    //             // if (!flag) {
    //             //     newServerModel.push({

    //             //         id: serverId
    //             //     });
    //             // }
    //             setServerModels(newServerModel);
    //             // setServerId(undefined);
    //             setLoading(false);
    //         },
    //         res => {
    //             console.log('get_server_output', res);
    //             // setServerId(undefined);
    //             setLoading(false);
    //         }
    //     );
    // };
    const getModelData = () => {
        fetcher(`/fastdeploy/get_config?dir=${dirValue}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('blobres', res);
                // downloadEvt(res.data, fileName);
                setDirs(dirValue);
                setDirValue('.');
                setModelData(res);
                setIsModalOpen(false);
                setLoading(false);
            },
            res => {
                setLoading(false);
            }
        );
    };
    const ChangeServerId = (id: number) => {
        setServerId(id);
    };
    const SplicingDir = (value: string) => {
        if (value === '..') {
            const newDir = dirValue?.split('/');
            const newDir2 = newDir.splice(0, newDir.length - 1).join('/');
            setDirValue(newDir2);
        } else {
            const newDir = dirValue + `/${value}`;
            setDirValue(newDir);
        }
    };
    const getDir = (dir: string) => {
        fetcher(`/fastdeploy/get_directory?dir=${dir}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('res', res);
                // downloadEvt(res.data, fileName);
                // setModelData(res);
                if (res?.sub_dir.length > 0) {
                    const newOptions = res?.sub_dir.map((dir: string) => {
                        return {
                            value: dir,
                            label: dir
                        };
                    });
                    setSelectOptions(newOptions);
                }
                setLoading(false);
            },
            res => {
                setLoading(false);
            }
        );
    };
    const ChangeModelClick = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        // onFinish();
        getModelData();
    };
    const handleOk2 = () => {
        stopSever(targetKeys);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const handleCancel2 = () => {
        setIsModalOpen2(false);
    };
    const stopSever = (targetKey: string) => {
        fetcher(`/fastdeploy/stop_server?server_id=${targetKey}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('res', res);
                // downloadEvt(res.data, fileName);
                // setModelData(res);
                remove(targetKey);
                setLoading(false);
            },
            res => {
                setLoading(false);
            }
        );
    };
    const remove = (targetKey: string) => {
        const serverModel = serverModels;
        const newServerModel = serverModel.filter((model: any) => {
            const modelId = `${model.Id}`;
            console.log('modelId = `${model.Id}`;', modelId, targetKey);

            if (modelId !== targetKey) {
                return model;
            }
        });
        console.log(newServerModel);
        setServerModels(newServerModel);
        setIsModalOpen2(false);
    };

    const onEdit: any = (targetKey: string, action: 'add' | 'remove') => {
        if (action === 'add') {
            console.log(11111);
        } else {
            // stopSever(targetKey);
            setTargetKey(targetKey);
            setIsModalOpen2(true);
        }
    };
    console.log('serverModels', serverModels);

    return (
        <Content>
            {loading && (
                <Loading>
                    <HashLoader size="60px" color={primaryColor} />
                </Loading>
            )}
            {/* {modelData ? (
                <Contents>
                    <InputContent>
                        <div className="titleName">{`当前模型库:${dirs}`}</div>
                        <Buttons onClick={ChangeModelClick}>更换模型库</Buttons>
                    </InputContent>
                    <TabsContent>
                        <Tabs
                            defaultActiveKey="1"
                            type="editable-card"
                            onEdit={onEdit}
                            tabPosition={mode}
                            style={{height: '100%'}}
                        >
                            {modelData && (
                                <Tabs.TabPane tab=" ensemble模型结构" key="item-1" style={{height: '100%'}}>
                                    <FastdeployGraph
                                        modelData={modelData}
                                        dirValue={dirs}
                                        ChangeServerId={ChangeServerId}
                                    ></FastdeployGraph>
                                </Tabs.TabPane>
                            )}
                            {serverModels &&
                                serverModels.map((server: any) => {
                                    // debugger;
                                    return (
                                        <Tabs.TabPane tab={`Server${server.id}`} key={server.id}>
                                            <ServerBox
                                                Datas={server.text}
                                                updatdDatas={() => {
                                                    outDatas(server.id);
                                                }}
                                            ></ServerBox>
                                        </Tabs.TabPane>
                                    );
                                })}
                        </Tabs>
                    </TabsContent>
                </Contents>
            ) : (
                <Contents2>
                    <div className="inputContents">
                        <Select
                            style={{width: '80%', height: '60px'}}
                            placeholder="Search to Select"
                            optionFilterProp="children"
                            // mode={'tags'}
                            // className="ant-select-open"
                            onFocus={() => {
                                setOPens(true);
                            }}
                            onBlur={() => {
                                setOPens(false);
                            }}
                            open={opens}
                            // filterOption={(input, option) => (option?.label ?? '').includes(input)}
                            value={dirValue}
                            options={selectOptions}
                            onChange={value => {
                                SplicingDir(value);
                            }}
                        />
                        <div className="inputButton" onClick={getModelData}>
                            确定
                        </div>
                    </div>
                </Contents2>
            )} */}
            <Contents>
                <InputContent>
                    <div className="titleName">{dirs ? `载入模型库:${dirs}` : `请选择模型库`}</div>
                    <Buttons onClick={ChangeModelClick}>载入模型库</Buttons>
                </InputContent>
                <TabsContent>
                    <Tabs
                        defaultActiveKey="1"
                        type="editable-card"
                        onEdit={onEdit}
                        tabPosition={mode}
                        style={{height: '100%'}}
                        onChange={activeKey => {
                            console.log('activeKey', activeKey);
                            if (activeKey !== 'item-1') {
                                const serverModel = serverModels;
                                const activeKeys = Number(activeKey);
                                const newServerModel = serverModel.map((model: any) => {
                                    if (model.id === activeKeys) {
                                        return {
                                            Id: serverId,
                                            flag: !model.flag
                                        };
                                    } else {
                                        return model;
                                    }
                                });
                                setServerModels(newServerModel);
                            }
                        }}
                    >
                        <Tabs.TabPane tab=" ensemble模型结构" key="item-1" style={{height: '100%'}}>
                            <FastdeployGraph
                                modelData={modelData}
                                dirValue={dirs}
                                ChangeServerId={ChangeServerId}
                            ></FastdeployGraph>
                        </Tabs.TabPane>

                        {serverModels &&
                            serverModels.map((server: any) => {
                                // debugger;
                                return (
                                    <Tabs.TabPane tab={`Server${server.Id}`} key={server.Id}>
                                        <ServerBox
                                            server_id={server.Id}
                                            Flag={server.flag}
                                            // updatdDatas={() => {
                                            //     outDatas(server.id);
                                            // }}
                                        ></ServerBox>
                                    </Tabs.TabPane>
                                );
                            })}
                    </Tabs>
                </TabsContent>
            </Contents>
            <Modal
                width={800}
                title="更换模型"
                cancelText={'取消'}
                okText={'更换模型库'}
                visible={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <SelectContent>
                    <Select
                        style={{width: '100%', height: '60px'}}
                        placeholder="Search to Select"
                        optionFilterProp="children"
                        onFocus={() => {
                            setOPens2(true);
                        }}
                        onBlur={() => {
                            setOPens2(false);
                        }}
                        open={opens2}
                        // filterOption={(input, option) => (option?.label ?? '').includes(input)}
                        value={dirValue}
                        options={selectOptions}
                        onChange={value => {
                            SplicingDir(value);
                        }}
                    />
                </SelectContent>
            </Modal>
            <Modal
                width={800}
                title="Basic Modal"
                cancelText={'取消'}
                okText={'关闭服务'}
                visible={isModalOpen2}
                onOk={handleOk2}
                onCancel={handleCancel2}
            >
                请确认是否关闭所启动服务
            </Modal>
            {/* {React.lazy(() => import('~/components/Fastdeploy'))} */}
        </Content>
    );
}
export default App;
