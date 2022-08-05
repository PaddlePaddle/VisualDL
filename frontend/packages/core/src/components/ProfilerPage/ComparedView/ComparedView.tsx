/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-imports */
/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {FunctionComponent, useState, useEffect} from 'react';
import type {RadioChangeEvent} from 'antd';
import NumberInput from '~/components/ProfilerPage/NumberInput';
import type {SelectProps} from '~/components/Select';
import PieChart from '~/components/pieChart';
import {Radio} from 'antd';
import {asideWidth, rem, em, transitionProps, primaryColor, position, size} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table, Popover} from 'antd';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
import Select from '~/components/Select';
import SearchInput from '~/components/searchInput2';
import GridLoader from 'react-spinners/GridLoader';
import logo from '~/assets/images/question-circle.svg';
import hover from '~/assets/images/hover.svg';
import type {tensorcorePie, kernelPie, tableDataType, tableEvent} from './type';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
interface DataType {
    key: React.Key;
    name: string;
    calls: number;
    total_time: number;
    avg_time: number;
    max_time: number;
    min_time: number;
    ratio: number;
}
export type ComparedViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
    units: string;
};

asideWidth;

const ViewWrapper = styled.div`
    width: 100%;
    height: 100%;
    flex-grow: 1;
    position: relative;
    background-color: #fff;
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > thead > tr > th {
        background: #f3f8fe;
    }
`;
const Input = styled(NumberInput)`
    width: 100%;
    height: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 0;
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
`;
const TitleNav = styled.div`
    display: flex;
    border-bottom: 1px solid #dddddd;
`;
const RadioContent = styled.div`
    display: flex;
    align-items: center;
    padding-right: ${rem(20)};
    .ant-radio-group {
        display: flex;
    }
    .ant-radio-wrapper {
        span {
            white-space: nowrap;
        }
        .ant-radio-checked .ant-radio-inner {
            border-color: #2932e1;
        }
        .ant-radio-inner::after {
            background-color: #2932e1;
        }
    }
    .AdditionContent {
        display: flex;
        align-items: center;
        .input_wrapper {
            width: ${rem(50)};
            height: ${rem(32)};
        }
        .Addition {
            width: ${rem(32)};
            height: ${rem(32)};
            line-height: ${rem(30)};
            font-size: ${rem(16)};
            text-align: center;
            border: 1px solid #e0e0e0;
            border-right: none;
        }
        .subtraction {
            width: ${rem(32)};
            height: ${rem(32)};
            font-size: ${rem(16)};
            line-height: ${rem(30)};
            text-align: center;
            border: 1px solid #e0e0e0;
            border-left: none;
        }
    }
`;
const Subtraction = styled.div<{disable: boolean}>`
    width: ${rem(32)};
    height: ${rem(32)};
    font-size: ${rem(16)};
    line-height: ${rem(30)};
    text-align: center;
    border: 1px solid #e0e0e0;
    border-left: none;
    &:hover {
        cursor: ${props => (props.disable ? 'auto' : 'not-allowed')};
    }
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
        align-items: center;
        margin-bottom: ${rem(20)};
        div {
            line-height: ${rem(18)};
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
            img {
                width: ${rem(16)};
                height: ${rem(16)};
            }
            img:hover {
                content: url(${hover});
            }
        }
    }
    .titleContent {
        margin-bottom: ${rem(10)};
        .title {
            margin-bottom: ${rem(0)};
            line-height: ${rem(36)};
        }
        display: flex;
        justify-content: space-between;
        .searchContent {
            display: flex;
            .input_wrapper {
                width: auto;
                height: ${rem(36)};
                .ant-input-group-wrapper {
                    height: 100%;
                    width: 100%;
                    .ant-input-wrapper {
                        height: 100%;
                        .ant-input {
                            height: 100%;
                        }
                        .ant-btn {
                            height: 100%;
                        }
                    }
                    .ant-btn {
                        border-left: none;
                    }
                }
            }
            .select_wrapper {
                width: ${rem(160)};
                height: ${rem(36)};
                margin-right: ${rem(15)};
                .ant-select {
                    border-radius: ${rem(4)};
                    height: 100%;
                    .ant-select-selector {
                        height: 100%;
                    }
                }
            }
        }
    }
`;
const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
    height: 100%;
    font-size: ${rem(14)};
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
const PieceContent = styled.div`
    border: 1px solid #dddddd;
    border-radius: ${rem(4)};
    width: 100%;
    height: auto;
    padding-bottom: ${rem(20)};
    .expendContent {
        display: flex;
        margin-bottom: ${rem(20)};
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
        position: relative;
    }
`;
const Wraper = styled.div`
    width: 100%;
    position: relative;
    .ant-table-pagination.ant-pagination {
        margin: ${rem(20)} 0;
        padding-right: ${rem(20)};
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
`;
type SelectListItem<T> = {
    value: T;
    label: string;
};
interface cpuData {
    value: number;
    name: string;
    proportion: number;
}
interface tableType extends tableEvent {
    key: string;
}

const ComparedView: FunctionComponent<ComparedViewProps> = ({runs, workers, spans, units}) => {
    const {t} = useTranslation(['profiler', 'common']);
    // const model = useRef<any>(null);
    const [pieData, setPieData] = useState<cpuData[]>();
    const [tensorcoreData, setTensorcoreData] = useState<cpuData[]>();
    const [tableLoading, settableLoading] = useState(true);
    const [tableData, setTableData] = useState<tableType[]>();
    const [search, setSearch] = useState<string>('');
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>();
    const [group, setGroup] = useState<string>('kernel_name');
    const [radioValue, setradioValue] = useState(1);
    const [top, setTop] = useState(0);
    useEffect(() => {
        setItemsList([
            {label: t('group-by-core'), value: 'kernel_name'},
            {label: t('Group-operator'), value: 'kernel_name_attributes'}
        ]);
    }, [t]);
    useEffect(() => {
        if (runs && workers && spans && units) {
            fetcher(
                '/profiler/kernel/tensorcore_pie' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&topk=${top}`
            ).then((res: unknown) => {
                const result = res as tensorcorePie;
                const chartData: cpuData[] = [];
                for (const item of result.events) {
                    chartData.push({
                        value: item.calls,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                setTensorcoreData(chartData);
            });
            fetcher(
                '/profiler/kernel/pie' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&topk=${top}`
            ).then((res: unknown) => {
                const result = res as kernelPie;
                const chartData: cpuData[] = [];
                for (const item of result.events) {
                    chartData.push({
                        value: item.total_time,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                console.log('piedata', chartData);
                setPieData(chartData);
            });
        }
    }, [runs, workers, spans, top, units]);
    useEffect(() => {
        if (runs && workers && spans) {
            settableLoading(true);
            fetcher(
                '/profiler/kernel/table' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&search_name=${search}` +
                    `&group_by=${group}`
            ).then((res: unknown) => {
                const result = res as tableDataType;
                const TableDatas = result.events.map((item: tableEvent) => {
                    if (group === 'kernel_name_attributes') {
                        return {
                            key: item.name + item.calls + item.operator + item.grid,
                            ...item
                        };
                    } else {
                        return {
                            key: item.name,
                            ...item
                        };
                    }
                });
                setTableData(TableDatas);
                settableLoading(false);
            });
        }
    }, [runs, workers, spans, search, group, units]);
    const columns1: ColumnsType<DataType> = [
        {
            title: t('nuclear-name'),
            dataIndex: 'name',
            key: 'name',
            width: 200
        },
        {
            title: t('call-volume'),
            dataIndex: 'calls',
            key: 'calls',
            width: 100
        },
        {
            title: t('total-time') + `(${units})`,
            dataIndex: 'total_time',
            key: 'total_time',
            sorter: (a, b) => {
                console.log('a,b', a, b);
                return a.total_time - b.total_time;
            }
        },
        {
            title: t('average-time') + `(${units})`,
            dataIndex: 'avg_time',
            key: 'avg_time',
            sorter: (a, b) => {
                return a.avg_time - b.avg_time;
            }
        },
        {
            title: t('longest-time') + `(${units})`,
            dataIndex: 'max_time',
            key: 'max_time',
            sorter: (a, b) => {
                return a.max_time - b.max_time;
            }
        },
        {
            title: t('shortest-time') + `(${units})`,
            dataIndex: 'min_time',
            key: 'min_time',
            sorter: (a, b) => {
                return a.min_time - b.min_time;
            }
        },
        {
            title: t('sm-average'),
            dataIndex: 'mean blocks per sm',
            key: 'mean blocks per sm'
        },
        {
            title: t('average-occupancy') + `%`,
            dataIndex: 'mean est achieved occupancy',
            key: 'mean est achieved occupancy'
        },
        {
            title: t('use-tensor-core'),
            dataIndex: 'tensor core used',
            key: 'tensor core used',
            render: (text: boolean) => {
                if (text) {
                    return <div>是</div>;
                } else {
                    return <div>否</div>;
                }
            }
        },
        {
            title: t('percentage') + `%`,
            dataIndex: 'ratio',
            key: 'ratio',
            sorter: (a, b) => {
                return a.ratio - b.ratio;
            }
        }
    ];
    const columns2: ColumnsType<DataType> = [
        {
            title: '核名称',
            dataIndex: 'name',
            width: 200,
            key: 'name'
        },
        {
            title: '调用量',
            dataIndex: 'calls',
            key: 'calls',
            sorter: (a, b) => {
                return a.calls - b.calls;
            }
        },
        {
            title: '对应算子',
            dataIndex: 'operator',
            key: 'operator'
        },
        {
            title: '线程网格',
            dataIndex: 'grid',
            key: 'grid'
        },
        {
            title: '线程块',
            dataIndex: 'block',
            key: 'block'
        },
        {
            title: '线程平均寄存器数量',
            dataIndex: 'register per thread',
            key: 'register per thread'
        },
        {
            title: '共享显存量',
            dataIndex: 'shared memory',
            key: 'shared memory'
        },
        {
            title: `总耗时(${units})`,
            dataIndex: 'total_time',
            key: 'total_time',
            sorter: (a, b) => {
                return a.total_time - b.total_time;
            }
        },
        {
            title: `平均耗时(${units})`,
            dataIndex: 'avg_time',
            key: 'avg_time',
            sorter: (a, b) => {
                return a.avg_time - b.avg_time;
            }
        },
        {
            title: `最长耗时(${units})`,
            dataIndex: 'max_time',
            key: 'max_time',
            sorter: (a, b) => {
                return a.max_time - b.max_time;
            }
        },
        {
            title: `最短耗时(${units})`,
            dataIndex: 'min_time',
            key: 'min_time',
            sorter: (a, b) => {
                return a.min_time - b.min_time;
            }
        },
        {
            title: 'sm平均线程块数量',
            dataIndex: 'mean blocks per sm',
            key: 'mean blocks per sm'
        },
        {
            title: '平均占用率%',
            dataIndex: 'mean est achieved occupancy',
            key: 'mean est achieved occupancy'
        },
        {
            title: '是否使用tensor core',
            dataIndex: 'tensor core used',
            key: 'tensor core used'
        },
        {
            title: '百分比%',
            dataIndex: 'ratio',
            key: 'ratio',
            sorter: (a, b) => {
                return a.ratio - b.ratio;
            }
        }
    ];
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
    const onChange = (e: RadioChangeEvent) => {
        console.log('radio checked', e.target.value);
        setradioValue(e.target.value);
        if (e.target.value === 1) {
            setTop(0);
        } else if (e.target.value === 2) {
            setTop(10);
        }
    };
    const onTopchange = (value: number) => {
        setTop(value);
    };
    const tooltips = (
        <div>
            <p>Content</p>
            <p>Content</p>
        </div>
    );
    return (
        <ViewWrapper>
            <TitleNav>
                <Title>{t('nuclear-view')}</Title>
                <RadioContent>
                    <Radio.Group onChange={onChange} value={radioValue}>
                        <Radio value={1}>{t('show-all-kernels')}</Radio>
                        <Radio value={2}>{t('show-Top-kernels')}</Radio>
                    </Radio.Group>
                    {radioValue === 2 ? (
                        <div className="AdditionContent">
                            <div
                                className="Addition"
                                onClick={() => {
                                    const tops = top + 1;
                                    setTop(tops);
                                }}
                            >
                                +
                            </div>
                            <div className="input_wrapper">
                                {/* <Input placeholder="Basic usage" />; */}
                                <Input value={top} defaultValue={Number.NEGATIVE_INFINITY} onChange={onTopchange} />
                            </div>
                            <Subtraction
                                disable={top > 1 ? true : false}
                                onClick={() => {
                                    if (top > 1) {
                                        const tops = top - 1;
                                        setTop(tops);
                                    }
                                }}
                            >
                                -
                            </Subtraction>
                        </div>
                    ) : null}
                </RadioContent>
            </TitleNav>
            <Configure style={{marginTop: `${rem(25)}`}}>
                <div className="title">
                    <div>{t('Time-profile')}</div>
                    <Popover content={tooltips} placement="right">
                        <a
                            className="argument-operation"
                            onClick={() => {
                                console.log(111);
                            }}
                        >
                            <img src={PUBLIC_PATH + logo} alt="" />
                        </a>
                    </Popover>
                </div>
                <PieceContent>
                    <EchartPie style={{padding: `${rem(20)}`, paddingLeft: `${rem(0)}`}}>
                        <div className="wraper" style={{borderRight: '1px solid #dddddd'}}>
                            <PieChart
                                className={'Content'}
                                data={pieData}
                                color={color}
                                units={units}
                                option={{
                                    series: [
                                        {
                                            right: '220',
                                            name: 'Access From',
                                            type: 'pie',
                                            radius: ['63%', '90%'],
                                            avoidLabelOverlap: false,
                                            label: {
                                                show: true,
                                                position: 'center',
                                                // textStyle: {
                                                //     fontSize: '14',
                                                //     color: '#666'
                                                // },
                                                formatter: function () {
                                                    const str = t('total-time'); //声明一个变量用来存储数据
                                                    return str;
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: pieData
                                        }
                                    ]
                                }}
                            />
                        </div>
                        <div className="wraper">
                            <PieChart
                                className={'Content'}
                                data={tensorcoreData}
                                units={units}
                                option={{
                                    series: [
                                        {
                                            right: '220',
                                            name: 'Access From',
                                            type: 'pie',
                                            radius: ['63%', '90%'],
                                            avoidLabelOverlap: false,
                                            label: {
                                                show: true,
                                                position: 'center',
                                                // textStyle: {
                                                //     fontSize: '14',
                                                //     color: '#666'
                                                // },
                                                formatter: function () {
                                                    const str = `Tensor Cores\n\n${t('Utilization')}`; //声明一个变量用来存储数据
                                                    return str;
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: tensorcoreData
                                        }
                                    ]
                                }}
                                color={color}
                            />
                        </div>
                    </EchartPie>
                </PieceContent>
            </Configure>
            <Configure>
                <div className="titleContent">
                    <div className="title">{t('Time-details')}</div>
                    <div className="searchContent">
                        <div className="select_wrapper">
                            <FullWidthSelect list={itemsList} value={group} onChange={setGroup} />
                        </div>
                        <div className="input_wrapper">
                            {/* <Input placeholder="Basic usage" />; */}
                            <SearchInput
                                className="search-input"
                                value={search}
                                onChange={setSearch}
                                placeholder={t('Search-data-labels')}
                                rounded
                            />
                        </div>
                    </div>
                </div>
                <Wraper style={{minHeight: '410px'}}>
                    {tableLoading && (
                        <div className="loading">
                            <GridLoader color={primaryColor} size="10px" />
                        </div>
                    )}
                    {tableData && !tableLoading && (
                        <Table
                            columns={group === 'kernel_name' ? columns1 : columns2}
                            dataSource={tableData}
                            bordered
                            size="middle"
                            // pagination={false}
                            scroll={{x: 'calc(700px + 50%)', y: 900}}
                        ></Table>
                    )}
                </Wraper>
            </Configure>
            {/* <Model ref={model} runs={runs} views={views} workers={workers}></Model> */}
        </ViewWrapper>
    );
};

export default ComparedView;
