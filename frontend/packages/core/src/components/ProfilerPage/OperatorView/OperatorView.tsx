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
import NumberInput from '~/components/ProfilerPage/NumberInput';
import StackColumnChart from '~/components/StackColumnChart2';
import type {SelectProps} from '~/components/Select';
import PieChart from '~/components/pieChart';
import {Radio} from 'antd';
// import Model from '~/components/ProfilerPage/model';
import {primaryColor} from '~/utils/style';
import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table, Popover} from 'antd';
import GridLoader from 'react-spinners/GridLoader';
import {fetcher} from '~/utils/fetch';
import Select from '~/components/Select';
import {EchartPie} from '../../components';
import SearchInput from '~/components/searchInput2';
import Icon from '~/components/Icon';
import {Configure, ButtonsLeft, ButtonsRight, RadioButtons, ArgumentOperation, Wraper} from '../../components';
import type {operatorPie, tableType, Event, pie_expand} from './type';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
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
const Configures = styled(Configure)`
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
const PieceContent = styled.div`
    border: 1px solid #dddddd;
    border-radius: ${rem(4)};
    width: 100%;
    height: auto;
    // padding-bottom: ${rem(20)};
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
        padding-top: ${rem(0)};
        border-top: 1px solid #dddddd;
        .postions {
            position: absolute;
            top: ${rem(22)};
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
const OperatorView: FunctionComponent<OperatorViewProps> = ({runs, views, workers, spans, units}) => {
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
                console.log('TableDatas', TableDatas);
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
                console.log('distributed,', Data);
                setDistributed(Data);
            });
        }
    }, [runs, workers, spans, isCPU, top, units]);
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
    const baseColumns1 = useCallback(
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
                    sorter: (a, b) => a.calls - b.calls
                },
                {
                    title: 'CPU',
                    children: [
                        {
                            title: t('total-time') + `(${units})`,
                            dataIndex: 'cpu_total_time',
                            key: 'cpu_total_time',
                            sorter: (a, b) => a.cpu_total_time - b.cpu_total_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'cpu_avg_time',
                            key: 'cpu_avg_time',
                            sorter: (a, b) => {
                                // console.log('a,b',a,b);

                                return a.cpu_avg_time - b.cpu_avg_time;
                            }
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'cpu_max_time',
                            key: 'cpu_max_time',
                            sorter: (a, b) => a.cpu_max_time - b.cpu_max_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'cpu_min_time',
                            key: 'cpu_min_time',
                            sorter: (a, b) => a.cpu_min_time - b.cpu_min_time
                        },
                        {
                            title: t('percentage') + `%`,
                            dataIndex: 'cpu_ratio',
                            key: 'cpu_ratio',
                            sorter: (a, b) => a.cpu_ratio - b.cpu_ratio
                        }
                    ]
                }
            ];
            if (group === 'op_name_input_shape') {
                columns.splice(1, 0, {
                    title: t('input-shape'),
                    dataIndex: 'input_shape',
                    key: 'input_shape',
                    width: 100,
                    render: text => {
                        console.log('text', text);
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
                            key: 'gpu_total_time',
                            sorter: (a, b) => a.gpu_total_time - b.gpu_total_time
                        },
                        {
                            title: t('average-time') + `(${units})`,
                            dataIndex: 'gpu_avg_time',
                            key: 'gpu_avg_time',
                            sorter: (a, b) => a.gpu_avg_time - b.gpu_avg_time
                        },
                        {
                            title: t('longest-time') + `(${units})`,
                            dataIndex: 'cpu_max_time',
                            key: 'cpu_max_time',
                            sorter: (a, b) => a.cpu_max_time - b.cpu_max_time
                        },
                        {
                            title: t('shortest-time') + `(${units})`,
                            dataIndex: 'gpu_min_time',
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
        [units, hasGpu, t, group]
    );

    return (
        <ViewWrapper>
            <TitleNav>
                <Title>{t('Operator-view')}</Title>
                <RadioContent>
                    <Radio.Group onChange={onChange} value={radioValue}>
                        <Radio value={1}>{t('show-all-operators')}</Radio>
                        <Radio value={2}>{t('show-Top-operators')}</Radio>
                    </Radio.Group>
                    {radioValue === 2 ? (
                        <div className="AdditionContent">
                            <Subtraction
                                disable={true}
                                onClick={() => {
                                    const tops = top + 1;
                                    setTop(tops);
                                }}
                            >
                                +
                            </Subtraction>
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
            <Configures style={{marginTop: `${rem(25)}`}}>
                <div className="title">
                    <div>{t('Time-profile')}</div>
                    <Popover content={tooltips} placement="right">
                        <ArgumentOperation></ArgumentOperation>
                    </Popover>
                </div>
                <PieceContent>
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
                        <div className="expendButton">{t('Expand-view')}</div>
                        <Icon type={isExpend ? 'chevron-up' : 'chevron-down'} />
                    </div>
                    {isExpend ? (
                        <div className="tableContent">
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
                                    color={color}
                                ></StackColumnChart>
                            </EchartPie4>
                        </div>
                    ) : null}
                </PieceContent>
            </Configures>
            <Configures>
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
                <Wraper style={{height: '420px'}}>
                    {tableLoading && (
                        <div className="loading">
                            <GridLoader color={primaryColor} size="10px" />
                        </div>
                    )}
                    {tableData && !tableLoading && (
                        <Table
                            columns={baseColumns1(units, hasGpu, group)}
                            dataSource={tableData}
                            bordered
                            size="middle"
                            scroll={{x: 'calc(700px + 50%)', y: 700}}
                        ></Table>
                    )}
                </Wraper>
            </Configures>
            {/* <Model ref={model} runs={runs} views={views} workers={workers}></Model> */}
        </ViewWrapper>
    );
};

export default OperatorView;
