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

import React, {FunctionComponent, useMemo, useState, useEffect} from 'react';
import DistributedChart from '~/components/DistributedChart';
import Inputs from '~/components/Input';
import {asideWidth, rem, primaryColor} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Table} from 'antd';
import {Slider} from 'antd';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
import SearchInput from '~/components/searchInput2';
import GridLoader from 'react-spinners/GridLoader';
import {Wraper, Title, FullWidthSelect, Configure, EchartPie} from '../../components';
import type {devicesType, curveType, memory_events_type, Datum, op_memory_events_type, op_datum} from './type';
import {number} from 'echarts';
import NumberInput from '../NumberInput';
interface DataType {
    key: React.Key;
    MemoryType: string;
    AllocatedEvent: string;
    AllocatedTimestamp: number;
    FreeEvent: string;
    FreeTimestamp: number;
    Duration: number;
    Size: number;
}
interface op_table extends op_datum {
    key: string;
}
interface op_DataType {
    key: React.Key;
    EventName: string;
    MemoryType: string;
    AllocationCount: number;
    FreeCount: number;
    AllocationSize: number;
    FreeSize: number;
    IncreasedSize: number;
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
    align-items: center;
    border-bottom: 1px solid #dddddd;
    margin-bottom: ${rem(20)};
    .searchContent {
        display: flex;
        align-items: center;
        .select_label {
            margin-right: ${rem(15)};
            color: #000000;
            font-size: ${rem(14)};
            white-space: nowrap;
        }
        .select_wrapper {
            width: auto;
            height: ${rem(36)};
            margin-right: ${rem(15)};
        }
    }
`;
const Titles = styled(Title)`
    border-bottom: none;
    margin-bottom: ${rem(0)};
`;
const Configures = styled(Configure)`
    .titleContent {
        margin-bottom: ${rem(15)};
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
                    border: solid ${rem(4)} #2932e1;
                }
                margin: ${rem(0)} ${rem(20)};
            }
            .Slider_input_content {
                height: ${rem(36)};
                display: flex;
                border: 1px solid #dddddd;
                border-radius: ${rem(4)};
                padding-right: ${rem(10)};
                justify-content: space-between;
                // width: ${rem(88)};

                .unit-number {
                    width: auto;
                    padding: ${rem(5)};
                    line-height: ${rem(36)};
                    display: flex;
                    align-items: center;
                    .wrappers {
                        max-width: ${rem(100)};
                        height: 100%;
                        border: none;
                        font-size: ${rem(14)};
                    }
                }
                .unit {
                    font-size: ${rem(14)};
                    color: #999999;
                    line-height: ${rem(36)};
                }
            }
        }
    }
`;
type SelectListItem<T> = {
    value: T;
    label: string;
};
interface tableType extends Datum {
    key: string;
}
const MemoryView: FunctionComponent<MemoryViewProps> = ({runs, workers, spans, units}) => {
    const {t} = useTranslation(['profiler', 'common']);
    const [lineData, setLineData] = useState<curveType>();
    const [search, setSearch] = useState<string>('');
    const [search2, setSearch2] = useState<string>('');
    const [Sliders1, setSliders1] = useState<number>(0);
    const [Sliders2, setSliders2] = useState<number>(10000);
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>();
    const [envirements, setEnvirements] = useState<devicesType[]>();
    const [tableData, settableData] = useState<tableType[]>();
    const [tableLoading, settableLoading] = useState(true);
    const [tableData2, settableData2] = useState<op_table[]>();
    const [tableLoading2, settableLoading2] = useState(true);
    const [items, setItems] = useState<string>();
    const [range, setRange] = useState<number[]>([]);
    const [allocation, setAllocation] = useState<string>();

    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/memory/devices' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const result = res as devicesType[];
                    const itemsLists = result.map(element => {
                        const regex1 = /\((.+?)\)/g;
                        const label: string = element.device.match(regex1)![0];
                        const labels = label.substring(1, label.length - 1);
                        return {label: labels, value: element.device};
                    });
                    setEnvirements(result);
                    setItemsList(itemsLists);
                    setItems(result[0].device);
                    setAllocation(result[0].max_allocation_size);
                }
            );
        }
    }, [runs, workers, spans]);
    useEffect(() => {
        if (runs && workers && spans && items) {
            fetcher(
                '/profiler/memory/curve' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&device_type=${items}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const result = res as curveType;
                setLineData(result);
            });
        }
    }, [runs, workers, spans, units, items]);
    useEffect(() => {
        if (items && envirements) {
            for (let index = 0; index < envirements.length; index++) {
                const element = envirements[index];
                if (items === element.device) {
                    setSliders1(element.min_size);
                    setSliders2(element.max_size);
                    setRange([element.min_size, element.max_size]);
                    setAllocation(element.max_allocation_size);
                }
            }
        }
    }, [items, envirements]);
    useEffect(() => {
        settableLoading(true);
        if (runs && workers && spans && items) {
            fetcher(
                '/profiler/memory/memory_events' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&device_type=${items}` +
                    `&min_size=${Sliders1}` +
                    `&max_size=${Sliders2}` +
                    `&search_name=${search}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const Data = res as memory_events_type;
                const result: tableType[] = Data.data.map((item, indexs) => {
                    return {
                        key: indexs + '',
                        ...item
                    };
                });

                settableData(result);
                settableLoading(false);
            });
        }
    }, [runs, workers, spans, units, items, Sliders1, Sliders2, search]);
    useEffect(() => {
        settableLoading2(true);
        if (runs && workers && spans && items) {
            fetcher(
                '/profiler/memory/op_memory_events' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&device_type=${items}` +
                    `&search_name=${search2}`
            ).then((res: unknown) => {
                const Data = res as op_memory_events_type;
                const result: op_table[] = Data.data.map((item, indexs) => {
                    return {
                        key: indexs + '',
                        ...item
                    };
                });
                settableLoading2(false);
                settableData2(result);
            });
        }
    }, [runs, workers, spans, items, search2]);
    const columns: ColumnsType<DataType> = useMemo(() => {
        const columns: ColumnsType<DataType> = [
            {
                title: t('MemorAddr'),
                dataIndex: 'MemoryAddr',
                width: 150
            },
            {
                title: t('storage-type'),
                dataIndex: 'MemoryType',
                width: 150
            },
            {
                title: t('AllocatedEvent'),
                dataIndex: 'AllocatedEvent',
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('AllocatedTimestamp') + `(${units})`,
                dataIndex: 'AllocatedTimestamp',
                sorter: (a, b) => {
                    return a.AllocatedTimestamp - b.AllocatedTimestamp;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('FreeEvent'),
                dataIndex: 'FreeEvent',
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('FreeTimestamp') + `(${units})`,
                dataIndex: 'FreeTimestamp',
                sorter: (a, b) => {
                    return a.FreeTimestamp - b.FreeTimestamp;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('Duration') + `(${units})`,
                dataIndex: 'Duration',
                sorter: (a, b) => {
                    return a.Duration - b.Duration;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('Size') + '（KB)',
                dataIndex: 'Size',
                sorter: (a, b) => {
                    return a.Size - b.Size;
                },
                width: 102,
                render: text => {
                    return <div>{text}</div>;
                }
            }
        ];
        return columns;
    }, [t, units]);
    const op_columns = useMemo(() => {
        const op_columns: ColumnsType<op_DataType> = [
            {
                title: t('EventName'),
                dataIndex: 'EventName',
                width: 150
            },
            {
                title: t('storage-type'),
                dataIndex: 'MemoryType',
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('AllocationCount'),
                dataIndex: 'AllocationCount',
                sorter: (a, b) => {
                    return a.AllocationCount - b.AllocationCount;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('FreeCount'),
                dataIndex: 'FreeCount',
                sorter: (a, b) => {
                    return a.FreeCount - b.FreeCount;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('AllocationSize') + '(KB)',
                dataIndex: 'AllocationSize',
                sorter: (a, b) => {
                    return a.AllocationSize - b.AllocationSize;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('FreeSize') + '(KB)',
                dataIndex: 'FreeSize',
                sorter: (a, b) => {
                    return a.FreeSize - b.FreeSize;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            },
            {
                title: t('IncreasedSize') + '(KB)',
                dataIndex: 'IncreasedSize',
                sorter: (a, b) => {
                    return a.IncreasedSize - b.IncreasedSize;
                },
                width: 102,
                render: text => {
                    if (text === 0 || text) {
                        return <div>{text}</div>;
                    } else {
                        return <div>{'-'}</div>;
                    }
                }
            }
        ];
        return op_columns;
    }, [t]);
    const SliderChange = (value: number[]) => {
        setSliders1(value[0]);
        setSliders2(value[1]);
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
        const slider = getNAN(value);
        console.log('slider', slider);
        if (slider) {
            setSliders1(slider);
        } else {
            setSliders1(0);
        }
    };
    const inputChange2 = (value: string) => {
        const slider = getNAN(value);
        console.log('slider', slider);
        if (slider) {
            setSliders2(slider);
        } else {
            setSliders2(0);
        }
    };
    console.log('max', Sliders1, Sliders2);

    return (
        <ViewWrapper>
            <TitleNav>
                <Titles>{t('memory-view')}</Titles>
                <div className="searchContent">
                    <div className="select_label">{t('equipment')}</div>
                    <div className="select_wrapper">
                        <FullWidthSelect list={itemsList} value={items} onChange={setItems} />
                    </div>
                </div>
            </TitleNav>
            <Configure>
                <EchartPie>
                    <DistributedChart
                        className={'Content'}
                        data={lineData}
                        zoom={true}
                        titles={allocation}
                    ></DistributedChart>
                </EchartPie>
            </Configure>
            <Configures>
                <div className="titleContent">
                    <div className="input_wrapper">
                        <SearchInput
                            className="search-input"
                            value={search}
                            onChange={setSearch}
                            placeholder={t('search-event-name')}
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
                            <Slider
                                range
                                max={range.length && range[1]}
                                min={range.length && range[0]}
                                value={[Sliders1, Sliders2]}
                                onChange={SliderChange}
                            />
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
                <Wraper>
                    {tableLoading && (
                        <div className="loading">
                            <GridLoader color={primaryColor} size="10px" />
                        </div>
                    )}
                    {tableData && !tableLoading && (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            bordered
                            size="middle"
                            pagination={{
                                showSizeChanger: true
                            }}
                        ></Table>
                    )}
                </Wraper>
            </Configures>
            <Configure style={{marginTop: '0px'}}>
                <div className="titleContent" style={{marginBottom: rem(15)}}>
                    <div className="input_wrapper">
                        <SearchInput
                            className="search-input"
                            value={search2}
                            onChange={setSearch2}
                            placeholder={t('search-event-name')}
                            rounded
                        />
                    </div>
                </div>
                <Wraper>
                    {tableLoading2 && (
                        <div className="loading">
                            <GridLoader color={primaryColor} size="10px" />
                        </div>
                    )}
                    {tableData2 && !tableLoading2 && (
                        <Table
                            columns={op_columns}
                            dataSource={tableData2}
                            bordered
                            size="middle"
                            pagination={{
                                showSizeChanger: true
                            }}
                        ></Table>
                    )}
                </Wraper>
            </Configure>
        </ViewWrapper>
    );
};
export default MemoryView;
