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
import type {SelectProps} from '~/components/Select';
import PieChart from '~/components/pieChart';
import {Radio} from 'antd';
import Model from '~/components/ProfilerPage/model';
import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table} from 'antd';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
import Select from '~/components/Select';
import SearchInput from '~/components/searchInput2';
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
        margin-bottom: ${rem(20)};
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
const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
    height: 100%;
    font-size: ${rem(14)};
`;
const EchartPie = styled.div`
    width: 100%;
    height: ${rem(270)};
    border: 1px solid #dddddd;
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
const OperatorView: FunctionComponent<ComparedViewProps> = ({runs, views, workers, spans}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const model = useRef<any>(null);
    const [cpuData, setCpuData] = useState<any>();
    const [tableData, setTableData] = useState<any>();
    const [search, setSearch] = useState<string>();
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>();
    const [items, setItems] = useState<string>('');
    const [radioValue, setradioValue] = useState(1);
    useEffect(() => {
        if (runs && workers && spans) {
            const time_unit = 1;
            fetcher(
                '/profiler/OperatorView/pie' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${time_unit}`
            ).then((res: unknown) => {
                setCpuData(res);
            });
        }
    }, [runs, workers, spans, views]);
    useEffect(() => {
        if (runs && workers && spans) {
            const time_unit = 1;
            fetcher(
                '/profiler/OperatorView/table' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${time_unit}`
            ).then((res: any) => {
                setTableData(res.data);
            });
        }
    }, [runs, workers, spans, views]);
    const columns: ColumnsType<DataType> = useMemo(() => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                onFilter: (value: string | number | boolean, record) => record.name.indexOf(value as string) === 0
            },
            {
                title: '调用量',
                dataIndex: 'call',
                key: 'call',
                width: 100,
                onFilter: (value: string | number | boolean, record) => record.name.indexOf(value as string) === 0
            },
            {
                title: 'GPU',
                children: [
                    {
                        title: '总耗时',
                        dataIndex: 'cpu_total_time',
                        key: 'cpu_total_time',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '平均耗时',
                        dataIndex: 'cpu_avg_time',
                        key: 'cpu_avg_time',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '最短耗时',
                        dataIndex: 'cpu_min_time',
                        key: 'cpu_min_time',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '百分比',
                        dataIndex: 'cpu_ratio',
                        key: 'cpu_ratio',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    }
                ]
            },
            {
                title: 'GPU',
                children: [
                    {
                        title: '总耗时',
                        dataIndex: 'gpu_total_time',
                        key: 'gpu_total_time',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '平均耗时',
                        dataIndex: 'gpu_avg_time',
                        key: 'gpu_avg_time',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '最短耗时',
                        dataIndex: 'gpu_min_time',
                        key: 'gpu_min_time',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '百分比',
                        dataIndex: 'gpu_ratio',
                        key: 'gpu_ratio',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    }
                ]
            },
            {
                title: 'Gender',
                dataIndex: 'gender',
                key: 'gender',
                width: 100,
                render: () => (
                    <div
                        onClick={e => {
                            // debugger
                            model.current?.showModal();
                        }}
                    >
                        查看调用栈
                    </div>
                ),
                fixed: 'right'
            }
        ];
    }, []);
    const onSearch = (value: string) => {
        console.log(value);
    };
    const expandedRowRender = useCallback(
        (e: any, a: any, b: any, c: any) => {
            console.log('e,a,b,c,', e, a, b, c);
            // debugger
            if (!tableData) {
                return;
            }
            const columns: ColumnsType<ExpandedDataType> = [{title: 'name', dataIndex: 'name', key: 'name'}];
            const numbers = Number(a);
            const data = tableData[numbers].expends;
            return <Table columns={columns} dataSource={data} pagination={false} showHeader={false} />;
        },
        [tableData]
    );
    const getTable = useMemo(() => {
        return (
            <Table
                columns={columns}
                dataSource={tableData}
                bordered
                size="middle"
                // pagination={false}
                expandable={{
                    expandedRowRender
                }}
                scroll={{x: 'calc(700px + 50%)', y: 240}}
            ></Table>
        );
    }, [columns, tableData, expandedRowRender]);
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
    };
    return (
        <ViewWrapper>
            <TitleNav>
                <Title>算子视图</Title>
                <RadioContent>
                    <Radio.Group onChange={onChange} value={radioValue}>
                        <Radio value={1}>显示全部算子</Radio>
                        <Radio value={2}>显示Top算子</Radio>
                    </Radio.Group>
                </RadioContent>
            </TitleNav>
            <Configure style={{marginTop: `${rem(25)}`}}>
                <div className="title">耗时情况</div>
                <EchartPie style={{padding: `${rem(20)}`, paddingLeft: `${rem(0)}`}}>
                    <div className="wraper" style={{borderRight: '1px solid #dddddd', marginRight: `${rem(50)}`}}>
                        <PieChart className={'Content'} data={cpuData?.cpu} isCpu={true} color={color} />
                    </div>
                    <div className="wraper">
                        <PieChart className={'Content'} data={cpuData?.gpu} isCpu={false} color={color} />
                    </div>
                </EchartPie>
            </Configure>
            <Configure>
                <div className="titleContent">
                    <div className="title">耗时情况</div>
                    <div className="searchContent">
                        <div className="select_wrapper">
                            <FullWidthSelect list={itemsList} value={items} onChange={setItems} />
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
            <Model ref={model}></Model>
        </ViewWrapper>
    );
};

export default OperatorView;
