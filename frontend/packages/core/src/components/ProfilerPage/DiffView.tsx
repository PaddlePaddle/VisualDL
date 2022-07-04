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
import ComparsionChart from '~/components/ComparsionChart';
import Model from '~/components/ProfilerPage/model';
import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Select, Table, Input, Button} from 'antd';
import {Slider} from 'antd';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
import SearchInput from '~/components/searchInput2';
const {Option} = Select;
const {Search} = Input;
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
export type DiffViewProps = {
    diffRuns1: string;
    diffWorkers1: string;
    diffSpans1: string;
    diffRuns2: string;
    diffWorkers2: string;
    diffSpans2: string;
};

asideWidth;

const ViewWrapper = styled.div`
    width: 100%;
    height: 100%;
    flex-grow: 1;
    position: relative;
    background-color: #fff;
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
    border-bottom: 1px solid #dddddd;
    margin-bottom: ${rem(20)};
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
                    border: solid 2px #2932e1;
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
                    padding-left: ${rem(10)};
                    line-height: ${rem(36)};
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
    height: ${rem(398)};
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
    border: 1px solid #dddddd;
`;
const Pagination = styled.div`
   display:flex;
   width:100%;
   justify-content: space-between;
   margin-top: ${rem(20)};
   margin-bottom: ${rem(20)};
   font-family: PingFangSC-Regular;
   font-size: 14px;
   font-weight: 400;
   .Pagination_left{
      display:flex;
      .buttons{
          width: ${rem(82)};
          height: ${rem(36)};
          margin-right: ${rem(15)};
          .ant-btn-block{
              border-radius: 4px;
              height:100%;
          }
      }
      .next{
              .ant-btn-block {
                  color: #999999;
              }
          }
   }
   .Pagination_right{
      display:flex;
      .describe{
      line-height:${rem(36)};
      margin-right: ${rem(15)};
      color: #000000;
   }
   .buttons{
      width: ${rem(82)};
      height: ${rem(36)};
      .ant-btn-block{
          height:100%;
          background: #2932E1;
          border-radius: 4px;
          color: #FFFFFF;
      }
   }
   .input_wrapper{
      width: ${rem(80)};
      height: ${rem(36)};
      margin-right: ${rem(15)};
      .ant-input{
          border-radius: 4px;
          height: 100%;
      }
   }
   `;

const DiffView: FunctionComponent<DiffViewProps> = ({
    diffRuns1,
    diffWorkers1,
    diffSpans1,
    diffRuns2,
    diffWorkers2,
    diffSpans2
}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const model = useRef<any>(null);
    const [cpuData, setCpuData] = useState<any>();
    const [search, setSearch] = useState<string>();
    const [Sliders, setSliders] = useState<any>();
    useEffect(() => {
        if (diffRuns1 && diffWorkers1 && diffSpans1 && diffRuns2 && diffWorkers2 && diffSpans2) {
            fetcher(
                '/profiler/comparedView/pie' + `?run=${diffRuns1}` + `&worker=${diffWorkers1}` + `&span=${diffSpans2}`
            ).then((res: unknown) => {
                const result: any = res;
                setCpuData(res);
            });
        }
    }, [diffRuns1, diffWorkers1, diffSpans1, diffRuns2, diffWorkers2, diffSpans2]);

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
    const onSearch = (value: string) => {
        console.log(value);
    };
    const getTable = useMemo(() => {
        return <Table columns={columns} dataSource={data} bordered size="middle" pagination={false}></Table>;
    }, [columns, data]);
    const SliderChange = (value: any) => {
        console.log('SliderValue', value);
        setSliders(value);
    };
    return (
        <ViewWrapper>
            <Title>对比视图</Title>
            <Configure>
                <div className="title">Execution Comparsion</div>
                <EchartPie>
                    <DistributedChart className={'Content'}></DistributedChart>
                </EchartPie>
            </Configure>
            <Configure>
                <div className="title">Execution Comparsion</div>
                <EchartPie>
                    <ComparsionChart className={'Content'}></ComparsionChart>
                </EchartPie>
            </Configure>
            <Configure>
                <div className="titleContent">
                    <div className="SliderContent">
                        Operator View
                    </div>
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
                <Wraper>{getTable}</Wraper>
                <Pagination>
                    <div className="Pagination_left">
                        <div className="buttons">
                            <Button block>上一页</Button>
                        </div>
                        <div className="buttons next">
                            <Button block>下一页</Button>
                        </div>
                    </div>
                    <div className="Pagination_right">
                        <div className="describe">共5页，跳转至</div>
                        <div className="input_wrapper">
                            <Input placeholder="Basic usage" />;
                        </div>
                        <div className="buttons">
                            <Button block>确定</Button>
                        </div>
                    </div>
                </Pagination>
            </Configure>
        </ViewWrapper>
    );
};

export default DiffView;
