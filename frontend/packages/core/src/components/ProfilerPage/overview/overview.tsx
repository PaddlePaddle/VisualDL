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

import React, {FunctionComponent, useEffect, useState} from 'react';
import PieChart, {LineChartRef} from '~/components/pieChart';
import StackColumnChart from '~/components/StackColumnChart';
import Trainchart from '~/components/Trainchart';
import {fetcher} from '~/utils/fetch';
import {asideWidth, rem} from '~/utils/style';
import {consumingColumns, customizeColumns} from './tools';
import styled from 'styled-components';
import {Configure, ButtonsLeft, ButtonsRight, RadioButtons} from '../../components';
import Environment from './Environment';
import PerformanceContent from './PerformanceContent';

import type {
    environmentType,
    consumingType,
    trainType,
    tableType,
    perspectiveType,
    Event,
    performanceType,
    Gpu,
    distributedData
} from './types';
import {useTranslation} from 'react-i18next';
import {Table, Tabs, Popover} from 'antd';
import Icon from '~/components/Icon';

asideWidth;

const ViewWrapper = styled.div`
    width: 100%;
    height: 100%;
    flex-grow: 1;
    position: relative;
    background-color: #fff;
`;
const Configures = styled(Configure)`
    .tabs_title {
        position: absolute;
        margin-bottom: 0px;
        height: 46px;
        line-height: 46px;
    }
    .ant-tabs-centered > .ant-tabs-nav .ant-tabs-nav-wrap:not([class*='ant-tabs-nav-wrap-ping']) {
        justify-content: flex-end;
    }
    .ant-tabs-ink-bar {
        display: none;
    }
    .ant-tabs-top > .ant-tabs-nav,
    .ant-tabs-bottom > .ant-tabs-nav,
    .ant-tabs-top > div > .ant-tabs-nav,
    .ant-tabs-bottom > div > .ant-tabs-nav {
        margin-bottom: 0px;
        border: none;
    }
    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #1527c2;
    }
    .is_active {
        color: #ffffff;
        background: #2932e1;
        border: 1px solid rgba(41, 50, 225, 1);
    }
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

const EchartPie = styled.div`
    width: 100%;
    height: ${rem(270)};
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
    .ant-radio-inner {
        background-color: #fff;
        border-color: #ffffff;
        border-style: solid;
        border-width: 2px;
        border-radius: 50%;
    }
    .tooltipContent {
        padding-right: ${rem(30)};
        .tooltipitems {
            display: flex;
            align-items: center;
        }
    }
`;
const EchartPie3 = styled(EchartPie)`
    border: 1px solid #dddddd;
    height: ${rem(444)};
    padding: ${rem(24)};
`;
const EchartPie4 = styled(EchartPie3)`
    height: ${rem(366)};
`;
const PieceContent = styled.div`
    border: 1px solid #dddddd;
    border-radius: 4px;
    width: 100%;
    height: auto;
    padding-bottom: ${rem(20)};
    .expendContent {
        display: flex;
        .expendButton {
            color: #a3a3a3;
            margin-left: ${rem(20)};
            margin-right: ${rem(10)};
        }
        i {
            line-height: ${rem(30)};
        }
    }
    .tableContent {
        padding: ${rem(20)};
        .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > thead > tr > th {
            background: #f3f8fe;
        }
        .ant-table.ant-table-bordered > .ant-table-container {
            border: 1px solid #dddddd;
            border-radius: 8px;
        }
    }
`;

export type overViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
    units: string;
};
interface cpuData {
    value: number;
    name: string;
    proportion: number
};
interface chartDataType {
    gpu:cpuData[];
    cpu:cpuData[];
};
const overView: FunctionComponent<overViewProps> = ({runs, views, workers, spans, units}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const [environment, setEnvironment] = useState<environmentType>();
    const [distributed, setDistributed] = useState<distributedData>();
    const [isCPU, setIsCPU] = useState(true);
    const [chartData, setChartData] = useState<chartDataType>();
    const [performanceData, setPerformanceData] = useState<performanceType>();
    const [isExpend, setIsExpend] = useState(false);
    const [tableData, setTableData] = useState<tableType[]>();
    const [tableData2, setTableData2] = useState<Event[]>();
    const [trainData, setTrainData] = useState<trainType>();
    useEffect(() => {
        if (runs && workers && spans && units) {
            // 设备详情
            fetcher('/profiler/overview/environment' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const Data = res as environmentType;
                    console.log('environment', Data);
                    setEnvironment(Data);
                }
            );
            // 运行耗时
            fetcher(
                '/profiler/overview/model_perspective' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const result = res as consumingType;
                let tableDatas: tableType[] = [];
                let data:Gpu[] = [];
                for (const item of result.gpu) {
                    let DataTypeItem:{[key:string]:any} = {};
                    for (const key of result.column_name) {
                        if (key !== 'name' && key !== 'calls') {
                            const keys = 'GPU' + key;
                            const items = item;
                            DataTypeItem[keys] = items[key as keyof typeof item];
                        }
                    }
                    data.push(DataTypeItem as Gpu);
                }
                for (let index = 0; index < result.cpu.length; index++) {
                    const DataTypeItem: tableType = {
                        ...result.cpu[index],
                        ...data[index]
                    };
                    tableDatas.push(DataTypeItem);
                }
                console.log('tableData', tableDatas);
                setTableData(tableDatas);
                result.cpu.shift();
                result.gpu.shift();
                const chartData:chartDataType = {
                    cpu:[],
                    gpu:[]
                };
                for (const item of result.cpu) {
                    chartData.cpu.push({
                        value: item.total_time,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                for (const item of result.gpu) {
                    chartData.gpu.push({
                        value: item.total_time,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                setChartData(chartData as chartDataType);
            });
            // 自定义事件耗时
            fetcher(
                '/profiler/overview/userdefined_perspective' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const Data = res as perspectiveType;
                console.log('TableData2,', Data);
                const events = Data.events;
                const TableDatas = events.map((item) => {
                    return {
                        key: item.name,
                        ...item
                    };
                });
                setTableData2(TableDatas);
            });
            // 模型各阶段消耗
            fetcher(
                '/profiler/overview/event_type_model_perspective' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const Data = res as distributedData;
                console.log('distributed,', Data);
                setDistributed(Data);
            });
        }
    }, [runs, workers, spans, views, units]);

    useEffect(() => {
        const device_type = isCPU ? 'cpu' : 'gpu';
        if (runs && workers && spans && units) {
            // 性能消耗
            fetcher(
                '/profiler/overview/event_type_perspective' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&device_type=${device_type}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const result = res as performanceType;
                console.log('PerformanceData', result);
                setPerformanceData(result);
            });
            // 训练步数耗时
            fetcher(
                '/profiler/overview/model_perspective_perstep' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&device_type=${device_type}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const Data = res as trainType;
                console.log('TrainData,', Data);
                setTrainData(Data);
            });
        }
    }, [runs, workers, spans, views, isCPU, units]);
    const color = [
        '#2932E1',
        '#00CC88',
        '#981EFF',
        '#066BFF',
        '#00E2FF',
        '#FFAA00',
        '#E71ED5',
        '#FF6600',
        '#0DEBB0',
        '#D50505'
    ];
    return (
        <ViewWrapper>
            <Title>总览视图</Title>
            {environment && <Environment environment={environment}></Environment>}
            <Configures>
                <div className="title">运行耗时</div>
                <PieceContent>
                    <EchartPie style={{paddingRight: `${rem(0)}`, paddingTop: `${rem(0)}`}}>
                        <div className="wraper" style={{borderRight: '1px solid #dddddd', marginRight: `${rem(10)}`}}>
                            <PieChart className={'Content'} data={chartData?.cpu} isCpu={true} color={color} />
                        </div>
                        <div className="wraper">
                            <PieChart className={'Content'} data={chartData?.gpu} isCpu={false} color={color} />
                        </div>
                    </EchartPie>
                    <div
                        className="expendContent"
                        onClick={() => {
                            setIsExpend(!isExpend);
                        }}
                    >
                        <div className="expendButton">展开查看耗时详情</div>
                        <Icon type={isExpend ? 'chevron-up' : 'chevron-down'} />
                    </div>
                    {isExpend && tableData ? (
                        <div className="tableContent">
                            <Table
                                columns={consumingColumns(units)}
                                dataSource={tableData}
                                bordered
                                size="middle"
                                pagination={false}
                                scroll={{x: 'calc(700px + 50%)', y: 240}}
                            ></Table>
                        </div>
                    ) : null}
                </PieceContent>
            </Configures>
            <Configures>
                <div className="title">训练步数耗时</div>
                <EchartPie3>
                    <Trainchart className={'Content'} data={trainData}></Trainchart>
                </EchartPie3>
            </Configures>
            <Configures>
                <RadioButtons>
                    <ButtonsLeft
                        onClick={() => {
                            setIsCPU(true);
                        }}
                        className={isCPU ? 'is_active' : ''}
                    >
                        CPU
                    </ButtonsLeft>
                    <ButtonsRight
                        className={!isCPU ? 'is_active' : ''}
                        onClick={() => {
                            setIsCPU(false);
                        }}
                    >
                        GPU
                    </ButtonsRight>
                </RadioButtons>
            </Configures>
            <Configures>
                <div className="title tabs_title">性能消耗</div>
                {performanceData && (
                    <PerformanceContent units={units} performanceData={performanceData}></PerformanceContent>
                )}
            </Configures>
            <Configures>
                <div className="title">模型各阶段消耗分布</div>
                <EchartPie4>
                    <StackColumnChart className={'Content'} data={distributed} color={color}></StackColumnChart>
                </EchartPie4>
            </Configures>
            <Configures style={{marginBottom: `${rem(20)}`}}>
                <div className="title">自定义事件耗时</div>
                {tableData2 && (
                    <div className="tableContent">
                        <Table
                            columns={customizeColumns(units)}
                            dataSource={tableData2}
                            bordered
                            size="middle"
                            pagination={false}
                            scroll={{x: 'calc(700px + 50%)', y: 240}}
                        ></Table>
                    </div>
                )}
            </Configures>
        </ViewWrapper>
    );
};

export default overView;
