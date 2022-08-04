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

import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import type {ColumnsType} from 'antd/lib/table';
import PieChart from '~/components/pieChart';
import Select from '~/components/Select';
import StackColumnChart from '~/components/StackColumnChart';
import Trainchart from '~/components/Trainchart';
import {fetcher} from '~/utils/fetch';
import {asideWidth, position, primaryColor, rem, size} from '~/utils/style';
import GridLoader from 'react-spinners/GridLoader';
import styled from 'styled-components';
import type {SelectProps} from '~/components/Select';
import {Configure} from '../../components';
import Environment from './Environment';
import PerformanceContent from './PerformanceContent';
import type {
    Event,
    Gpu,
    Cpu,
    consumingType,
    distributedData,
    environmentType,
    performanceType,
    perspectiveType,
    tableType,
    trainType,
    DataType,
    DataType2
} from './types';
import {useTranslation} from 'react-i18next';
import {Table} from 'antd';
import Icon from '~/components/Icon';

asideWidth;

const ViewWrapper = styled.div`
    width: 100%;
    height: 100%;
    flex-grow: 1;
    position: relative;
    background-color: #fff;
`;
const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
    height: 100%;
    font-size: ${rem(14)};
`;
const Configures = styled(Configure)`
    .tabs_title {
        position: absolute;
        margin-bottom: 0px;
        height: ${rem(46)};
        line-height: ${rem(46)};
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
    .titleContent {
        margin-bottom: ${rem(10)};
        display: flex;
        align-items: center;
        .titles {
            display: flex;
            align-items: center;
        }
        display: flex;
        justify-content: space-between;
        .searchContent {
            display: flex;
            align-items: center;
            .select_label {
                margin-right: ${rem(15)};
            }
            .select_wrapper {
                width: auto;
                height: ${rem(36)};
            }
        }
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
        min-height: ${rem(200)};
        position: relative;
        .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > thead > tr > th {
            background: #f3f8fe;
        }
        .ant-table.ant-table-bordered > .ant-table-container {
            border: 1px solid #dddddd;
            border-radius: ${rem(8)};
        }
        > .loading {
            ${size('100%')}
            ${position('absolute', 0, null, null, 0)}
            display: flex;
            justify-content: center;
            align-items: center;
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
    proportion: number;
}
interface chartDataType {
    gpu: cpuData[];
    cpu: cpuData[];
}
type SelectListItem<T> = {
    value: T;
    label: string;
};
const OverView: FunctionComponent<overViewProps> = ({runs, views, workers, spans, units}) => {
    const {t} = useTranslation(['profiler', 'common']);
    const [environment, setEnvironment] = useState<environmentType>();
    const [distributed, setDistributed] = useState<distributedData>();
    const [chartData, setChartData] = useState<chartDataType>();
    const [hasGpu, setHasGpu] = useState<boolean>(true);
    const [performanceData, setPerformanceData] = useState<performanceType>();
    const [isExpend, setIsExpend] = useState(false);
    const [tableData, setTableData] = useState<tableType[] | Cpu[]>();
    const [tableLoading, settableLoading] = useState(true);
    const [stepsList, setStepsList] = useState<SelectListItem<string>[]>([
        {label: 'cpu', value: 'cpu'},
        {label: 'gpu', value: 'gpu'}
    ]);
    const [TrainType, setTrainType] = useState<string>('cpu');
    const [PerformanceType, setPerformanceType] = useState<string>('cpu');
    const [tableData2, setTableData2] = useState<Event[]>();
    const [tableLoading2, settableLoading2] = useState(true);
    const [trainData, setTrainData] = useState<trainType>();
    useEffect(() => {
        settableLoading(true);
        settableLoading2(true);
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
                const tableDatas = [];
                const data: Gpu[] = [];
                const chartData: chartDataType = {
                    cpu: [],
                    gpu: []
                };
                if (result.gpu) {
                    for (const item of result.gpu) {
                        const DataTypeItem: {[key: string]: any} = {};
                        for (const key of result.column_name) {
                            if (key !== 'name' && key !== 'calls') {
                                const keys = 'GPU' + key;
                                const items = item;
                                DataTypeItem[keys] = items[key as keyof typeof item];
                            }
                        }
                        data.push(DataTypeItem as Gpu);
                    }
                    result.gpu.shift();
                    for (const item of result.gpu) {
                        chartData.gpu.push({
                            value: item.total_time,
                            name: item.name,
                            proportion: item.ratio
                        });
                    }
                } else {
                    setHasGpu(false);
                    setStepsList([{label: 'cpu', value: 'cpu'}]);
                }
                for (let index = 0; index < result.cpu.length; index++) {
                    const DataTypeItem = data[index]
                        ? {
                              ...result.cpu[index],
                              ...data[index]
                          }
                        : result.cpu[index];
                    tableDatas.push(DataTypeItem);
                }
                console.log('tableData', tableDatas);
                setTableData(tableDatas);
                settableLoading(false);
                result.cpu.shift();
                for (const item of result.cpu) {
                    chartData.cpu.push({
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
                const TableDatas = events.map(item => {
                    return {
                        key: item.name,
                        ...item
                    };
                });
                setTableData2(TableDatas);
                settableLoading2(false);
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
        if (runs && workers && spans && units) {
            // 性能消耗
            fetcher(
                '/profiler/overview/event_type_perspective' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&device_type=${PerformanceType}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const result = res as performanceType;
                console.log('PerformanceData', result);
                setPerformanceData(result);
            });
        }
    }, [runs, workers, spans, views, PerformanceType, units]);
    useEffect(() => {
        if (runs && workers && spans && units) {
            // 训练步数耗时
            fetcher(
                '/profiler/overview/model_perspective_perstep' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&device_type=${TrainType}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const Data = res as trainType;
                console.log('TrainData,', Data);
                setTrainData(Data);
            });
        }
    }, [runs, workers, spans, views, TrainType, units]);
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
    const ConsumingColumns = useCallback(
        (units: string, hasGpu: boolean) => {
            const columns: ColumnsType<DataType> = [
                {
                    title: t('stage'),
                    dataIndex: 'name',
                    key: 'name',
                    width: 100
                    // fixed: 'left',
                },
                {
                    title: t('number-calls'),
                    dataIndex: 'calls',
                    key: 'calls',
                    width: 100,
                    sorter: (a, b) => a.calls - b.calls
                },
                {
                    title: 'CPU',
                    children: [
                        {
                            title: t('total-time') + `(${units})`,
                            dataIndex: 'total_time',
                            key: 'total_time',
                            width: 150,
                            sorter: (a, b) => a.total_time - b.total_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'avg_time',
                            key: 'avg_time',
                            width: 150,
                            sorter: (a, b) => a.avg_time - b.avg_time
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'max_time',
                            key: 'max_time',
                            width: 150,
                            sorter: (a, b) => a.max_time - b.max_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'min_time',
                            key: 'min_time',
                            width: 150,
                            sorter: (a, b) => a.min_time - b.min_time
                        },
                        {
                            title: t('percentage') + `%`,
                            dataIndex: 'ratio',
                            key: 'ratio',
                            width: 150,
                            sorter: (a, b) => a.ratio - b.ratio
                        }
                    ]
                }
            ];
            if (hasGpu) {
                columns.push({
                    title: 'GPU',
                    children: [
                        {
                            title: t('total-time') + `(${units})`,
                            dataIndex: `GPUtotal_time`,
                            key: 'GPUtotal_time',
                            width: 150,
                            sorter: (a, b) => a.GPUtotal_time - b.GPUtotal_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'GPUavg_time',
                            key: 'GPUavg_time',
                            width: 150,
                            sorter: (a, b) => a.GPUavg_time - b.GPUavg_time
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'GPUmax_time',
                            key: 'GPUmax_time',
                            width: 150,
                            sorter: (a, b) => a.GPUmax_time - b.GPUmax_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'GPUmin_time',
                            key: 'GPUmin_time',
                            width: 150,
                            sorter: (a, b) => a.GPUmin_time - b.GPUmin_time
                        },
                        {
                            title: t('percentage') + `%`,
                            dataIndex: 'GPUratio',
                            key: 'GPUratio',
                            width: 150,
                            sorter: (a, b) => a.GPUratio - b.GPUratio
                        }
                    ]
                });
            }
            return columns;
        },
        [units, hasGpu, t]
    );
    const customizeColumns = useCallback(
        (units: string, hasGpu: boolean) => {
            const columns2: ColumnsType<DataType2> = [
                {
                    title: t('stage'),
                    dataIndex: 'name',
                    key: 'name',
                    width: 100
                },
                {
                    title: t('number-calls'),
                    dataIndex: 'calls',
                    key: 'calls',
                    width: 100,
                    sorter: (a, b) => a.calls - b.calls
                },
                {
                    title: 'CPU',
                    children: [
                        {
                            title: t('total-time') + `(${units})`,
                            dataIndex: 'cpu_total_time',
                            key: 'cpu_total_time',
                            width: 150,
                            sorter: (a, b) => a.cpu_total_time - b.cpu_total_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'cpu_avg_time',
                            key: 'cpu_avg_time',
                            width: 150,
                            sorter: (a, b) => a.cpu_avg_time - b.cpu_avg_time
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'cpu_max_time',
                            key: 'cpu_max_time',
                            width: 150,
                            sorter: (a, b) => a.cpu_max_time - b.cpu_max_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'cpu_min_time',
                            key: 'cpu_min_time',
                            width: 150,
                            sorter: (a, b) => a.cpu_min_time - b.cpu_min_time
                        },
                        {
                            title: t('percentage') + `%`,
                            dataIndex: 'cpu_ratio',
                            key: 'cpu_ratio',
                            width: 150,
                            sorter: (a, b) => a.cpu_ratio - b.cpu_ratio
                        }
                    ]
                }
            ];
            if (hasGpu) {
                columns2.push({
                    title: 'GPU',
                    children: [
                        {
                            title: t('total-time') + `(${units})`,
                            dataIndex: 'gpu_total_time',
                            key: 'gpu_total_time',
                            width: 150,
                            sorter: (a, b) => a.gpu_total_time - b.gpu_total_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'gpu_avg_time',
                            key: 'gpu_avg_time',
                            width: 150,
                            sorter: (a, b) => a.gpu_avg_time - b.gpu_avg_time
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'gpu_max_time',
                            key: 'gpu_max_time',
                            width: 150,
                            sorter: (a, b) => a.gpu_max_time - b.gpu_max_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'gpu_min_time',
                            key: 'gpu_min_time',
                            width: 150,
                            sorter: (a, b) => a.gpu_min_time - b.gpu_min_time
                        },
                        {
                            title: t('percentage') + `%`,
                            dataIndex: 'gpu_ratio',
                            key: 'gpu_ratio',
                            width: 150,
                            sorter: (a, b) => a.gpu_ratio - b.gpu_ratio
                        }
                    ]
                });
            }
            return columns2;
        },
        [units, hasGpu, t]
    );
    return (
        <ViewWrapper>
            <Title>{t('profiler:Overview-view')}</Title>
            {environment && <Environment environment={environment} hasGpu={hasGpu}></Environment>}
            <Configures>
                <div className="title">{t('profiler:time-consuming')}</div>
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
                        <div className="expendButton">{t('Expand-view')}</div>
                        <Icon type={isExpend ? 'chevron-up' : 'chevron-down'} />
                    </div>
                    {isExpend && tableData ? (
                        <div className="tableContent">
                            {tableLoading && (
                                <div className="loading">
                                    <GridLoader color={primaryColor} size="10px" />
                                </div>
                            )}
                            {!tableLoading && (
                                <Table
                                    columns={ConsumingColumns(units, hasGpu)}
                                    dataSource={tableData as tableType[]}
                                    bordered
                                    size="middle"
                                    pagination={false}
                                    scroll={{x: 'calc(700px + 50%)', y: 240}}
                                ></Table>
                            )}
                        </div>
                    ) : null}
                </PieceContent>
            </Configures>
            <Configures>
                <div className="titleContent">
                    <div className="titles">{t('training-step-time')}</div>
                    <div className="searchContent">
                        <div className="select_wrapper">
                            <FullWidthSelect list={stepsList} value={TrainType} onChange={setTrainType} />
                        </div>
                    </div>
                </div>
                <EchartPie3>
                    <Trainchart className={'Content'} data={trainData}></Trainchart>
                </EchartPie3>
            </Configures>
            <Configures>
                <div className="titleContent">
                    <div className="titles">{t('performance-consumption')}</div>
                    <div className="searchContent">
                        <div className="select_wrapper">
                            <FullWidthSelect list={stepsList} value={PerformanceType} onChange={setPerformanceType} />
                        </div>
                    </div>
                </div>
                {performanceData && (
                    <PerformanceContent units={units} performanceData={performanceData}></PerformanceContent>
                )}
            </Configures>
            <Configures>
                <div className="title">{t('consumption-distribution')}</div>
                <EchartPie4>
                    <StackColumnChart className={'Content'} data={distributed} color={color}></StackColumnChart>
                </EchartPie4>
            </Configures>
            <Configures style={{marginBottom: `${rem(20)}`}}>
                <div className="title">{t('custom-events')}</div>
                <div className="tableContent">
                    {tableLoading2 && (
                        <div className="loading">
                            <GridLoader color={primaryColor} size="10px" />
                        </div>
                    )}
                    {!tableLoading2 && (
                        <Table
                            columns={customizeColumns(units, hasGpu)}
                            dataSource={tableData2}
                            bordered
                            size="middle"
                            pagination={false}
                            scroll={{x: 'calc(700px + 50%)', y: 240}}
                        ></Table>
                    )}
                </div>
            </Configures>
        </ViewWrapper>
    );
};

export default OverView;
