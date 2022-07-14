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
interface DataType {
    key: React.Key;
    name: string;
    chinese: number;
    math: number;
    english: number;
}
interface ExpandedDataType {
    key: React.Key;
    date: string;
    name: string;
    upgradeNum: string;
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
            white-space:nowrap;
        }
        .select_wrapper {
            width: ${rem(64)};
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
        margin-bottom: ${rem(10)};
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
    border-radius: 4px;
    height: ${rem(366)};
    padding: ${rem(24)};
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
    .ant-table-thead > tr > th {
        background: #f3f8fe;
    }
`;
type SelectListItem<T> = {
    value: T;
    label: string;
};
const MemoryView: FunctionComponent<MemoryViewProps> = ({runs, views, workers, spans,units}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const model = useRef<any>(null);
    const [lineData, setLineData] = useState<any>();
    const [search, setSearch] = useState<string>();
    const [Sliders1, setSliders1] = useState<number>(0);
    const [Sliders2, setSliders2] = useState<number>(100);
    const [itemsList, setItemsList] = useState<SelectListItem<string>[]>();
    const [items, setItems] = useState<string>('2');
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/memory/line' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: any) => {
                    setLineData(res.data);
                }
            );
        }
    }, [runs, workers, spans, views]);

    const columns: ColumnsType<DataType> = [
        {
            title: 'Opertator',
            dataIndex: 'name',
            width: 150
        },
        {
            title: 'Size(KB)',
            dataIndex: 'chinese',
            sorter: {
                compare: (a, b) => a.chinese - b.chinese,
                multiple: 3
            },
            width: 102
        },
        {
            title: 'Allocation Time(ms)',
            dataIndex: 'math',
            sorter: {
                compare: (a, b) => a.math - b.math,
                multiple: 2
            },
            width: 102
        },
        {
            title: 'Release Time(ms)',
            dataIndex: 'english',
            sorter: {
                compare: (a, b) => a.english - b.english,
                multiple: 1
            },
            width: 102
        },
        {
            title: 'Duration(ms)',
            dataIndex: 'english',
            sorter: {
                compare: (a, b) => a.english - b.english,
                multiple: 1
            },
            width: 102
        }
    ];

    const data: DataType[] = [
        {
            key: '1',
            name: 'John Brown',
            chinese: 98,
            math: 60,
            english: 70
        },
        {
            key: '2',
            name: 'Jim Green',
            chinese: 98,
            math: 66,
            english: 89
        },
        {
            key: '3',
            name: 'Joe Black',
            chinese: 98,
            math: 90,
            english: 70
        },
        {
            key: '4',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89
        }
    ];
    const data2: DataType[] = [
        {
            key: '1',
            name: 'John Brown',
            chinese: 98,
            math: 60,
            english: 70
        },
        {
            key: '2',
            name: 'Jim Green',
            chinese: 98,
            math: 66,
            english: 89
        },
        {
            key: '3',
            name: 'Joe Black',
            chinese: 98,
            math: 90,
            english: 70
        },
        {
            key: '4',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89
        },
        {
            key: '1',
            name: 'John Brown',
            chinese: 98,
            math: 60,
            english: 70
        },
        {
            key: '2',
            name: 'Jim Green',
            chinese: 98,
            math: 66,
            english: 89
        },
        {
            key: '3',
            name: 'Joe Black',
            chinese: 98,
            math: 90,
            english: 70
        },
        {
            key: '4',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89
        },
        {
            key: '1',
            name: 'John Brown',
            chinese: 98,
            math: 60,
            english: 70
        },
        {
            key: '2',
            name: 'Jim Green',
            chinese: 98,
            math: 66,
            english: 89
        },
        {
            key: '3',
            name: 'Joe Black',
            chinese: 98,
            math: 90,
            english: 70
        },
        {
            key: '4',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89
        },
        {
            key: '1',
            name: 'John Brown',
            chinese: 98,
            math: 60,
            english: 70
        },
        {
            key: '2',
            name: 'Jim Green',
            chinese: 98,
            math: 66,
            english: 89
        },
        {
            key: '3',
            name: 'Joe Black',
            chinese: 98,
            math: 90,
            english: 70
        },
        {
            key: '4',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89
        },
        {
            key: '1',
            name: 'John Brown',
            chinese: 98,
            math: 60,
            english: 70
        },
        {
            key: '2',
            name: 'Jim Green',
            chinese: 98,
            math: 66,
            english: 89
        },
        {
            key: '3',
            name: 'Joe Black',
            chinese: 98,
            math: 90,
            english: 70
        },
        {
            key: '4',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89
        }
    ];
    const getTable = useMemo(() => {
        const paginations = {
            showSizeChanger: true,
        };
        return <Table columns={columns} dataSource={data} bordered size="middle" pagination={paginations}></Table>;
    }, [columns, data]);
    const getTable2 = useMemo(() => {
        const paginations = {
            showSizeChanger: true,
        };
        return <Table columns={columns} dataSource={data2} bordered size="middle" pagination={paginations}></Table>;
    }, [columns, data]);
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
                    <DistributedChart className={'Content'} data={lineData}></DistributedChart>
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
                            value={search}
                            onChange={setSearch}
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
