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

import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import PieChart, {LineChartRef} from '~/components/pieChart';
import BarsChart from '~/components/BarsChart';
import StackColumnChart from '~/components/StackColumnChart';
import Trainchart from '~/components/Trainchart';
import {fetcher} from '~/utils/fetch';
import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table, Tabs, Popover} from 'antd';
import Icon from '~/components/Icon';
import type {ColumnsType} from 'antd/lib/table';
import {em, sameBorder, transitionProps} from '~/utils/style';

// const ImportanceButton = styled(Button)`
//     width: 100%;
// `;

// const HParamsImportanceDialog = styled(ImportanceDialog)`
//     position: fixed;
//     right: calc(${asideWidth} + ${rem(20)});
//     bottom: ${rem(20)};
// `;
// NOTICE: remove it!!!
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
const Configure = styled.div`
    margin-top: ${rem(30)};
    width: 100%;
    font-family: PingFangSC-Medium;
    font-size: ${rem(16)};
    color: #333333;
    font-weight: 500;
    padding-left: ${rem(20)};
    padding-right: ${rem(20)};
    .title {
        display: flex;
        margin-bottom: ${rem(20)};
        div {
            line-height: 18px;
        }
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
        }
    }
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
        color: #FFFFFF;
        background: #2932E1;
        border: 1px solid rgba(41,50,225,1);
    }
`;
const Processes = styled.div`
    background: #f3f8fe;
    border-radius: 4px;
    padding-left: ${rem(20)};
    height: ${rem(60)};
    display: flex;
    align-items: center;
    .Processes_items {
        display: flex;
        margin-right: ${rem(100)};
        .label {
            margin-right: ${rem(20)};
            color: #666666;
            font-size: ${rem(14)};
            line-height: ${rem(30)};
        }
        .conent {
            font-size: 18px;
            color: #333333;
        }
    }
`;
const CPU = styled.div`
    border: 1px solid #dddddd;
    border-radius: 4px;
    height: ${rem(150)};
    width: 100%;
    padding-top: ${rem(24)};
    padding-left: ${rem(20)};
    padding-bottom: ${rem(20)};
    display: flex;
    .CPU_content {
        flex: 1;
        padding-right: ${rem(30)};
        border-right: 1px solid #dddddd;
    }
    .CPU_title {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: #333333;
        text-align: left;
        line-height: 16px;
        font-weight: 600;
        margin-bottom: ${rem(20)};
    }
    .GPU_content {
        flex: 2;
        padding-left: ${rem(20)};
        padding-right: ${rem(20)};
    }
    .GPU_title {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: #333333;
        text-align: left;
        line-height: 16px;
        font-weight: 600;
        margin-bottom: ${rem(20)};
    }
    .itemlist {
        display: flex;
        .items {
            margin-right: 82px;
            .percentage {
                text-align: center;
                font-size: 28px;
                color: #333333;
            }
            .items_label {
                font-size: 12px;
                color: #999999;
                text-align: center;
                white-space: nowrap;
            }
        }
        .items_last {
            margin-right: 0px;
        }
    }
    .GPU_itemlist {
        display: flex;
        .items {
            flex: 1;
            .percentage {
                text-align: center;
                font-size: ${rem(28)};
                color: #333333;
            }
            .items_label {
                font-size: ${rem(12)};
                color: #999999;
                text-align: center;
                white-space: nowrap;
            }
        }
        .itemt_last {
            margin-right: 0px;
        }
    }
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
`;
const EchartPie2 = styled.div`
    width: 100%;
    border: 1px solid #dddddd;
    border-radius: 4px;
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
`;
const EchartPie3 = styled.div`
    width: 100%;
    border: 1px solid #dddddd;
    border-radius: 4px;
    height: ${rem(444)};
    display: flex;
    padding: ${rem(24)};
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
const EchartPie4 = styled.div`
    width: 100%;
    border: 1px solid #dddddd;
    border-radius: 4px;
    height: ${rem(366)};
    padding: ${rem(24)};
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
    }
`;
const PerformanceContent = styled.div`
    border: 1px solid #dddddd;
    border-radius: 4px;
    width: 100%;
    height: ${rem(378)};
    .titles {
        height: ${rem(40)};
        display: flex;
        justify-content: flex-end;
        padding-right: ${rem(30)};
        .legend {
            display: flex;
            align-items: center;
            margin-left: 20px;
            .labels {
                width: 17px;
                height: 5px;
                background: yellow;
                line-height: 22px;
            }
            .legend_name {
                margin-left: 20px;
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: #666666;
                letter-spacing: 0;
                line-height: 14px;
                font-weight: 400;
            }
        }
    }
    .chartContent {
        width: 100%;
        height: ${rem(338)};
        display: flex;
        .chart {
            .Content {
                height: 100%;
            }
            flex: 1;
        }
    }
`;
const ButtonsRight = styled.div`
    border: 1px solid #dddddd;
    border-radius: 0 4px 4px 0;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
`;
const ButtonsLeft = styled.div`
    border: 1px solid #dddddd;
    border-right: none;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
    border-radius: 4px 0 0 4px;
`;

const RadioButtons = styled.div`
    display: flex;
    align-items: center;
    border-radius: 4px;
`;
export type overViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
};
interface DataType {
    key: React.Key;
    name: string;
    total_time: number;
    max_time: number;
    min_time: number;
    avg_time: number;
    ratio: number;
    GPUtotal_time: number;
    GPUmax_time: number;
    GPUmin_time: number;
    GPUavg_time: number;
    GPUratio: number;
}
const overView: FunctionComponent<overViewProps> = ({runs, views, workers, spans}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const [environment, setEnvironment] = useState<any>();
    const [distributed, setDistributed] = useState<any>();
    const [isCPU, setIsCPU] = useState(true);
    const [cpuData, setCpuData] = useState<any>();
    const [performanceData, setPerformanceData] = useState<any>();
    const [isExpend, setIsExpend] = useState<any>(false);
    const [tableData, setTableData] = useState<any>();
    const {TabPane} = Tabs;
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/overview/environment' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const Data: any = res;
                    console.log('environment', Data);
                    setEnvironment(Data);
                }
            );
        }
        if (runs && workers && spans) {
            fetcher('/profiler/overview/distributed' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const Data: any = res;
                    console.log('distributed,', Data);
                    setDistributed(Data);
                }
            );
        }
    }, [runs, workers, spans, views]);
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/overview/pie' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const result: any = res;
                    let tableData: any = [];
                    let data: any = [];
                    for (const item of result.gpu) {
                        const DataTypeItem: any = {};
                        for (const key of result.column_name) {
                            const name = 'GPU' + key;
                            DataTypeItem[name] = item[key];
                        }
                        data.push(DataTypeItem);
                    }
                    for (let index = 0; index < result.cpu.length; index++) {
                        const DataTypeItem: any = {
                            ...result.cpu[index],
                            ...data[index]
                        };
                        tableData.push(DataTypeItem);
                    }
                    console.log('tableData', tableData);
                    setTableData(tableData);
                    setCpuData(res);
                }
            );
        }
    }, [runs, workers, spans, views]);
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/overview/performance' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const result: any = res;
                    setPerformanceData(result);
                }
            );
        }
    }, [runs, workers, spans, views]);
    const onChange = (key: string) => {
        console.log(key);
    };
    const columns: ColumnsType<DataType> = useMemo(() => {
        return [
            {
                title: '阶段',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                // fixed: 'left',
                onFilter: (value: string | number | boolean, record) => record.name.indexOf(value as string) === 0
            },
            {
                title: 'CPU',
                children: [
                    {
                        title: '总耗时',
                        dataIndex: 'total_time',
                        key: 'total_time',
                        width: 150,
                        sorter: (a, b) => a.total_time - b.total_time
                    },
                    {
                        title: '平均耗时',
                        dataIndex: 'avg_time',
                        key: 'avg_time',
                        width: 150,
                        sorter: (a, b) => a.avg_time - b.avg_time
                    },
                    {
                        title: '最长耗时',
                        dataIndex: 'max_time',
                        key: 'max_time',
                        width: 150,
                        sorter: (a, b) => a.max_time - b.max_time
                    },
                    {
                        title: '最短耗时',
                        dataIndex: 'min_time',
                        key: 'min_time',
                        width: 150,
                        sorter: (a, b) => a.min_time - b.min_time
                    },
                    {
                        title: '百分比',
                        dataIndex: 'ratio',
                        key: 'ratio',
                        width: 150,
                        sorter: (a, b) => a.ratio - b.ratio
                    }
                ]
            },
            {
                title: 'GPU',
                children: [
                    {
                        title: '总耗时',
                        dataIndex: 'GPUtotal_time',
                        key: 'GPUtotal_time',
                        width: 150,
                        sorter: (a, b) => a.GPUtotal_time - b.GPUtotal_time
                    },
                    {
                        title: '平均耗时',
                        dataIndex: 'avg_time',
                        key: 'avg_time',
                        width: 150,
                        sorter: (a, b) => a.GPUavg_time - b.GPUavg_time
                    },
                    {
                        title: '最长耗时',
                        dataIndex: 'max_time',
                        key: 'max_time',
                        width: 150,
                        sorter: (a, b) => a.GPUmax_time - b.GPUmax_time
                    },
                    {
                        title: '最短耗时',
                        dataIndex: 'min_time',
                        key: 'min_time',
                        width: 150,
                        sorter: (a, b) => a.GPUmin_time - b.GPUmin_time
                    },
                    {
                        title: '百分比',
                        dataIndex: 'ratio',
                        key: 'ratio',
                        width: 150,
                        sorter: (a, b) => a.GPUratio - b.GPUratio
                    }
                ]
            }
        ];
    }, []);
    const tooltips = (
        <div>
            <p>Content</p>
            <p>Content</p>
        </div>
    );
    const color = [
        '#2932E1',
        '#066BFF',
        '#00CC88',
        '#FF6600',
        '#25C9FF'
    ];
    const color2 = [
        '#2932E1',
        '#066BFF',
        '#FF6600',
        '#D50505',
        '#3AEB0D'
    ];
    return (
        <ViewWrapper>
            <Title>总览视图</Title>
            <Configure>
                <div className="title">配置详情</div>
                <Processes>
                    <div className="Processes_items">
                        <div className="label">进程数</div>
                        <div className="conent">{environment?.number_workers}</div>
                    </div>
                    <div className="Processes_items">
                        <div className="label">设备类型</div>
                        <div className="conent">{environment?.device_type}</div>
                    </div>
                </Processes>
            </Configure>
            <Configure>
                <div className="title">
                    <div>设备详情</div>
                    <Popover content={tooltips} placement="right">
                        <a className="argument-operation" onClick={() => {}}>
                            <Icon type="question-circle" />
                        </a>
                    </Popover>
                </div>
                <CPU>
                    <div className="CPU_content">
                        <div className="CPU_title">CPU</div>
                        <div className="itemlist">
                            <div className="items">
                                <div className="percentage">{environment?.CPU.process_utilization}%</div>
                                <div className="items_label">进程利用率</div>
                            </div>
                            <div className="items items_last">
                                <div className="percentage">{environment?.CPU.system_utilization}%</div>
                                <div className="items_label">系统利用率</div>
                            </div>
                        </div>
                    </div>
                    <div className="GPU_content">
                        <div className="GPU_title">
                            <div>GPU</div>
                            {/* <div>GPU</div> */}
                        </div>
                        <div className="GPU_itemlist">
                            <div className="items">
                                <div className="percentage">{environment?.GPU.utilization}%</div>
                                <div className="items_label">利用率</div>
                            </div>
                            <div className="items">
                                <div className="percentage">{environment?.GPU.sm_efficiency}%</div>
                                <div className="items_label">流量处理器效率</div>
                            </div>
                            <div className="items">
                                <div className="percentage">{environment?.GPU.achieved_occupancy}%</div>
                                <div className="items_label">流量处理器占用率</div>
                            </div>
                            <div className="items items_last">
                                <div className="percentage">{environment?.GPU.tensor_core_percentage}%</div>
                                <div className="items_label">tensor core使用时间占比</div>
                            </div>
                        </div>
                    </div>
                </CPU>
            </Configure>
            <Configure>
                <div className="title">运行耗时</div>
                <PieceContent>
                    <EchartPie style={{padding: `${rem(20)}`, paddingLeft: `${rem(0)}`}}>
                        <div className="wraper" style={{borderRight: '1px solid #dddddd', marginRight: `${rem(50)}`}}>
                            <PieChart className={'Content'} data={cpuData?.cpu} isCpu={true} color={color2}/>
                        </div>
                        <div className="wraper">
                            <PieChart className={'Content'} data={cpuData?.gpu} isCpu={false} color={color2}/>
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
                                columns={columns}
                                dataSource={tableData}
                                bordered
                                size="middle"
                                pagination={false}
                                scroll={{x: 'calc(700px + 50%)', y: 240}}
                            ></Table>
                        </div>
                    ) : null}
                </PieceContent>
            </Configure>
            <Configure>
                <div className="title">训练步数耗时</div>
                <EchartPie3>
                    <Trainchart className={'Content'}></Trainchart>
                </EchartPie3>
            </Configure>
            <Configure>
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
            </Configure>
            <Configure>
                <div className="title tabs_title">性能消耗</div>
                <Tabs defaultActiveKey="1" onChange={onChange} centered>
                    {performanceData &&
                        Object.keys(performanceData).map((item: any, index: any) => {
                            return (
                                <TabPane tab={item} key={index}>
                                    <PerformanceContent>
                                        <div className="titles">
                                            {performanceData[item].calling_times.key.map(
                                                (item: string, index: number) => {
                                                    return (
                                                        <div className="legend">
                                                            <div
                                                                className="labels"
                                                                style={{background: `${color[index]}`}}
                                                            ></div>
                                                            <div className="legend_name">{item}</div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <div className="chartContent">
                                            <div className="chart">
                                                <BarsChart
                                                    className={'Content'}
                                                    data={performanceData[item].calling_times}
                                                    text={1}
                                                    isLegend={false}
                                                ></BarsChart>
                                            </div>
                                            <div className="chart">
                                                <BarsChart
                                                    className={'Content'}
                                                    data={performanceData[item].durations}
                                                    text={2}
                                                    isLegend={false}
                                                ></BarsChart>
                                            </div>
                                            <div className="chart">
                                                <BarsChart
                                                    className={'Content'}
                                                    data={performanceData[item].ratios}
                                                    text={3}
                                                    isLegend={true}
                                                ></BarsChart>
                                            </div>
                                        </div>
                                    </PerformanceContent>
                                </TabPane>
                            );
                        })}
                </Tabs>
            </Configure>
            <Configure>
                <div className="title">模型各阶段消耗分布</div>
                <EchartPie4>
                    <StackColumnChart className={'Content'} data={distributed} color={color}></StackColumnChart>
                </EchartPie4>
            </Configure>
        </ViewWrapper>
    );
};

export default overView;
