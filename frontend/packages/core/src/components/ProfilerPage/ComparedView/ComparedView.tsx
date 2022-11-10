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

import React, {FunctionComponent, useState, useEffect, useMemo} from 'react';
import Inputs from '~/components/Input';
import type {RadioChangeEvent} from 'antd';
import PieChart from '~/components/pieChart';
import {Radio} from 'antd';
import {asideWidth, rem, primaryColor} from '~/utils/style';
import {
    Configure,
    EchartPie,
    TableContent,
    color,
    Title,
    Subtraction,
    ViewWrapper,
    RadioContent,
    PieceContent,
    FullWidthSelect
} from '../../components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table} from 'antd';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
import SearchInput from '~/components/searchInput2';
import GridLoader from 'react-spinners/GridLoader';
import type {tensorcorePie, kernelPie, tableDataType, tableEvent} from './type';
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

const Input = styled(Inputs)`
    width: 100%;
    height: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 0;
    text-align: center;
`;
const EchartPies = styled(EchartPie)`
    height: ${rem(287)};
`;
const Titles = styled(Title)`
    border-bottom: none;
    margin-bottom: ${rem(0)};
`;
const TitleNav = styled.div`
    display: flex;
    border-bottom: 1px solid #dddddd;
`;
const PieceContents = styled(PieceContent)`
    .tableContent {
        position: relative;
        padding-top: ${rem(0)};
        border-top: 1px solid #dddddd;
        .postions {
            position: absolute;
            top: ${rem(22)};
            z-index: 10;
        }
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
    const columns1 = useMemo(() => {
        const columns: ColumnsType<DataType> = [
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
                width: 130,
                key: 'total_time',
                sorter: (a, b) => {
                    return a.total_time - b.total_time;
                }
            },
            {
                title: t('average-time') + `(${units})`,
                dataIndex: 'avg_time',
                width: 100,
                key: 'avg_time',
                sorter: (a, b) => {
                    return a.avg_time - b.avg_time;
                }
            },
            {
                title: t('longest-time') + `(${units})`,
                dataIndex: 'max_time',
                width: 100,
                key: 'max_time',
                sorter: (a, b) => {
                    return a.max_time - b.max_time;
                }
            },
            {
                title: t('shortest-time') + `(${units})`,
                dataIndex: 'min_time',
                width: 100,
                key: 'min_time',
                sorter: (a, b) => {
                    return a.min_time - b.min_time;
                }
            },
            {
                title: t('sm-average'),
                dataIndex: 'mean blocks per sm',
                width: 100,
                key: 'mean blocks per sm'
            },
            {
                title: t('average-occupancy') + `%`,
                dataIndex: 'mean est achieved occupancy',
                width: 100,
                key: 'mean est achieved occupancy'
            },
            {
                title: t('use-tensor-core'),
                dataIndex: 'tensor core used',
                width: 100,
                key: 'tensor core used',
                render: (text: boolean) => {
                    if (text) {
                        return <div>{t('Yes')}</div>;
                    } else {
                        return <div>{t('No')}</div>;
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
        return columns;
    }, [t, units]);
    const columns2: ColumnsType<DataType> = useMemo(() => {
        const columns: ColumnsType<DataType> = [
            {
                title: t('nuclear-name'),
                dataIndex: 'name',
                width: 200,
                key: 'name'
            },
            {
                title: t('call-volume'),
                dataIndex: 'calls',
                width: 80,
                key: 'calls',
                sorter: (a, b) => {
                    return a.calls - b.calls;
                }
            },
            {
                title: t('Cor-operator'),
                dataIndex: 'operator',
                width: 130,
                key: 'operator'
            },
            {
                title: t('thread-grid'),
                dataIndex: 'grid',
                width: 130,
                key: 'grid'
            },
            {
                title: t('thread-block'),
                dataIndex: 'block',
                width: 130,
                key: 'block'
            },
            {
                title: t('Thread-registers'),
                dataIndex: 'register per thread',
                width: 130,
                key: 'register per thread'
            },
            {
                title: t('Shared-memory'),
                dataIndex: 'shared memory',
                width: 130,
                key: 'shared memory'
            },
            {
                title: t('total-time') + `(${units})`,
                dataIndex: 'total_time',
                width: 130,
                key: 'total_time',
                sorter: (a, b) => {
                    return a.total_time - b.total_time;
                }
            },
            {
                title: t('average-time') + `(${units})`,
                dataIndex: 'avg_time',
                width: 100,
                key: 'avg_time',
                sorter: (a, b) => {
                    return a.avg_time - b.avg_time;
                }
            },
            {
                title: t('longest-time') + `(${units})`,
                dataIndex: 'max_time',
                width: 100,
                key: 'max_time',
                sorter: (a, b) => {
                    return a.max_time - b.max_time;
                }
            },
            {
                title: t('shortest-time') + `(${units})`,
                dataIndex: 'min_time',
                width: 100,
                key: 'min_time',
                sorter: (a, b) => {
                    return a.min_time - b.min_time;
                }
            },
            {
                title: t('sm-average'),
                dataIndex: 'mean blocks per sm',
                width: 130,
                key: 'mean blocks per sm'
            },
            {
                title: t('average-occupancy') + `%`,
                dataIndex: 'mean est achieved occupancy',
                width: 100,
                key: 'mean est achieved occupancy'
            },
            {
                title: t('use-tensor-core'),
                dataIndex: 'tensor core used',
                width: 100,
                key: 'tensor core used',
                render: (text: boolean) => {
                    if (text) {
                        return <div>{t('Yes')}</div>;
                    } else {
                        return <div>{t('No')}</div>;
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
        return columns;
    }, [t, units]);
    const onChange: (e: RadioChangeEvent) => void = (e: RadioChangeEvent) => {
        setradioValue(e.target.value);
        if (e.target.value === 1) {
            setTop(0);
        } else if (e.target.value === 2) {
            setTop(10);
        }
    };
    const getNAN = (val: any) => {
        const t = val.charAt(0);
        // 转化为数字形式--包含小数，负数
        // 先把非数字的都替换掉，除了数字和.
        let vals = val;
        vals = vals.replace(/[^\d.]/g, '');
        // 必须保证第一个为数字而不是.
        vals = vals.replace(/^\./g, '');
        // 保证只有出现一个.而没有多个.
        vals = vals.replace(/\.{2,}/g, '.');
        // 保证.只出现一次，而不能出现两次以上
        vals = vals.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
        // 如果第一位是负号，则允许添加
        if (t === '-') {
            vals = '-' + vals;
        }
        return vals;
    };
    const inputChange = (value: string) => {
        const tops = getNAN(value);
        console.log('tops', tops);
        if (tops) {
            setTop(tops);
        } else {
            setTop(0);
        }
    };
    return (
        <ViewWrapper>
            <TitleNav>
                <Titles>{t('nuclear-view')}</Titles>
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
                                <Input onChange={inputChange} value={top + ''} />
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
                <div className="titleContent">
                    <div className="titles">
                        <div>{t('Kernel-profile')}</div>
                    </div>
                </div>
                <PieceContents>
                    <EchartPies>
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
                                            radius: ['63%', '88%'],
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
                    </EchartPies>
                </PieceContents>
            </Configure>
            <Configure>
                <div className="titleContent" style={{marginBottom: rem(15)}}>
                    <div className="title">{t('Kernel-details')}</div>
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
                                placeholder={t('Search-Kernal')}
                                rounded
                            />
                        </div>
                    </div>
                </div>
                <TableContent>
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
                            scroll={{x: group === 'kernel_name' ? 'calc(1200px)' : 'calc(1800px)', y: 900}}
                        ></Table>
                    )}
                </TableContent>
            </Configure>
            {/* <Model ref={model} runs={runs} views={views} workers={workers}></Model> */}
        </ViewWrapper>
    );
};

export default ComparedView;
