/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 import React, {FunctionComponent, useCallback, useMemo, useState,useEffect} from 'react';
 import {DownOutlined} from '@ant-design/icons';
 import PieChart, {LineChartRef} from '~/components/pieChart';
 import StackColumnChart from '~/components/StackColumnChart';
 import Trainchart from '~/components/Trainchart';
 import {asideWidth, rem} from '~/utils/style';
 import styled from 'styled-components';
 import {useTranslation} from 'react-i18next';
 import {fetcher} from '~/utils/fetch';
 import {Badge, Dropdown, Menu, Space, Table, Input, Button} from 'antd';
 import type {ColumnsType} from 'antd/lib/table';
 
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
 `;
 const EchartPie = styled.div`
     width: 100%;
     height:${rem(270)};
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
         }
     }
 `;
 const Card = styled.div`
    width: 100%;
    height: ${rem(142)};
    border: 1px solid #dddddd;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    font-weight: 400;
    display:flex;
    .item_list {
        flex:1;
        display:flex;
        align-items:center;
        div:nth-of-type(1){
            padding-left:20px;
        }
        div:nth-of-type(3){
            border-right:none;
        }
        .items{
            padding-left:30px;
            padding-right:30px;
            border-right:1px solid #dddddd;;
        }
    }
    .info_list {
        flex:1;
        .items:nth-of-type(1){
            margin-top:14px;
        }
        .items{
            display:flex;
            margin-top:8px;
            justify-content: center;
            .label{
                width:220px;
                padding-right:30px;
                text-align: right;
                color: #666666;
            }
            .info{
                width:220px;
                text-align: left;
            }
        }
    }
 `;
 export type overViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
};
 const NuclearView: FunctionComponent<overViewProps> = ({runs, views, workers, spans}) => {
     const {t} = useTranslation(['hyper-parameter', 'common']);
     const [distributed, setDistributed] = useState<any>();
     useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/overview/distributed' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const Data: any = res;
                    console.log('distributed,', Data);
                    setDistributed(Data);
                }
            );
        }
    }, [runs, workers, spans, views]);
     return (
         <ViewWrapper>
             <Title>分布视图</Title>
             <Configure>
                 <div className="title">设备信息</div>
                 <div>
                    <Card>
                        <div className='item_list'>
                            <div className='items'>
                                worker0
                            </div>
                            <div className='items'>
                                Process0
                            </div>
                            <div className='items'>
                                GPU0
                            </div>
                        </div>
                        <div className='info_list'>
                            <div className='items'>
                                <div className='label'>
                                    Name:
                                </div>
                                <div className='info'>
                                    Tesla P40
                                </div>
                            </div>
                            <div className='items'>
                                <div className='label'>
                                    Memory:
                                </div>
                                <div className='info'>
                                    22.38 GB
                                </div>
                            </div>
                            <div className='items'>
                                <div className='label'>
                                    Memory Raw:
                                </div>
                                <div className='info'>
                                    24032378880
                                </div>
                            </div>
                            <div className='items'>
                                <div className='label'>
                                    Compute Capability:
                                </div>
                                <div className='info'>
                                    6.1
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card>
                    <div className='item_list'>
                            <div className='items'>
                                worker0
                            </div>
                            <div className='items'>
                                Process0
                            </div>
                            <div className='items'>
                                GPU0
                            </div>
                        </div>
                        <div className='info_list'>
                            <div className='items'>
                                <div className='label'>
                                    Name:
                                </div>
                                <div className='info'>
                                    Tesla P40
                                </div>
                            </div>
                            <div className='items'>
                                <div className='label'>
                                    Memory:
                                </div>
                                <div className='info'>
                                    22.38 GB
                                </div>
                            </div>
                            <div className='items'>
                                <div className='label'>
                                    Memory Raw:
                                </div>
                                <div className='info'>
                                    24032378880
                                </div>
                            </div>
                            <div className='items'>
                                <div className='label'>
                                    Compute Capability:
                                </div>
                                <div className='info'>
                                    6.1
                                </div>
                            </div>
                        </div>
                    </Card>
                 </div>
             </Configure>
             <Configure>
                <div className="title">模型各阶段消耗分布</div>
                <EchartPie>
                    <StackColumnChart className={'Content'} data={distributed}></StackColumnChart>
                </EchartPie>
            </Configure>
         </ViewWrapper>
     );
 };
 
 export default NuclearView;
 