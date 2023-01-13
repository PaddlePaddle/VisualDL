/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import {Tabs} from 'antd';
import Content from '~/components/Content';
import FastdeployGraph from '~/components/FastdeployGraph';
import ServerBox from '~/components//FastdeployGraph/serverBox';
import {fetcher} from '~/utils/fetch';
import HashLoader from 'react-spinners/HashLoader';
import {Select} from 'antd';
import styled from 'styled-components';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';
import {Modal} from 'antd';

// type TabPosition = 'left' | 'right' | 'top' | 'bottom';
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
    min-width: 100px;
    padding-left: 5px;
    padding-right: 5px;
    color: white;
    background-color: var(--navbar-background-color);
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
const mode = 'left';
function App() {
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
    const [opens2, setOPens2] = useState(false);
    const {t} = useTranslation(['Fastdeploy']);
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
            const serverModel = serverModels;
            let flag = false;
            for (const model of serverModels) {
                if (model.Id === serverId) {
                    flag = true;
                }
            }
            if (flag) {
                const newServerModel = serverModel.map((model: any) => {
                    if (model.Id === serverId) {
                        return {
                            Id: serverId + '',
                            flag: !model.flag
                        };
                    } else {
                        return model;
                    }
                });
                setServerModels(newServerModel);
            } else {
                GetServerList();
            }
        }
    }, [serverId]);
    const GetServerList = () => {
        setLoading(true);
        fetcher(`/fastdeploy/get_server_list`, {
            method: 'GET'
        }).then(
            (res: any) => {
                const ServerModel = res.map((Id: number) => {
                    return {
                        flag: true,
                        Id: Id + ''
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
    const getModelData = (dirValues: string) => {
        fetcher(`/fastdeploy/get_config?dir=${dirValues}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('blobres', res);
                // downloadEvt(res.data, fileName);
                setDirs(dirValues);
                setDirValue('.');
                setModelData(res);
                setIsModalOpen(false);
                setLoading(false);
            },
            res => {
                console.log('errblobres', res);
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
                console.log('errblobres', res);
                setLoading(false);
            }
        );
    };
    const ChangeModelClick = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        // onFinish();
        getModelData(dirValue);
    };
    const handleOk2 = () => {
        // debugger;
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
                // debugger;
                remove(targetKey);
                setLoading(false);
                toast.success(t('Fastdeploy:Shutdown-server-successfully'), {
                    autoClose: 2000
                });
            },
            res => {
                console.log('errblobres', res);
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
        setServerId(undefined);
        setIsModalOpen2(false);
    };

    const onEdit: any = (targetKey: string, action: 'add' | 'remove') => {
        // debugger;
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
                    <div className="titleName">
                        {dirs ? `${t('Fastdeploy:Current-model')}:${dirs}` : t('Fastdeploy:Load-model')}
                    </div>
                    <Buttons onClick={ChangeModelClick}>{t('Fastdeploy:load-model-repository')}</Buttons>
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
                                const activeKeys = activeKey + '';
                                console.log('serverModel', serverModel);

                                const newServerModel = serverModel.map((model: any) => {
                                    if (model.Id === activeKeys) {
                                        return {
                                            Id: model.Id + '',
                                            flag: !model.flag
                                        };
                                    } else {
                                        return model;
                                    }
                                });
                                console.log('newServerModel', newServerModel);
                                setServerModels(newServerModel);
                            }
                        }}
                    >
                        <Tabs.TabPane tab={t('ensemble-pipeline')} key="item-1" style={{height: '100%'}}>
                            <FastdeployGraph
                                modelData={modelData}
                                // upModels={getModelData}
                                dirValue={dirs}
                                ChangeServerId={ChangeServerId}
                            ></FastdeployGraph>
                        </Tabs.TabPane>

                        {serverModels &&
                            serverModels.map((server: any) => {
                                // debugger;
                                return (
                                    <Tabs.TabPane tab={`Server-${server.Id}`} key={server.Id}>
                                        <ServerBox
                                            server_id={server.Id}
                                            Flag={server.flag}
                                            onEdit={() => {
                                                const id = server.Id + '';
                                                onEdit(id, 'remove');
                                            }}
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
                title={t('Fastdeploy:Load-model-repository')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:load-model-repository')}
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
                title={t('Fastdeploy:Shutdown-server')}
                cancelText={t('Fastdeploy:cancel')}
                okText={t('Fastdeploy:shutdown')}
                visible={isModalOpen2}
                onOk={handleOk2}
                onCancel={handleCancel2}
            >
                {t('Fastdeploy:Confirm')}
            </Modal>
            {/* {React.lazy(() => import('~/components/Fastdeploy'))} */}
        </Content>
    );
}
export default App;
