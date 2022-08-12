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

import React, {FunctionComponent, useState, useEffect, useCallback} from 'react';
import type {ColumnsType} from 'antd/lib/table';
import type {RadioChangeEvent} from 'antd';
import Inputs from '~/components/Input';
import StackColumnChart from '~/components/StackColumnChart2';
import PieChart from '~/components/pieChart';
import {Radio} from 'antd';
// import Model from '~/components/ProfilerPage/model';
import Icon from '~/components/Icon';
import {primaryColor} from '~/utils/style';
import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table} from 'antd';
import GridLoader from 'react-spinners/GridLoader';
import {fetcher} from '~/utils/fetch';
import SearchInput from '~/components/searchInput2';
import {
    Configure,
    EchartPie,
    ButtonsLeft,
    ButtonsRight,
    RadioButtons,
    color,
    Title,
    Subtraction,
    ViewWrapper,
    RadioContent,
    TableContent,
    PieceContent,
    FullWidthSelect
} from '../../components';
import type {operatorPie, tableType, Event, pie_expand} from './type';
interface tableTypes extends Event {
    key: string;
}
export type OperatorViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
    units: string;
};
export interface DataType {
    name: string;
    calls: number;
    cpu_total_time: number;
    cpu_avg_time: number;
    cpu_max_time: number;
    cpu_min_time: number;
    cpu_ratio: number;
    gpu_total_time: number;
    gpu_avg_time: number;
    gpu_max_time: number;
    gpu_min_time: number;
    gpu_ratio: number;
}

asideWidth;

const Input = styled(Inputs)`
    width: 100%;
    height: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 0;
    text-align: center;
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
    .expandChart {
        position: relative;
        padding-top: ${rem(0)};
        border-top: 1px solid #dddddd;
        .postions {
            position: absolute;
            top: 18px;
            z-index: 10;
        }
    }
`;
const EchartPie4 = styled(EchartPie)`
    height: ${rem(366)};
    padding: ${rem(24)};
    padding-bottom: ${rem(10)};
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
const OperatorView: FunctionComponent<OperatorViewProps> = ({runs, workers, spans, units}) => {
    const {t} = useTranslation(['profiler', 'common']);
    // const model = useRef<any>(null);
    const [cpuData, setCpuData] = useState<cpuData[]>();
    const [gpuData, setGpuData] = useState<cpuData[]>();
    const [tableData, setTableData] = useState<tableTypes[]>();
    const [tableLoading, settableLoading] = useState(true);
    const [distributed, setDistributed] = useState<pie_expand>();
    const [isCPU, setIsCPU] = useState(true);
    const [hasGpu, setHasGpu] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [isExpend, setIsExpend] = useState<boolean>(false);
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>();
    const [group, setGroup] = useState<string>('op_name');
    const [radioValue, setradioValue] = useState(1);
    const [top, setTop] = useState(0);
    useEffect(() => {
        setItemsList([
            {label: t('By-operator-name'), value: 'op_name'},
            {label: t('operator-shape'), value: 'op_name_input_shape'}
        ]);
    }, [t]);
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher(
                '/profiler/operator/pie' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&topk=${top}`
            ).then((res: unknown) => {
                const result = res as operatorPie;
                const cpuChartData: cpuData[] = [];
                const gpuChartData: cpuData[] = [];
                for (const item of result.cpu) {
                    cpuChartData.push({
                        value: item.total_time,
                        name: item.name,
                        proportion: item.ratio
                    });
                }
                if (result.gpu) {
                    for (const item of result.gpu) {
                        gpuChartData.push({
                            value: item.total_time,
                            name: item.name,
                            proportion: item.ratio
                        });
                    }
                } else {
                    setHasGpu(false);
                }
                setCpuData(cpuChartData);
                setGpuData(gpuChartData);
            });
        }
    }, [runs, workers, spans, top, units]);
    useEffect(() => {
        if (runs && workers && spans) {
            settableLoading(true);
            fetcher(
                '/profiler/operator/table' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${units}` +
                    `&search_name=${search}` +
                    `&group_by=${group}`
            ).then((res: unknown) => {
                const result = res as tableType;
                const TableDatas: tableTypes[] = result.events.map(item => {
                    if (group === 'op_name_input_shape') {
                        return {
                            key: item.name + item.input_shape,
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
    useEffect(() => {
        if (runs && workers && spans) {
            const device_type = isCPU ? 'cpu' : 'gpu';
            fetcher(
                '/profiler/operator/pie_expand' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&device_type=${device_type}` +
                    `&topk=${top}` +
                    `&time_unit=${units}` +
                    `&span=${spans}`
            ).then((res: unknown) => {
                const Data = res as pie_expand;
                setDistributed(Data);
            });
        }
    }, [runs, workers, spans, isCPU, top, units]);
    const onChange: (e: RadioChangeEvent) => void = (e: RadioChangeEvent) => {
        setradioValue(e.target.value);
        if (e.target.value === 1) {
            setTop(0);
        } else if (e.target.value === 2) {
            setTop(10);
        }
    };
    const baseColumns1: (units: string, hasGpu: boolean, group: string) => ColumnsType<DataType> = useCallback(
        (units: string, hasGpu: boolean, group: string) => {
            const columns: ColumnsType<DataType> = [
                {
                    title: t('operator'),
                    dataIndex: 'name',
                    key: 'name',
                    render: (text: string) => <div>{text}</div>,
                    width: 144
                },
                {
                    title: t('call-volume'),
                    dataIndex: 'calls',
                    key: 'calls',
                    width: 80,
                    sorter: (a, b) => a.calls - b.calls
                },
                {
                    title: 'CPU',
                    children: [
                        {
                            title: t('total-time') + `(${units})`,
                            dataIndex: 'cpu_total_time',
                            width: 130,
                            key: 'cpu_total_time',
                            sorter: (a, b) => a.cpu_total_time - b.cpu_total_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'cpu_avg_time',
                            width: 130,
                            key: 'cpu_avg_time',
                            sorter: (a, b) => {
                                return a.cpu_avg_time - b.cpu_avg_time;
                            }
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'cpu_max_time',
                            width: 130,
                            key: 'cpu_max_time',
                            sorter: (a, b) => a.cpu_max_time - b.cpu_max_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'cpu_min_time',
                            width: 130,
                            key: 'cpu_min_time',
                            sorter: (a, b) => a.cpu_min_time - b.cpu_min_time
                        },
                        {
                            title: t('percentage') + `%`,
                            dataIndex: 'cpu_ratio',
                            key: 'cpu_ratio',
                            width: 130,
                            sorter: (a, b) => a.cpu_ratio - b.cpu_ratio
                        }
                    ]
                }
            ];
            if (group === 'op_name_input_shape') {
                columns.splice(1, 0, {
                    title: t('input-shape'),
                    dataIndex: 'input_shape',
                    width: 130,
                    key: 'input_shape',
                    // width: 150,
                    render: text => {
                        if (text?.length > 0) {
                            return text.map((item: string, index: number) => {
                                return <div key={item + index}>{item}</div>;
                            });
                        } else {
                            return <div>{'-'}</div>;
                        }
                    }
                });
            }
            if (hasGpu) {
                columns.push({
                    title: 'GPU',
                    children: [
                        {
                            title: t('total-time') + `(${units})`,
                            dataIndex: 'gpu_total_time',
                            width: 130,
                            key: 'gpu_total_time',
                            sorter: (a, b) => a.gpu_total_time - b.gpu_total_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'gpu_avg_time',
                            width: 130,
                            key: 'gpu_avg_time',
                            sorter: (a, b) => a.gpu_avg_time - b.gpu_avg_time
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'gpu_max_time',
                            width: 130,
                            key: 'gpu_max_time',
                            sorter: (a, b) => a.gpu_max_time - b.gpu_max_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'gpu_min_time',
                            width: 130,
                            key: 'gpu_min_time',
                            sorter: (a, b) => a.gpu_min_time - b.gpu_min_time
                        },
                        {
                            title: t('percentage') + `%`,
                            dataIndex: 'gpu_ratio',
                            key: 'gpu_ratio',
                            sorter: (a, b) => a.gpu_ratio - b.gpu_ratio
                        }
                    ]
                });
            }
            return columns;
        },
        [t]
    );
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
                <Titles>{t('Operator-view')}</Titles>
                <RadioContent>
                    <Radio.Group onChange={onChange} value={radioValue}>
                        <Radio value={1}>{t('show-all-operators')}</Radio>
                        <Radio value={2}>{t('show-Top-operators')}</Radio>
                    </Radio.Group>
                    {radioValue === 2 ? (
                        <div className="AdditionContent">
                            <Subtraction
                                disable={true}
                                className="Addition"
                                onClick={() => {
                                    const tops = top + 1;
                                    setTop(tops);
                                }}
                            >
                                +
                            </Subtraction>
                            <div className="input_wrapper">
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
                        <div>{t('Time-profile')}</div>
                    </div>
                </div>
                <PieceContents>
                    <EchartPie style={{padding: `${rem(0)}`, paddingLeft: `${rem(0)}`}}>
                        <div className="wraper" style={{borderRight: '1px solid #dddddd'}}>
                            <PieChart className={'Content'} data={cpuData} isCpu={true} color={color} units={units} />
                        </div>
                        <div className="wraper">
                            <PieChart className={'Content'} data={gpuData} isCpu={false} color={color} units={units} />
                        </div>
                    </EchartPie>
                    <div
                        className={`expendContent ${isExpend ? 'is_expend' : ''}`}
                        onClick={() => {
                            setIsExpend(!isExpend);
                        }}
                    >
                        <div className="expendButton">{t('stage-view')}</div>
                        <Icon type={isExpend ? 'chevron-up' : 'chevron-down'} />
                    </div>
                    {isExpend ? (
                        <div className="expandChart">
                            {hasGpu ? (
                                <RadioButtons className="postions">
                                    <ButtonsLeft
                                        style={{borderRight: 'none'}}
                                        onClick={() => {
                                            setIsCPU(true);
                                        }}
                                        className={isCPU ? 'is_active' : ''}
                                    >
                                        {t('CPU-time')}
                                    </ButtonsLeft>
                                    <ButtonsRight
                                        className={!isCPU ? 'is_active' : ''}
                                        onClick={() => {
                                            setIsCPU(false);
                                        }}
                                    >
                                        {t('GPU-time')}
                                    </ButtonsRight>
                                </RadioButtons>
                            ) : (
                                <RadioButtons className="postions">
                                    <ButtonsLeft>{t('CPU-time')}</ButtonsLeft>
                                </RadioButtons>
                            )}
                            <EchartPie4>
                                <StackColumnChart
                                    className={'Content'}
                                    data={distributed}
                                    units={units}
                                ></StackColumnChart>
                            </EchartPie4>
                        </div>
                    ) : null}
                </PieceContents>
            </Configure>
            <Configure>
                <div className="titleContent" style={{marginBottom: rem(15)}}>
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
                                placeholder={t('Search-operator')}
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
                    {!tableLoading && (
                        <Table
                            columns={baseColumns1(units, hasGpu, group)}
                            dataSource={tableData}
                            bordered
                            size="middle"
                            scroll={{
                                x: group === 'op_name_input_shape' ? 'calc(700px + 63%)' : 'calc(700px + 35%)'
                            }}
                        ></Table>
                    )}
                </TableContent>
            </Configure>
            {/* <Model ref={model} runs={runs} views={views} workers={workers}></Model> */}
        </ViewWrapper>
    );
};

export default OperatorView;
