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

import React, {FunctionComponent, useCallback, useRef, useMemo, useState, useEffect} from 'react';
import type {RadioChangeEvent} from 'antd';
import NumberInput from '~/components/HyperParameterPage/IndicatorFilter/NumberInput';
import StackColumnChart from '~/components/StackColumnChart';
import type {SelectProps} from '~/components/Select';
import PieChart from '~/components/pieChart';
import {Radio} from 'antd';
import Model from '~/components/ProfilerPage/model';
import {asideWidth, rem, em, transitionProps} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table, Popover} from 'antd';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
import Select from '~/components/Select';
import SearchInput from '~/components/searchInput2';
import Icon from '~/components/Icon';
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
interface ExpandedDataType {
    key: React.Key;
    date: string;
    name: string;
    upgradeNum: string;
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
            img {
                width: 16px;
                height: 16px;
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
                width: ${rem(160)};
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
                    border-radius: 4px;
                    height: 100%;
                    .ant-select-selector {
                        height: 100%;
                    }
                }
            }
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
    position: absolute;
    top: ${rem(14)};
    left: ${rem(20)};
    z-index: 20;
    .is_active {
        color: #ffffff;
        background: #2932e1;
        border: 1px solid rgba(41, 50, 225, 1);
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
    border-radius: 4px;
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
const EchartPie4 = styled.div`
    width: 100%;
    border-radius: 4px;
    height: ${rem(366)};
    // padding: ${rem(24)};
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
const Wraper = styled.div`
    width: 100%;
    .ant-table-pagination.ant-pagination {
        margin: ${rem(20)} 0;
        padding-right: ${rem(20)};
    }
    .ant-table.ant-table-bordered > .ant-table-container {
        border: 1px solid #dddddd;
        border-radius: 8px;
    }
`;
type SelectListItem<T> = {
    value: T;
    label: string;
};
const ComparedView: FunctionComponent<ComparedViewProps> = ({runs, views, workers, spans, units}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const model = useRef<any>(null);
    const [pieData, setPieData] = useState<any>();
    const [tensorcoreData, setTensorcoreData] = useState<any>();
    const [tableData, setTableData] = useState<any>();
    const [search, setSearch] = useState<string>('');
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>([
        {label: '按内核分组', value: 'Kernel name'},
        {label: '按内核和算子名称分组', value: 'Kernel properties + Op name'}
    ]);
    const [group, setGroup] = useState<string>('Kernel name');
    const [radioValue, setradioValue] = useState(1);
    const [top, setTop] = useState(0);
    const inputRef = useRef<any>()
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher(
                '/profiler/kernel/tensorcore_pie' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&topk=${top}`
            ).then((res: any) => {
                const chartData = [];
                for (const item of res.events) {
                    // debugger
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
            ).then((res: any) => {
                const chartData = [];
                for (const item of res.events) {
                    // debugger
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
    }, [runs, workers, spans, top]);
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher(
                '/profiler/kernel/table' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&search_name=${search}` +
                    `&group_by=${group}`
            ).then((res: any) => {
                const TableDatas = res.events.map((item:any)=>{
                    return {
                        key:item.name,
                        ...item
                    }
                })
                setTableData(TableDatas);
            });
        }
    }, [runs, workers, spans, search, group]);
    const columns: ColumnsType<DataType> = useMemo(() => {
        let columns:any =  [
            {
                title1: '核名称',
                dataIndex: 'name',
                key: 'name',
                width: 100,
            },
            {
                title: '调用量',
                dataIndex: 'calls',
                key: 'calls',
                width: 100,
            },
            {
                title: '总耗时',
                dataIndex: 'total_time',
                key: 'total_time',
                width: 150,
                sorter: (a:any, b:any) => {
                    a.age - b.age
                }
            },
            {
                title: '平均耗时',
                dataIndex: 'avg_time',
                key: 'avg_time',
                width: 150,
                sorter: (a:any, b:any) => a.age - b.age
            },
            {
                title: '最长耗时',
                dataIndex: 'max_time',
                key: 'max_time',
                width: 150,
                sorter: (a:any, b:any) => a.age - b.age
            },
            {
                title: '最短耗时',
                dataIndex: 'min_time',
                key: 'min_time',
                width: 150,
                sorter: (a:any, b:any) => a.age - b.age
            },
            {
                title: 'sm平均线程块数量',
                dataIndex: 'mean blocks per sm',
                key: 'mean blocks per sm',
                width: 150,
            },
            {
                title: '平均占用率',
                dataIndex: 'mean est achieved occupancy',
                key: 'mean est achieved occupancy',
                width: 150,
            },
            {
                title: '是否使用tensor core',
                dataIndex: 'tensor core used',
                key: 'tensor core used',
                width: 150,
            },
            {
                title: '百分比',
                dataIndex: 'ratio',
                key: 'ratio',
                width: 150,
                sorter: (a:any, b:any) => a.age - b.age
            }
        ];
        if (group === 'kernel_name_attributes') {
            columns = [
                {
                    title1: '核名称',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: '调用量',
                    dataIndex: 'calls',
                    key: 'calls',
                },
                {
                    title: '对应算子',
                    dataIndex: 'operator',
                    key: 'operator',
                },
                {
                    title: '线程网格',
                    dataIndex: 'grid',
                    key: 'grid',
                },
                {
                    title: '线程块',
                    dataIndex: 'block',
                    key: 'block',
                },
                {
                    title: '线程平均寄存器数量',
                    dataIndex: 'register per thread',
                    key: 'register per thread',
                },
                {
                    title: '共享显存量',
                    dataIndex: 'shared memory',
                    key: 'shared memory',
                },
                {
                    title: '总耗时',
                    dataIndex: 'total_time',
                    key: 'total_time',
                    sorter: (a:any, b:any) => {
                        a.age - b.age
                    }
                },
                {
                    title: '平均耗时',
                    dataIndex: 'avg_time',
                    key: 'avg_time',
                    sorter: (a:any, b:any) => a.age - b.age
                },
                {
                    title: '最长耗时',
                    dataIndex: 'max_time',
                    key: 'max_time',
                    sorter: (a:any, b:any) => a.age - b.age
                },
                {
                    title: '最短耗时',
                    dataIndex: 'min_time',
                    key: 'min_time',
                    sorter: (a:any, b:any) => a.age - b.age
                },
                {
                    title: 'sm平均线程块数量',
                    dataIndex: 'mean blocks per sm',
                    key: 'mean blocks per sm',
                },
                {
                    title: '平均占用率',
                    dataIndex: 'mean est achieved occupancy',
                    key: 'mean est achieved occupancy',
                },
                {
                    title: '是否使用tensor core',
                    dataIndex: 'tensor core used',
                    key: 'tensor core used',
                },
                {
                    title: '百分比',
                    dataIndex: 'ratio',
                    key: 'ratio',
                    sorter: (a:any, b:any) => a.age - b.age
                }
            ];
        }
        return columns
    }, [tableData,group]);
    const onSearch = (value: string) => {
        console.log(value);
    };
    const getTable = useMemo(() => {
        return (
            <Table
                columns={columns}
                dataSource={tableData}
                bordered
                size="middle"
                // pagination={false}
                scroll={{x: 'calc(700px + 50%)', y: 900}}
            ></Table>
        );
    }, [columns, tableData]);
    const color = [
        '#2932E1',
        '#00CC88',
        '#981EFF',
        '#066BFF',
        '#3AEB0D',
        '#E71ED5',
        '#25C9FF',
        '#0DEBB0',
        '#FF0287',
        '#00E2FF',
        '#00FF9D',
        '#D50505'
    ];
    const onChange = (e: RadioChangeEvent) => {
        console.log('radio checked', e.target.value);
        setradioValue(e.target.value);
        if (e.target.value === 1) {
            setTop(0);
        } else if (e.target.value === 2) {
            debugger;
            setTop(10);
        }
    };
    const onTopchange = (value: number) => {
        debugger;
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
                <Title>核视图</Title>
                <RadioContent>
                    <Radio.Group onChange={onChange} value={radioValue}>
                        <Radio value={1}>显示全部内核</Radio>
                        <Radio value={2}>显示Top内核</Radio>
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
                                <Input
                                    value={10}
                                    defaultValue={Number.NEGATIVE_INFINITY}
                                    onChange={onTopchange}
                                />
                            </div>
                            <div
                                className="subtraction"
                                onClick={() => {
                                    const tops = top - 1;
                                    setTop(tops);
                                }}
                            >
                                -
                            </div>
                        </div>
                    ) : null}
                </RadioContent>
            </TitleNav>
            <Configure style={{marginTop: `${rem(25)}`}}>
                <div className="title">
                    <div>耗时概况</div>
                    <Popover content={tooltips} placement="right">
                        <a className="argument-operation" onClick={() => {}}>
                            <img src={PUBLIC_PATH + logo} alt="" />
                        </a>
                    </Popover>
                </div>
                <PieceContent>
                    <EchartPie style={{padding: `${rem(20)}`, paddingLeft: `${rem(0)}`}}>
                        <div className="wraper" style={{borderRight: '1px solid #dddddd', marginRight: `${rem(50)}`}}>
                            <PieChart className={'Content'} data={pieData} isCpu={true} color={color} />
                        </div>
                        <div className="wraper">
                            <PieChart className={'Content'} data={tensorcoreData} isCpu={false} color={color} />
                        </div>
                    </EchartPie>
                </PieceContent>
            </Configure>
            <Configure>
                <div className="titleContent">
                    <div className="title">耗时情况</div>
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
                                placeholder={t('common:search-runs')}
                                rounded
                            />
                        </div>
                    </div>
                </div>
                <Wraper>{tableData && getTable}</Wraper>
            </Configure>
            <Model ref={model} runs={runs} views={views} workers={workers}></Model>
        </ViewWrapper>
    );
};

export default ComparedView;
