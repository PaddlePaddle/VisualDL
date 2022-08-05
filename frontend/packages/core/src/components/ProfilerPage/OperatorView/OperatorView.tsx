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
import SearchInput from '~/components/searchInput2';
import Icon from '~/components/Icon';
import {options, baseColumns2, baseColumns1} from './tools';
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
        .subtraction:hover {
            cursor: not-allowed;
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
    const {t} = useTranslation(['hyper-parameter', 'common']);
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
    const columns2 = baseColumns2(units, hasGpu);
    const columns1 = baseColumns1(units, hasGpu);
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
                            <div
                                className="Addition "
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
            <Configures style={{marginTop: `${rem(25)}`}}>
                <div className="title">
                    <div>耗时概况</div>
                    <Popover content={tooltips} placement="right">
                        <ArgumentOperation></ArgumentOperation>
                    </Popover>
                </div>
                <PieceContent>
                    <EchartPie style={{padding: `${rem(0)}`, paddingLeft: `${rem(0)}`}}>
                        <div className="wraper" style={{borderRight: '1px solid #dddddd', marginRight: `${rem(50)}`}}>
                            <PieChart className={'Content'} data={cpuData} isCpu={true} color={color} />
                        </div>
                        <div className="wraper">
                            <PieChart className={'Content'} data={gpuData} isCpu={false} color={color} />
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
                            {hasGpu ? (
                                <RadioButtons className="postions">
                                    <ButtonsLeft
                                        style={{borderRight: 'none'}}
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
                            ) : (
                                <RadioButtons>
                                    <ButtonsLeft>CPU耗时</ButtonsLeft>
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
                <Wraper style={{height: '420px'}}>
                    {tableLoading && (
                        <div className="loading">
                            <GridLoader color={primaryColor} size="10px" />
                        </div>
                    )}
                    {tableData && !tableLoading && (
                        <Table
                            columns={group === 'op_name_input_shape' ? columns2 : columns1}
                            dataSource={tableData}
                            bordered
                            size="middle"
                            scroll={{x: 'calc(700px + 50%)', y: 240}}
                        ></Table>
                    )}
                </Wraper>
            </Configures>
            {/* <Model ref={model} runs={runs} views={views} workers={workers}></Model> */}
        </ViewWrapper>
    );
};

export default OperatorView;
