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
import DistributedChart from '~/components/DistributedChart';
import Inputs from '~/components/Input';
import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table} from 'antd';
import {Slider} from 'antd';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
import SearchInput from '~/components/searchInput2';
import Select from '~/components/Select';
import type {SelectProps} from '~/components/Select';
import { number } from 'echarts';
interface DataType {
    key: React.Key;
    MemoryType:string ;
    AllocatedEvent:string ;
    AllocatedTimestamp:number ;
    FreeEvent:string ;
    FreeTimestamp:number ;
    Duration:number ;
    Size:number;
}
interface op_DataType {
    key: React.Key;
    EventName: string; 
    MemoryType: string; 
    AllocationCount: number; 
    FreeCount: number; 
    AllocationSize: number; 
    FreeSize: number; 
    IncreasedSize:number;
}
export type MemoryViewProps = {
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
const TitleNav = styled.div`
    display: flex;
    align-items:center;
    border-bottom: 1px solid #dddddd;
    margin-bottom: ${rem(20)};
    .searchContent {
        display: flex;
        align-items:center;
        .select_label{
            margin-right: ${rem(15)};
            color: #000000;
            font-size: 14px;
            white-space:nowrap;
        }
        .select_wrapper {
            width: ${rem(88)};
            height: ${rem(36)};
            margin-right: ${rem(15)};
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
`;
const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
    height: 100%;
    font-size: ${rem(14)};
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
        margin-bottom: ${rem(15)};
        .title {
            margin-bottom: ${rem(0)};
            line-height: ${rem(36)};
        }
        display: flex;
        justify-content: space-between;
        .SliderContent {
            display: flex;
            .Slider_wrapper {
                width: ${rem(160)};
                align-items: center;
                height: 100%;
                padding-top: ${rem(12)};
                .ant-slider {
                    margin: ${rem(0)};
                }
                .ant-slider-track {
                    background: #2932e1;
                }
                .ant-slider-handle {
                    border: solid 4px #2932e1;
                }
                margin: ${rem(0)} ${rem(20)};
            }
            .Slider_input_content {
                height: ${rem(36)};
                display: flex;
                border: 1px solid #dddddd;
                border-radius: 4px;
                padding-right: ${rem(10)};
                justify-content: space-between;
                width: ${rem(88)};

                .unit-number {
                    padding: ${rem(5)};
                    line-height: ${rem(36)};
                    display: flex;
                    align-items: center;
                    .wrappers {
                        width: 100%;
                        height: 100%;
                        border: none;
                        font-size: 14px;
                    }
                }
                .unit {
                    font-size: 14px;
                    color: #999999;
                    line-height: ${rem(36)};
                }
            }
        }
    }
`;
const EchartPie = styled.div`
    width: 100%;
    border: 1px solid #dddddd;
    padding: ${rem(24)};
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
        margin: ${rem(20)} 0 ${rem(30)} 0;
        padding-right: ${rem(20)};
    }
    .ant-table.ant-table-bordered > .ant-table-container {
        border: 1px solid #dddddd;
        border-radius: 8px;
    }
    .ant-table-thead > tr > th {
        background: #f3f8fe;
    }
`;
type SelectListItem<T> = {
    value: T;
    label: string;
};
const MemoryView: FunctionComponent<MemoryViewProps> = ({runs,workers, spans,units}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const [lineData, setLineData] = useState<any>();
    const [search, setSearch] = useState<string>('');
    const [search2, setSearch2] = useState<string>('');
    const [Sliders1, setSliders1] = useState<number>(0);
    const [Sliders2, setSliders2] = useState<number>(100);
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>()
    const [envirements,setEnvirements] = useState<any>()
    const [tableData,settableData] = useState<any>()
    const [tableData2,settableData2] = useState<any>()
    const [items, setItems] = useState<string>();
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/memory/devices' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: any) => {
                    const itemsLists = []
                    for (let index = 0; index < res.length; index++) {
                        const element = res[index];
                        itemsLists.push(
                            {label: element.device, value: element.device}
                        ) 
                    }
                    setEnvirements(res)
                    setItemsList(itemsLists);
                    setItems(res[0].device)
                }
            );
        }
    }, [runs, workers, spans]);
    useEffect(() => {
        if (runs && workers && spans && items) {
            fetcher('/profiler/memory/curve' + 
            `?run=${runs}` + 
            `&worker=${workers}` + 
            `&span=${spans}` + 
            `&device_type=${items}` + 
            `&time_unit=${units}`
            ).then(
                (res: any) => {
                    console.log('lineData',res);
                    setLineData(res);
                }
            );
        }
    }, [runs, workers, spans,units,items]);
    useEffect(() => {
        if (items && envirements) {
            for (let index = 0; index < envirements.length; index++) {
                const element = envirements[index];
                if (items === element.device) {
                    setSliders1(element.min_size)
                    setSliders2(element.max_size)
                }
                
            }
        }
    },[items,envirements])
    useEffect(() => {
        if (runs && workers && spans && items) {
            fetcher('/profiler/memory/memory_events' + 
            `?run=${runs}` + 
            `&worker=${workers}` + 
            `&span=${spans}` + 
            `&device_type=${items}` + 
            `&min_size=${Sliders1}` +
            `&max_size=${Sliders2}` + 
            `&search_name=${search}` + 
            `&time_unit=${units}`
            ).then(
                (res: any) => {
                    const result = res.data.map((item:any,indexs:number)=>{
                        return {
                            key:indexs,
                            ...item
                        }
                    })
                    console.log('tableData',result);
                    settableData(result);
                }
            );
        }
    }, [runs, workers, spans,units,items,Sliders1,Sliders2,search]);
    useEffect(() => {
        if (runs && workers && spans && items) {
            fetcher('/profiler/memory/op_memory_events' + 
            `?run=${runs}` + 
            `&worker=${workers}` + 
            `&span=${spans}` + 
            `&device_type=${items}` + 
            `&search_name=${search2}`
            ).then(
                (res: any) => {
                    const result = res.data.map((item:any,indexs:number)=>{
                        return {
                            key:indexs,
                            ...item
                        }
                    })
                    console.log('tableData',result);
                    
                    settableData2(result);
                }
            );
        }
    }, [runs, workers, spans,items,search2]);
    const columns: ColumnsType<DataType> = [
        {
            title: '存储类型',
            dataIndex: 'MemoryType',
            width: 150
        },
        {
            title: '分配事件',
            dataIndex: 'AllocatedEvent',
            width: 102
        },
        {
            title: '分配时间',
            dataIndex: 'AllocatedTimestamp',
            sorter: {
                compare: (a, b) => a.AllocatedTimestamp - b.AllocatedTimestamp,
                multiple: 2
            },
            width: 102
        },
        {
            title: '释放事件',
            dataIndex: 'FreeEvent',
            width: 102
        },
        {
            title: '释放时间',
            dataIndex: 'FreeTimestamp',
            sorter: {
                compare: (a, b) => a.FreeTimestamp - b.FreeTimestamp,
                multiple: 1
            },
            width: 102
        },
        {
            title: '持续时间',
            dataIndex: 'Duration',
            sorter: {
                compare: (a, b) => a.Duration - b.Duration,
                multiple: 1
            },
            width: 102
        },
        {
            title: '大小（KB)',
            dataIndex: 'Size',
            sorter: {
                compare: (a, b) => a.Size - b.Size,
                multiple: 1
            },
            width: 102
        }

    ];
    const op_columns: ColumnsType<op_DataType> = [
        {
            title: '事件名',
            dataIndex: 'EventName',
            width: 150
        },
        {
            title: '存储类型',
            dataIndex: 'MemoryType',
            width: 102
        },
        {
            title: '分配次数',
            dataIndex: 'AllocationCount',
            sorter: {
                compare: (a, b) => a.AllocationCount - b.AllocationCount,
                multiple: 2
            },
            width: 102
        },
        {
            title: '释放次数',
            dataIndex: 'FreeCount',
            sorter: {
                compare: (a, b) => a.FreeCount - b.FreeCount,
                multiple: 1
            },
            width: 102
        },
        {
            title: '分配大小(KB)',
            dataIndex: 'AllocationSize',
            sorter: {
                compare: (a, b) => a.AllocationSize - b.AllocationSize,
                multiple: 1
            },
            width: 102
        },
        {
            title: '释放大小（KB)',
            dataIndex: 'FreeSize',
            sorter: {
                compare: (a, b) => a.FreeSize - b.FreeSize,
                multiple: 1
            },
            width: 102
        },
        {
            title: '净增量（KB)',
            dataIndex: 'IncreasedSize',
            sorter: {
                compare: (a, b) => a.IncreasedSize - b.IncreasedSize,
                multiple: 1
            },
            width: 102
        }

    ];
    const getTable = useMemo(() => {
        const paginations = {
            showSizeChanger: true,
        };
        return <Table columns={columns} dataSource={tableData} bordered size="middle" pagination={paginations}></Table>;
    }, [columns, tableData]);
    const getTable2 = useMemo(() => {
        const paginations = {
            showSizeChanger: true,
        };
        return <Table columns={op_columns} dataSource={tableData2} bordered size="middle" pagination={paginations}></Table>;
    }, [op_columns, tableData2]);
    const SliderChange = (value: any) => {
        setSliders1(value[0])
        setSliders2(value[1])
    };
    const inputChange = (value: string) => {
        const slider = Number(value);
        if (slider) {
            console.log('SliderValue', slider);
            setSliders1(slider);
        }
    };
    const inputChange2 = (value: string) => {
        const slider = Number(value);
        if (slider) {
            console.log('SliderValue', slider);
            setSliders2(slider);
        }
    };
    console.log('Sliders', Sliders1, Sliders2);

    return (
        <ViewWrapper>
            <TitleNav>
                <Title>显存视图</Title>
                <div className="searchContent">
                    <div className='select_label'>
                        设备
                    </div>
                    <div className="select_wrapper">
                        <FullWidthSelect list={itemsList} value={items} onChange={setItems} />
                    </div>
                </div>
            </TitleNav>
            <Configure>
                <EchartPie>
                    <DistributedChart className={'Content'} data={lineData} zoom={true}></DistributedChart>
                </EchartPie>
            </Configure>
            <Configure>
                <div className="titleContent">
                    <div className="input_wrapper">
                        <SearchInput
                            className="search-input"
                            value={search}
                            onChange={setSearch}
                            placeholder={t('common:search-runs')}
                            rounded
                        />
                    </div>
                    <div className="SliderContent">
                        <div className="Slider_input_content">
                            <div className="unit-number">
                                <Inputs className="wrappers" onChange={inputChange} value={Sliders1 + ''} />
                            </div>
                            <div className="unit">KB</div>
                        </div>
                        <div className="Slider_wrapper">
                            <Slider range value={[Sliders1, Sliders2]} onChange={SliderChange} />
                        </div>
                        <div className="Slider_input_content">
                            <div className="unit-number">
                                {/* {Sliders ? Sliders[1] : null} */}
                                <Inputs className="wrappers" onChange={inputChange2} value={Sliders2 + ''} />
                            </div>
                            <div className="unit">KB</div>
                        </div>
                    </div>
                </div>
                <Wraper>{getTable}</Wraper>
            </Configure>
            <Configure style={{marginTop: '0px'}}>
                <div className="titleContent">
                    <div className="input_wrapper">
                        <SearchInput
                            className="search-input"
                            value={search2}
                            onChange={setSearch2}
                            placeholder={t('common:search-runs')}
                            rounded
                        />
                    </div>
                </div>
                <Wraper>{getTable2}</Wraper>
            </Configure>
        </ViewWrapper>
    );
};
export default MemoryView;
