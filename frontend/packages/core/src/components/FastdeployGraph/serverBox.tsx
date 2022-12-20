/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef, forwardRef, ForwardRefRenderFunction} from 'react';
import styled from 'styled-components';
import ModelTables from './ModelTables';
import CPUTables from './CPUTables';
import {fetcher} from '~/utils/fetch';
import {rem} from '~/utils/style';
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
    width: 100px;
    color: white;
    background-color: var(--navbar-background-color);
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
};
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
// type ArgumentProps = {

// };
export type serverBoxRef = {
    outDatas(type: number): void;
};

console.log('PUBLIC_PATH', PUBLIC_PATH, PUBLIC_PATH + '/api/fastdeploy/fastdeploy_client');
const ServerBox: ForwardRefRenderFunction<serverBoxRef, ArgumentProps> = ({Flag, server_id}) => {
    const [flag, setFlag] = useState(true);
    const [Datas, setDatas] = useState<any>({
        text: '',
        lengths: 0,
        metric: null
    });
    useEffect(() => {
        if (Flag === undefined) {
            return;
        }
        outDatas();
    }, [Flag]);
    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setCount(count + 1);
    //     }, 10000);
    //     console.log('更新了', timer);
    //     return () => clearInterval(timer);
    // }, [count]);
    //  Datas.metric
    const outDatas = () => {
        const serverId = server_id;
        const length = Datas.text.length;
        fetcher(`/fastdeploy/get_server_output?server_id=${serverId}` + `&length=${length}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('get_server_output', res);
                metricDatas(serverId, res);
            },
            res => {
                console.log('get_server_output', res);
            }
        );
    };
    const metricDatas = (serverId: number, texts: any) => {
        fetcher(`/fastdeploy/get_server_metric?server_id=${serverId}`, {
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
            {flag ? (
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
                    <div>
                        <TableTitle>模型服务监控</TableTitle>
                        <ModelTables Datas={Datas?.metric?.Model}></ModelTables>
                    </div>
                    <div>
                        <TableTitle>GPU监控</TableTitle>
                        <CPUTables Datas={Datas?.metric?.GPU}></CPUTables>
                    </div>
                </div>
            )}
            <ButtonContent>
                <ButtonLeft>
                    <Buttons
                        onClick={() => {
                            setFlag(true);
                        }}
                    >
                        日志
                    </Buttons>
                    <Buttons
                        onClick={() => {
                            setFlag(false);
                        }}
                    >
                        性能
                    </Buttons>
                </ButtonLeft>
                <ButtonRight>
                    <Buttons
                        onClick={() => {
                            const url = PUBLIC_PATH + `/api/fastdeploy/fastdeploy_client?server_id=${server_id}`;
                            window.open(url);
                        }}
                    >
                        打开客户端
                    </Buttons>
                    <Buttons
                        onClick={() => {
                            outDatas();
                        }}
                    >
                        更新数据
                    </Buttons>
                </ButtonRight>
            </ButtonContent>
        </div>
    );
};

export default forwardRef(ServerBox);
