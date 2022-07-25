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
import NumberInput from '~/components/ProfilerPage/NumberInput';
import StackColumnChart from '~/components/StackColumnChart3';
import type {TableColumnsType} from 'antd';
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
}
interface ExpandedDataType {
    key: React.Key;
    date: string;
    name: string;
    render: any;
}
export type OperatorViewProps = {
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
        .expendButton {
            color: #a3a3a3;
            margin-left: ${rem(20)};
            margin-right: ${rem(10)};
        }
        i {
            line-height: ${rem(30)};
        }
    }
    .is_expend {
        margin-bottom: ${rem(20)};
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
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > thead > tr > th {
        background: #f3f8fe;
    }
    .ant-table-pagination.ant-pagination {
        margin: ${rem(20)} 0;
        padding-right: ${rem(20)};
    }
    .ant-table.ant-table-bordered > .ant-table-container {
        border: 1px solid #dddddd;
        border-radius: 8px;
    }
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-body > table > tbody .ant-table-row-level-1 {
        background: #f0f0f0;
        > td {
            border: 1px solid #dddddd;
            border-left: none;
            border-top: none;
        }
    }
    .whiteWrap {
        margin-left: 25px;
    }
`;
type SelectListItem<T> = {
    value: T;
    label: string;
};
const OperatorView: FunctionComponent<OperatorViewProps> = ({runs, views, workers, spans, units}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const model = useRef<any>(null);
    const [cpuData, setCpuData] = useState<any>();
    const [gpuData, setGpuData] = useState<any>();
    const [tableData, setTableData] = useState<any>();
    const [distributed, setDistributed] = useState<any>();
    const [isCPU, setIsCPU] = useState(true);
    const [search, setSearch] = useState<string>('');
    const [isExpend, setIsExpend] = useState<any>(false);
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>([
        {label: '按算子名称', value: 'op_name'},
        {label: '按算子名称+输入形状', value: 'op_name_input_shape'}
    ]);
    const [group, setGroup] = useState<string>('op_name');
    const [radioValue, setradioValue] = useState(1);
    const [top, setTop] = useState(0);

    useEffect(() => {
        if (runs && workers && spans) {
            fetcher(
                '/profiler/operator/pie' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&topk=${top}`
            ).then((res: any) => {
                const cpuChartData = [];
                const gpuChartData = [];
                for (const item of res.cpu) {
                    // debugger
                    cpuChartData.push({
                        value: item.total_time,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                for (const item of res.gpu) {
                    // debugger
                    gpuChartData.push({
                        value: item.total_time,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                debugger
                setCpuData(cpuChartData);
                setGpuData(gpuChartData);
            });
        }
    }, [runs, workers, spans,top,units]);
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher(
                '/profiler/operator/table' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&search_name=${search}` +
                    `&group_by=${group}`
            ).then((res: any) => {
                const TableDatas = res.events.map((item: any) => {
                    return {
                        key: item.name,
                        ...item
                    };
                });
                debugger
                setTableData(TableDatas);
            });
        }
    }, [runs, workers, spans, search, group,units]);
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher(
                '/profiler/operator/pie_expand' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&device_type=${isCPU}` +
                    `&topk=${top}` +
                    `&time_unit=${units}` +
                    `&span=${spans}`
            ).then((res: unknown) => {
                const Data: any = res;
                console.log('distributed,', Data);
                debugger
                setDistributed(Data);
            });
        }
    }, [runs, workers, spans, isCPU, top,units]);
    const columns: ColumnsType<DataType> = useMemo(() => {
        let columns = [
            {
                title: '算子名称',
                dataIndex: 'name',
                key: 'name',
                render: (text: string) => <div className="whiteWrap">{text}</div>,
                width: 144
            },
            {
                title: '调用量',
                dataIndex: 'calls',
                key: 'calls',
                sorter: (a: any, b: any): any => a.calls - b.calls
            },
            {
                title: 'GPU',
                children: [
                    {
                        title: `总耗时(${units})`,
                        dataIndex: 'cpu_total_time',
                        key: 'cpu_total_time',
                        sorter: (a: any, b: any): any => a.cpu_total_time - b.cpu_total_time
                    },
                    {
                        title: `平均耗时(${units})`,
                        dataIndex: 'cpu_avg_time',
                        key: 'cpu_avg_time',
                        sorter: (a: any, b: any) => {
                            // console.log('a,b',a,b);
                            
                            return a.cpu_avg_time - b.cpu_avg_time
                        }
                    },
                    {
                        title: `最长耗时(${units})`,
                        dataIndex: 'cpu_max_time',
                        key: 'cpu_max_time',
                        sorter: (a: any, b: any) => a.cpu_max_time - b.cpu_max_time
                    },
                    {
                        title: `最短耗时(${units})`,
                        dataIndex: 'cpu_min_time',
                        key: 'cpu_min_time',
                        sorter: (a: any, b: any) => a.cpu_min_time - b.cpu_min_time
                    },
                    {
                        title: '百分比%',
                        dataIndex: 'cpu_ratio',
                        key: 'cpu_ratio',
                        sorter: (a: any, b: any) => a.cpu_ratio - b.cpu_ratio
                    }
                ]
            },
            {
                title: 'GPU',
                children: [
                    {
                        title: `总耗时(${units})`,
                        dataIndex: 'gpu_total_time',
                        key: 'gpu_total_time',
                        sorter: (a: any, b: any) => a.gpu_total_time - b.gpu_total_time
                    },
                    {
                        title: `平均耗时(${units})`,
                        dataIndex: 'gpu_avg_time',
                        key: 'gpu_avg_time',
                        sorter: (a: any, b: any) => a.gpu_avg_time - b.gpu_avg_time
                    },
                    {
                        title: `最长耗时(${units})`,
                        dataIndex: 'cpu_max_time',
                        key: 'cpu_max_time',
                        sorter: (a: any, b: any) => a.cpu_max_time - b.cpu_max_time
                    },
                    {
                        title: `最短耗时(${units})`,
                        dataIndex: 'gpu_min_time',
                        key: 'gpu_min_time',
                        sorter: (a: any, b: any) => a.gpu_min_time - b.gpu_min_time
                    },
                    {
                        title: '百分比%',
                        dataIndex: 'gpu_ratio',
                        key: 'gpu_ratio',
                        sorter: (a: any, b: any) => a.gpu_ratio - b.gpu_ratio
                    }
                ]
            }
        ];
        if (group === 'op_name_input_shape') {
            columns.splice(1, 0, {
                title: '输入形状',
                dataIndex: 'input_shape',
                key: 'input_shape',
                width:100,
                render: (text: string) => <div>{text}</div>,
            });
        }
        console.log('columns',columns);
        return columns;
    }, [tableData, group]);
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
                // expandable={{
                //     expandedRowRender
                // }}
                scroll={{x: 'calc(700px + 50%)', y: 240}}
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
                <Title>算子视图</Title>
                <RadioContent>
                    <Radio.Group onChange={onChange} value={radioValue}>
                        <Radio value={1}>显示全部算子</Radio>
                        <Radio value={2}>显示Top算子</Radio>
                    </Radio.Group>
                    {radioValue === 2 ? (
                        <div className="AdditionContent">
                            <div className="Addition " onClick={() => {
                                    const tops = top + 1;
                                    setTop(tops);
                                }}>+</div>
                            <div className="input_wrapper">
                                {/* <Input placeholder="Basic usage" />; */}
                                <Input value={top} defaultValue={Number.NEGATIVE_INFINITY} onChange={onTopchange} />
                            </div>
                            <div className="subtraction" onClick={() => {
                                    const tops = top - 1;
                                    setTop(tops);
                                }}>-</div>
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
                            <PieChart className={'Content'} data={gpuData} isCpu={true} color={color} />
                        </div>
                        <div className="wraper">
                            <PieChart className={'Content'} data={cpuData} isCpu={false} color={color} />
                        </div>
                    </EchartPie>
                    <div
                        className={`expendContent ${isExpend ? 'is_expend' : ''}`}
                        onClick={() => {
                            setIsExpend(!isExpend);
                        }}
                    >
                        <div className="expendButton">展开查看耗时详情</div>
                        <Icon type={isExpend ? 'chevron-up' : 'chevron-down'} />
                    </div>
                    {isExpend ? (
                        <div className="tableContent">
                            <RadioButtons>
                                <ButtonsLeft
                                    onClick={() => {
                                        setIsCPU(true);
                                    }}
                                    className={isCPU ? 'is_active' : ''}
                                >
                                    CPU耗时
                                </ButtonsLeft>
                                <ButtonsRight
                                    className={!isCPU ? 'is_active' : ''}
                                    onClick={() => {
                                        setIsCPU(false);
                                    }}
                                >
                                    GPU耗时
                                </ButtonsRight>
                            </RadioButtons>
                            <EchartPie4>
                                <StackColumnChart
                                    className={'Content'}
                                    data={distributed}
                                    color={color}
                                    options={{
                                        yAxis: {
                                            name: ''
                                        },
                                        dataZoom: [
                                            //给x轴设置滚动条
                                            {
                                                start: 0, //默认为0
                                                end: 20, //默认为100
                                                type: 'slider',
                                                show: true,
                                                xAxisIndex: [0],
                                                handleSize: 0, //滑动条的 左右2个滑动条的大小
                                                height: 8, //组件高度
                                                left: 50, //左边的距离
                                                right: 40, //右边的距离
                                                bottom: 10, //右边的距离
                                                handleColor: '#ddd', //h滑动图标的颜色
                                                handleStyle: {
                                                    borderColor: '#cacaca',
                                                    borderWidth: '1',
                                                    shadowBlur: 2,
                                                    background: '#ddd',
                                                    shadowColor: '#ddd'
                                                },
                                                fillerColor:'#2932E1',
                                                // fillerColor: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                                                //     {
                                                //         //给颜色设置渐变色 前面4个参数，给第一个设置1，第四个设置0 ，就是水平渐变
                                                //         //给第一个设置0，第四个设置1，就是垂直渐变
                                                //         offset: 0,
                                                //         color: '#1eb5e5'
                                                //     },
                                                //     {
                                                //         offset: 1,
                                                //         color: '#5ccbb1'
                                                //     }
                                                // ]),
                                                backgroundColor: '#ddd', //两边未选中的滑动条区域的颜色
                                                showDataShadow: false, //是否显示数据阴影 默认auto
                                                showDetail: false, //即拖拽时候是否显示详细数值信息 默认true
                                                // handleIcon:
                                                //     'M-292,322.2c-3.2,0-6.4-0.6-9.3-1.9c-2.9-1.2-5.4-2.9-7.6-5.1s-3.9-4.8-5.1-7.6c-1.3-3-1.9-6.1-1.9-9.3c0-3.2,0.6-6.4,1.9-9.3c1.2-2.9,2.9-5.4,5.1-7.6s4.8-3.9,7.6-5.1c3-1.3,6.1-1.9,9.3-1.9c3.2,0,6.4,0.6,9.3,1.9c2.9,1.2,5.4,2.9,7.6,5.1s3.9,4.8,5.1,7.6c1.3,3,1.9,6.1,1.9,9.3c0,3.2-0.6,6.4-1.9,9.3c-1.2,2.9-2.9,5.4-5.1,7.6s-4.8,3.9-7.6,5.1C-285.6,321.5-288.8,322.2-292,322.2z',
                                                filterMode: 'filter'
                                            },
                                        ]
                                    }}
                                ></StackColumnChart>
                            </EchartPie4>
                        </div>
                    ) : null}
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

export default OperatorView;
