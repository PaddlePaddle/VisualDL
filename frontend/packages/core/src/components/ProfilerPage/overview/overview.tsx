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
import type {ColumnsType} from 'antd/lib/table';
import PieChart from '~/components/pieChart';
import StackColumnChart from '~/components/StackColumnChart';
import Trainchart from '~/components/Trainchart';
import {fetcher} from '~/utils/fetch';
import {asideWidth, primaryColor, rem} from '~/utils/style';
import GridLoader from 'react-spinners/GridLoader';
import styled from 'styled-components';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
import {
    Configure,
    EchartPie,
    ArgumentOperation,
    ViewWrapper,
    ButtonsLeft,
    ButtonsRight,
    RadioButtons,
    TableContent,
    Title,
    PieceContent,
    color2
} from '../../components';
import Environment from './Environment';
import PerformanceContent from './PerformanceContent';
import logo from '~/assets/images/question-circle.svg';
import {Popover} from 'antd';
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

const Configures = styled(Configure)`
    .titleContent {
        margin-bottom: ${rem(10)};
        position: relative;
    }
    .ant-tabs-centered > .ant-tabs-nav .ant-tabs-nav-wrap:not([class*='ant-tabs-nav-wrap-ping']) {
        justify-content: flex-start;
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
    .ant-tabs-tab {
        padding: ${rem(12)} 0px ${rem(23)} 0;
    }
    .is_active {
        color: #ffffff;
        background: #2932e1;
        border: 1px solid rgba(41, 50, 225, 1);
    }
    .noGpu {
        border: 1px solid rgba(221, 221, 221, 1);
        border-radius: 0px ${rem(4)} ${rem(4)} 0px;
        color: #cccccc;
        cursor: not-allowed;
    }
    .postions {
        position: absolute;
        top: 42px;
        right: 0;
        z-index: 10;
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
export type overViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
    units: string;
    descriptions: any;
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

const OverView: FunctionComponent<overViewProps> = ({runs, views, workers, spans, units, descriptions}) => {
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
                const tableDatas: tableType[] = [];
                const data: Gpu[] = [];
                const chartData: chartDataType = {
                    cpu: [],
                    gpu: []
                };
                if (result.gpu) {
                    setHasGpu(true);
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
                }
                result.cpu.forEach((item: Cpu, index: number) => {
                    const DataTypeItem: tableType = item
                        ? {
                              ...item,
                              ...data[index]
                          }
                        : item;
                    tableDatas.push(DataTypeItem);
                });
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
                setTrainData(Data);
            });
        }
    }, [runs, workers, spans, views, TrainType, units]);
    const ConsumingColumns: (units: string, hasGpu: boolean) => ColumnsType<DataType> = useCallback(
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
        [t]
    );
    const customizeColumns: (units: string, hasGpu: boolean) => ColumnsType<DataType2> = useCallback(
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
        [t]
    );
    const gettTooltip: (name: string) => JSX.Element = (name: string) => {
        console.log('descriptions', descriptions);

        const tooltips = (
            <div
                style={{
                    width: rem(700),
                    color: '#333333',
                    fontWeight: 400
                }}
                dangerouslySetInnerHTML={{__html: descriptions ? descriptions[name] : ''}}
            ></div>
        );
        return tooltips;
    };
    const getPopupContainers = (trigger: any) => {
        return trigger.parentElement;
    };
    return (
        <ViewWrapper>
            <Title>{t('profiler:Overview-view')}</Title>
            {environment && (
                <Environment
                    environment={environment}
                    hasGpu={hasGpu}
                    descriptions={descriptions ? descriptions['overview_environment'] : ''}
                ></Environment>
            )}
            <Configure>
                <div className="titleContent">
                    <div className="titles">
                        <div>{t('profiler:time-consuming')}</div>
                        <Popover
                            content={gettTooltip('overview_model_perspective')}
                            getPopupContainer={getPopupContainers}
                            placement="right"
                        >
                            <ArgumentOperation>
                                <img src={PUBLIC_PATH + logo} alt="" />
                            </ArgumentOperation>
                        </Popover>
                    </div>
                </div>
                <PieceContent>
                    <EchartPie style={{paddingRight: `${rem(0)}`, paddingTop: `${rem(0)}`}}>
                        <div className="wraper" style={{borderRight: '1px solid #dddddd', marginRight: `${rem(10)}`}}>
                            <PieChart
                                className={'Content'}
                                data={chartData?.cpu}
                                isCpu={true}
                                color={color2}
                                units={units}
                            />
                        </div>
                        <div className="wraper">
                            <PieChart
                                className={'Content'}
                                data={chartData?.gpu}
                                isCpu={false}
                                color={color2}
                                units={units}
                            />
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
                        <TableContent>
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
                                    scroll={{x: 'calc(700px + 50%)', y: 440}}
                                ></Table>
                            )}
                        </TableContent>
                    ) : null}
                </PieceContent>
            </Configure>
            <Configures>
                <div className="titleContent">
                    <div className="titles" style={{marginBottom: `${rem(0)}`}}>
                        <div>{t('training-step-time')}</div>
                        <Popover
                            content={gettTooltip('overview_model_perspective_perstep')}
                            getPopupContainer={getPopupContainers}
                            placement="right"
                        >
                            <ArgumentOperation>
                                <img src={PUBLIC_PATH + logo} alt="" />
                            </ArgumentOperation>
                        </Popover>
                    </div>

                    <RadioButtons>
                        <ButtonsLeft
                            style={{borderRight: 'none'}}
                            onClick={() => {
                                setTrainType('cpu');
                            }}
                            className={TrainType === 'cpu' ? 'is_active' : ''}
                        >
                            {t('CPU-time')}
                        </ButtonsLeft>
                        <ButtonsRight
                            className={hasGpu ? (TrainType === 'gpu' ? 'is_active' : '') : 'noGpu'}
                            onClick={() => {
                                if (hasGpu) {
                                    setTrainType('gpu');
                                }
                            }}
                        >
                            {t('GPU-time')}
                        </ButtonsRight>
                    </RadioButtons>
                </div>
                <EchartPie3>
                    <Trainchart className={'Content'} data={trainData} units={units}></Trainchart>
                </EchartPie3>
            </Configures>
            <Configures>
                <div className="titleContent">
                    <div className="title">
                        <div>{t('performance-consumption')}</div>
                        <Popover
                            content={gettTooltip('overview_event_type_perspective')}
                            placement="right"
                            getPopupContainer={getPopupContainers}
                        >
                            <ArgumentOperation>
                                <img src={PUBLIC_PATH + logo} alt="" />
                            </ArgumentOperation>
                        </Popover>
                    </div>
                    <RadioButtons className="postions">
                        <ButtonsLeft
                            style={{borderRight: 'none'}}
                            onClick={() => {
                                setPerformanceType('cpu');
                            }}
                            className={PerformanceType === 'cpu' ? 'is_active' : ''}
                        >
                            {t('CPU-time')}
                        </ButtonsLeft>
                        <ButtonsRight
                            className={hasGpu ? (PerformanceType === 'gpu' ? 'is_active' : '') : 'noGpu'}
                            onClick={() => {
                                if (hasGpu) {
                                    setPerformanceType('gpu');
                                }
                            }}
                        >
                            {t('GPU-time')}
                        </ButtonsRight>
                    </RadioButtons>
                </div>
                {performanceData && (
                    <PerformanceContent units={units} performanceData={performanceData}></PerformanceContent>
                )}
            </Configures>
            <Configure>
                <div className="titleContent">
                    <div className="titles">
                        <div>{t('consumption-distribution')}</div>
                        <Popover
                            content={gettTooltip('overview_event_type_model_perspective')}
                            placement="right"
                            getPopupContainer={getPopupContainers}
                        >
                            <ArgumentOperation>
                                <img src={PUBLIC_PATH + logo} alt="" />
                            </ArgumentOperation>
                        </Popover>
                    </div>
                </div>
                <EchartPie4>
                    <StackColumnChart className={'Content'} data={distributed} units={units}></StackColumnChart>
                </EchartPie4>
            </Configure>
            <Configures style={{marginBottom: `${rem(20)}`}}>
                <div className="titleContent">
                    <div className="title">{t('custom-events')}</div>
                </div>
                <TableContent>
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
                </TableContent>
            </Configures>
        </ViewWrapper>
    );
};

export default OverView;
