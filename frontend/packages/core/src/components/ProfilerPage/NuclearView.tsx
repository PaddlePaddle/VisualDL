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

import React, {FunctionComponent, useCallback, useMemo, useState, useEffect} from 'react';
import StackColumnChart from '~/components/StackColumnChart';
import Select from '~/components/Select';
import type {SelectProps} from '~/components/Select';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {fetcher} from '~/utils/fetch';
import {Popover} from 'antd';
import {em, sameBorder, transitionProps,asideWidth, rem} from '~/utils/style';
import logo from '~/assets/images/question-circle.svg';
import hover from '~/assets/images/hover.svg';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
interface DataType {
    key: React.Key;
    name: string;
    age: number;
    street: string;
    building: string;
    number: number;
    companyAddress: string;
    companyName: string;
    gender: string;
}
asideWidth;

const ViewWrapper = styled.div`
    width: 100%;
    height: 100%;
    flex-grow: 1;
    position: relative;
    background-color: #fff;
`;
const Title = styled.div`
    width: 100%;
    height: ${rem(50)};
    font-family: PingFangSC-Medium;
    font-size: ${rem(16)};
    color: #333333;
    line-height: ${rem(50)};
    font-weight: 500;
    padding-left: ${rem(20)};
    border-bottom: 1px solid #dddddd;
    margin-bottom: ${rem(20)};
`;
const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
    height: 100%;
    font-size: ${rem(14)};
`;
const Configure = styled.div`
    margin-top: ${rem(30)};
    width: 100%;
    font-family: PingFangSC-Medium;
    font-size: ${rem(16)};
    color: #333333;
    font-weight: 500;
    padding-left: ${rem(20)};
    padding-right: ${rem(20)};
    .titles{
        margin-bottom: ${rem(20)};
    }
    .titleContent {
        margin-bottom: ${rem(10)};
        display: flex;
        align-items: center;
        .title {
            display: flex;
            align-items: center;
            .argument-operation {
                flex: none;
                cursor: pointer;
                font-size: ${em(14)};
                margin-left: ${em(10)};
                color: var(--text-lighter-color);
                ${transitionProps('color')}
                &:hover,
                &:active {
                    color: #2932e1;
                }
                img {
                    width: 16px;
                    height: 16px;
                }
                img:hover {
                    content: url(${hover});
                }
            }
        }
        display: flex;
        justify-content: space-between;
        .searchContent {
            display: flex;
            align-items:center;
            .select_label{
                margin-right: ${rem(15)};
            }
            .select_wrapper {
                width: ${rem(64)};
                height: ${rem(36)};
                margin-right: ${rem(15)};
            }
        }
    }
`;
const EchartPie4 = styled.div`
    width: 100%;
    border: 1px solid #dddddd;
    border-radius: 4px;
    height: ${rem(366)};
    display: flex;
    .wraper {
        flex: 1;
        .Content {
            height: 100%;
        }
    }
    .Content {
        height: 100%;
        width: 100%;
    }
`;
const Card = styled.div`
    width: 100%;
    height: ${rem(142)};
    border: 1px solid #dddddd;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    font-weight: 400;
    display: flex;
    .item_list {
        flex: 1;
        display: flex;
        align-items: center;
        div:nth-of-type(1) {
            padding-left: 20px;
        }
        div:nth-of-type(3) {
            border-right: none;
        }
        .items {
            padding-left: 30px;
            padding-right: 30px;
            border-right: 1px solid #dddddd;
        }
    }
    .info_list {
        flex: 1;
        .items:nth-of-type(1) {
            margin-top: 14px;
        }
        .items {
            display: flex;
            margin-top: 8px;
            justify-content: center;
            .label {
                width: 220px;
                padding-right: 30px;
                text-align: right;
                color: #666666;
            }
            .info {
                width: 220px;
                text-align: left;
                color: #000000;
            }
        }
    }
`;

export type NuclearViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
    units: string;

};
type SelectListItem<T> = {
    value: T;
    label: string;
};
const NuclearView: FunctionComponent<NuclearViewProps> = ({runs, views, workers, spans,units}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const [computation, setComputation] = useState<any>();
    const [distributedData, setDistributedData] = useState<any>();
    const [stepsList, setStepsList] = useState<SelectListItem<string>[]>();
    const [steps, setSteps] = useState<string>('2');
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/distributed/histogram' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`+ `&step=${steps}`+ `&time_unit=${units}`).then(
                (res: unknown) => {
                    const Data: any = res;
                    console.log('distributed,', Data);
                    setComputation(Data);
                }
            );
            fetcher(
                '/profiler/distributed/info' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`
            ).then((res: any) => {
                console.log('info,', res);
                setDistributedData(res.data);
            });
            fetcher('/profiler/distributed/steps' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then((res: unknown) => {
                const stepData = res as string[];
                const stepList = stepData.map((item, index) => {
                    return {label: item, value: item};
                });
                setStepsList(stepList);
                setSteps(stepData[0]);
            });
        }
    }, [runs, workers, spans, views]);
    const color = [
        '#2932E1',
        '#066BFF',
        '#00CC88',
        '#FF6600',
        '#25C9FF'
    ];
    const tooltips = (
        <div>
            <p>Content</p>
            <p>Content</p>
        </div>
    );
    return (
        <ViewWrapper>
            <Title>分布视图</Title>
            <Configure>
                <div className="titles">设备信息</div>
                <div>
                    {distributedData && distributedData.map((items: any) => {
                        return (
                            <Card>
                                <div className="item_list">
                                    <div className="items">{items.worker_name}</div>
                                    <div className="items">{items.process_id}</div>
                                    <div className="items">{items.device_id}</div>
                                </div>
                                <div className="info_list">
                                    <div className="items">
                                        <div className="label">Name:</div>
                                        <div className="info">{items.name}</div>
                                    </div>
                                    <div className="items">
                                        <div className="label">Memory:</div>
                                        <div className="info">{items.memory}</div>
                                    </div>
                                    <div className="items">
                                        <div className="label">Memory Raw:</div>
                                        <div className="info">{items.computeCapability}</div>
                                    </div>
                                    <div className="items">
                                        <div className="label">Compute Capability:</div>
                                        <div className="info">{items.utilization}</div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Configure>
            <Configure>
            <div className="titleContent">
                    <div className="title">
                        <div>Computation和communication的耗时对比</div>
                        <Popover content={tooltips} placement="right">
                        <a className="argument-operation" onClick={() => {}}>
                            <img src={PUBLIC_PATH + logo} alt="" />
                        </a>
                        </Popover>
                    </div>
                    <div className="searchContent">
                        <div className='select_label'>
                            训练步数
                        </div>
                        <div className="select_wrapper">
                            <FullWidthSelect list={stepsList} value={steps} onChange={setSteps} />
                        </div>
                    </div>
                </div>
                <EchartPie4>
                    <StackColumnChart className={'Content'} data={computation} color={color}></StackColumnChart>
                </EchartPie4>
            </Configure>
        </ViewWrapper>
    );
};

export default NuclearView;
