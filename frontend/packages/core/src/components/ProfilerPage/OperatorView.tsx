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
 import PieChart, {LineChartRef} from '~/components/pieChart';
 import Model from '~/components/ProfilerPage/model';
 import {asideWidth, rem} from '~/utils/style';
 import styled from 'styled-components';
 import {useTranslation} from 'react-i18next';
 import {Select, Table, Input, Button} from 'antd';
 import type {ColumnsType} from 'antd/lib/table';
 import {fetcher} from '~/utils/fetch';
 const {Option} = Select;
 const { Search } = Input;
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
 export type OperatorViewProps = {
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
     .titleContent{
         margin-bottom: ${rem(10)};
         .title {
             margin-bottom: ${rem(0)};
             line-height:${rem(36)};
         }
         display:flex;
         justify-content:space-between;
         .searchContent{
             display:flex;
             .input_wrapper{
                 width: ${rem(160)};
                 height: ${rem(36)};
                 .ant-input-group-wrapper{
                     height: 100%;
                     width: 100%;
                     .ant-input-wrapper{
                         height: 100%;
                         .ant-input{
                             height: 100%;
                         }
                         .ant-btn{
                             height: 100%;
                         }
                     }
                     .ant-btn{
                         border-left:none
                     }
                 }
             }
             .select_wrapper{
                 width: ${rem(160)};
                 height: ${rem(36)};
                 margin-right: ${rem(15)};
                 .ant-select{
                     border-radius: 4px;
                     height: 100%;
                     .ant-select-selector{
                         height: 100%;
                     }
                 }
             }
         }
     }
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
 
 const OperatorView: FunctionComponent<OperatorViewProps> = ({runs, views, workers, spans}) => {
     const {t} = useTranslation(['hyper-parameter', 'common']);
     const model = useRef<any>(null);
     const [cpuData, setCpuData] = useState<any>();
     useEffect(() => {
         if (runs && workers && spans) {
             fetcher('/profiler/comparedView/pie' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                 (res: unknown) => {
                     const result: any = res;
                     // let tableData: any = [];
                     // let data: any = [];
                     // for (const item of result.gpu) {
                     //     const DataTypeItem: any = {};
                     //     for (const key of result.column_name) {
                     //         const name = 'GPU' + key;
                     //         DataTypeItem[name] = item[key];
                     //     }
                     //     data.push(DataTypeItem);
                     // }
                     // for (let index = 0; index < result.cpu.length; index++) {
                     //     const DataTypeItem: any = {
                     //         ...result.cpu[index],
                     //         ...data[index]
                     //     };
                     //     tableData.push(DataTypeItem);
                     // }
                     // console.log('tableData', tableData);
                     // setTableData(tableData);
                     setCpuData(res);
                 }
             );
         }
     }, [runs, workers, spans, views]);
     const columns: ColumnsType<DataType> = useMemo(() => {
         return [
             {
                 title: 'Name',
                 dataIndex: 'name',
                 key: 'name',
                 width: 100,
                 // fixed: 'left',
                 onFilter: (value: string | number | boolean, record) => record.name.indexOf(value as string) === 0
             },
             {
                 title: 'Other',
                 children: [
                     {
                         title: 'Age',
                         dataIndex: 'age',
                         key: 'age',
                         width: 150,
                         sorter: (a, b) => a.age - b.age
                     },
                     {
                         title: 'Age2',
                         dataIndex: 'age2',
                         key: 'age2',
                         width: 150,
                         sorter: (a, b) => a.age - b.age
                     },
                     {
                         title: 'Age3',
                         dataIndex: 'age3',
                         key: 'age',
                         width: 150,
                         sorter: (a, b) => a.age - b.age
                     },
                     {
                         title: 'Age4',
                         dataIndex: 'age4',
                         key: 'age4',
                         width: 150,
                         sorter: (a, b) => a.age - b.age
                     },
                     {
                         title: 'Age5',
                         dataIndex: 'age5',
                         key: 'age5',
                         width: 150,
                         sorter: (a, b) => a.age - b.age
                     },
                     {
                         title: 'Age6',
                         dataIndex: 'age6',
                         key: 'age6',
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
 
     const data: any = useMemo(() => {
         let data: any = [];
         for (let i = 0; i < 100; i++) {
             data.push({
                 key: i,
                 name: 'John Brown',
                 age: i + 1,
                 age2: 'Lake Park',
                 age3: 'C',
                 age4: 2035,
                 age5: 'Lake Street 42',
                 age6: 'SoftLake Co',
                 gender: 'M'
             });
         }
         return data;
     }, []);
     const onSearch = (value: string) => {
         console.log(value);
     }
     const expandedRowRender = useCallback((e: any, a: any, b: any, c: any) => {
         const columns: ColumnsType<ExpandedDataType> = [{title: 'Date', dataIndex: 'date', key: 'date'}];
         const data = [];
         data.push(
             {
                 key: 'aten:convolut',
                 date: 'aten:convolut',
                 name: 'This is production name',
                 upgradeNum: 'Upgraded: 56'
             },
             {
                 key: 'ion_backward',
                 date: 'ion_backward',
                 name: 'This is production name',
                 upgradeNum: 'Upgraded: 56'
             }
         );
         return <Table columns={columns} dataSource={data} pagination={false} showHeader={false} />;
     }, []);
     const getTable = useMemo(() => {
         return (
             <Table
                 columns={columns}
                 dataSource={data}
                 bordered
                 size="middle"
                 pagination={false}
                 expandable={{
                     expandedRowRender
                 }}
                 scroll={{x: 'calc(700px + 50%)', y: 240}}
             ></Table>
         );
     }, [columns, data, expandedRowRender]);
     return (
         <ViewWrapper>
             <Title>核视图</Title>
             <Configure>
                 <div className="title">耗时情况</div>
                 <EchartPie>
                     <div className="wraper">
                         <PieChart className={'Content'} data={cpuData?.cpu} isCpu={true} />
                     </div>
                     <div className="wraper">
                         <PieChart className={'Content'} data={cpuData?.gpu} isCpu={false} />
                     </div>
                 </EchartPie>
             </Configure>
             <Configure>
                 <div className="titleContent">
                     <div className="title">耗时情况</div>
                     <div className="searchContent">
                         <div className="select_wrapper">
                             <Select
                                 showSearch
                                 placeholder="Search to Select"
                                 optionFilterProp="children"
                                 filterOption={(input, option) =>
                                     (option!.children as unknown as string).includes(input)
                                 }
                                 filterSort={(optionA, optionB) =>
                                     (optionA!.children as unknown as string)
                                         .toLowerCase()
                                         .localeCompare((optionB!.children as unknown as string).toLowerCase())
                                 }
                             >
                                 <Option value="1">按算子分组</Option>
                                 <Option value="2">Closed</Option>
                                 <Option value="3">Communicated</Option>
                                 <Option value="4">Identified</Option>
                                 <Option value="5">Resolved</Option>
                                 <Option value="6">Cancelled</Option>
                             </Select>
                         </div>
                         <div className="input_wrapper">
                             {/* <Input placeholder="Basic usage" />; */}
                             <Search placeholder="input search text" onSearch={onSearch} />
                         </div>
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
             <Model ref={model}></Model>
         </ViewWrapper>
     );
 };
 
 export default OperatorView;
 