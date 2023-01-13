/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef, forwardRef, ForwardRefRenderFunction} from 'react';
import styled from 'styled-components';
import ModelTables from './ModelTables';
import CPUTables from './CPUTables';
import ServerConfig from './ServerConfig';
import {fetcher} from '~/utils/fetch';
import {rem} from '~/utils/style';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';
// import type {left} from '@antv/x6/lib/registry/port-label-layout/side';
const TableTitle = styled.div`
    margin-bottom: 20px;
    margin-top: 20px;
    font-size: 18px;
    font-weight: 900;
`;
const Buttons = styled.div`
    height: ${rem(36)};
    line-height: ${rem(36)};
    text-align: center;
    font-size: 16px;
    margin-left: 20px;
    min-width: 100px;
    width: auto;
    border: 1px solid;
    padding-left: 5px;
    padding-right: 5px;
`;
const ButtonContent = styled.div`
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    padding-bottom: 20px;
`;
const ButtonLeft = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    padding-bottom: 20px;
    .backgrounds {
        background-color: var(--navbar-background-color);
        color: white;
        border: none;
    }
`;
const ButtonRight = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    padding-bottom: 20px;
`;
type ArgumentProps = {
    server_id: any;
    Flag: number;
    onEdit: () => any;
};
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
// type ArgumentProps = {

// };
export type serverBoxRef = {
    outDatas(type: number): void;
};

console.log('PUBLIC_PATH', PUBLIC_PATH, PUBLIC_PATH + '/api/fastdeploy/fastdeploy_client');
const ServerBox: ForwardRefRenderFunction<serverBoxRef, ArgumentProps> = ({Flag, server_id, onEdit}) => {
    const [flag, setFlag] = useState(0);
    const [Datas, setDatas] = useState<any>({
        text: '',
        lengths: 0,
        metric: null
    });
    const [configs, setConfigs] = useState<any>();
    const {i18n, t} = useTranslation(['Fastdeploy']);
    // const {i18n} = useTranslation(['Fastdeploy']);
    const language: string = i18n.language;
    useEffect(() => {
        if (Flag === undefined) {
            return;
        }
        isAlive();
    }, [Flag]);
    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setCount(count + 1);
    //     }, 10000);
    //     console.log('更新了', timer);
    //     return () => clearInterval(timer);
    // }, [count]);
    //  Datas.metric
    const isAlive = () => {
        const serverId = server_id;
        // const length = Datas.text.length;
        fetcher(`/fastdeploy/check_server_alive?server_id=${serverId}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                // debugger;
                console.log('check_server_alive', res);
                outDatas();
            },
            res => {
                console.log('error_check_server_alive', res);
            }
        );
    };
    const outDatas = () => {
        const serverId = server_id;
        const length = Datas.text.length;
        fetcher(`/fastdeploy/get_server_output?server_id=${serverId}` + `&length=${length}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('get_server_output', res);
                metricDatas(serverId, res);
                getServe(serverId);
            },
            res => {
                console.log('get_server_output', res);
            }
        );
    };
    const clickOutDatas = () => {
        const serverId = server_id;
        const length = Datas.text.length;
        fetcher(`/fastdeploy/get_server_output?server_id=${serverId}` + `&length=${length}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('get_server_output', res);
                metricDatas(serverId, res);
                getServe(serverId);
                const message =
                    language === 'zh'
                        ? `${serverId} 更新日志和性能数据成功`
                        : `Update log and metric for ${serverId} successfully`;
                toast.success(message, {
                    autoClose: 2000
                });
            },
            res => {
                console.log('get_server_output', res);
            }
        );
    };
    const metricDatas = async (serverId: number, texts: any) => {
        await fetcher(`/fastdeploy/get_server_metric?server_id=${serverId}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('get_server_metric', res);
                setDatas({
                    ...Datas,
                    text: Datas.text + texts,
                    lengths: Datas.text.length + texts.length,
                    metric: res
                });
            },
            res => {
                console.log('get_server_output', res);
            }
        );
    };
    const getServe = async (serverId: number) => {
        await fetcher(`/fastdeploy/get_server_config?server_id=${serverId}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('get_server_config', res);
                setConfigs(res);
            },
            res => {
                console.log('get_server_output', res);
            }
        );
    };
    const cbRef: any = useRef();
    useEffect(() => {
        cbRef.current = outDatas;
    });
    useEffect(() => {
        const callback = () => {
            cbRef.current?.();
        };
        const timer = setInterval(() => {
            callback();
        }, 10000);
        return () => clearInterval(timer);
    }, []);
    // useImperativeHandle(ref, () => ({
    //     outData(serverId: number) {
    //         outDatas(serverId);
    //     }
    // }));
    return (
        <div>
            {flag === 0 ? (
                <div
                    style={{
                        whiteSpace: 'pre-wrap',
                        background: 'black',
                        color: 'white',
                        padding: '20px',
                        height: '650px',
                        overflowY: 'auto'
                    }}
                >
                    {Datas.text}
                </div>
            ) : flag === 1 ? (
                <div
                    style={{
                        whiteSpace: 'pre-wrap',
                        // background: 'black',
                        // color: 'white',
                        padding: '20px',
                        height: '650px',
                        overflowY: 'auto'
                    }}
                >
                    <div>
                        <TableTitle>{t('Fastdeploy:Model-metrics')}</TableTitle>
                        <ModelTables Datas={Datas?.metric?.Model}></ModelTables>
                    </div>
                    <div>
                        <TableTitle>{t('Fastdeploy:GPU-metrics')}</TableTitle>
                        <CPUTables Datas={Datas?.metric?.GPU}></CPUTables>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        whiteSpace: 'pre-wrap',
                        // background: 'black',
                        // color: 'white',
                        padding: '20px',
                        height: '650px',
                        overflowY: 'auto'
                    }}
                >
                    <ServerConfig serverId={server_id} modelData={configs}></ServerConfig>
                </div>
            )}
            <ButtonContent>
                <ButtonLeft>
                    <Buttons
                        className={flag === 0 ? 'backgrounds' : ''}
                        onClick={() => {
                            setFlag(0);
                        }}
                    >
                        {t('Fastdeploy:log')}
                    </Buttons>
                    <Buttons
                        className={flag === 1 ? 'backgrounds' : ''}
                        onClick={() => {
                            setFlag(1);
                        }}
                    >
                        {t('Fastdeploy:metric')}
                    </Buttons>
                    <Buttons
                        className={flag === 2 ? 'backgrounds' : ''}
                        onClick={() => {
                            setFlag(2);
                        }}
                    >
                        {t('Fastdeploy:model-repository')}
                    </Buttons>
                </ButtonLeft>
                <ButtonRight>
                    <Buttons
                        onClick={() => {
                            const url =
                                PUBLIC_PATH +
                                `/api/fastdeploy/fastdeploy_client?server_id=${server_id}` +
                                `&lang=${language}`;
                            window.open(url);
                        }}
                    >
                        {t('Fastdeploy:open-client')}
                    </Buttons>

                    <Buttons onClick={onEdit}>{t('Fastdeploy:shutdown')}</Buttons>
                    <Buttons
                        onClick={() => {
                            clickOutDatas();
                        }}
                    >
                        {t('Fastdeploy:updates')}
                    </Buttons>
                </ButtonRight>
            </ButtonContent>
        </div>
    );
};

export default forwardRef(ServerBox);
