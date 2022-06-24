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

import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
import {DownOutlined} from '@ant-design/icons';
import PieChart, {LineChartRef} from '~/components/pieChart';
import StackColumnChart from '~/components/StackColumnChart';
import Trainchart from '~/components/Trainchart';
import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
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

const OperatorView: FunctionComponent = () => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const columns: ColumnsType<DataType> = [
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
            width: 80,
            render: () => <div onClick={(e)=>{
                // debugger
                const Dom:any = e.currentTarget.parentElement?.parentElement?.firstChild?.firstChild
                console.log('Dom',Dom);
                
                Dom.trigger('click')
                
                
            }}>
                查看调用栈
            </div>,
            fixed: 'right'
        }
    ];
    const data: any = [];
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
    const menu = (
        <Menu
            items={[
                {key: '1', label: 'Action 1'},
                {key: '2', label: 'Action 2'}
            ]}
        />
    );
    const expandedRowRender = () => {
        const columns: ColumnsType<ExpandedDataType> = [
            {title: 'Date', dataIndex: 'date', key: 'date'},
            {title: 'Name', dataIndex: 'name', key: 'name'},
            {
                title: 'Status',
                key: 'state',
                render: () => (
                    <span>
                        <Badge status="success" />
                        Finished
                    </span>
                )
            },
            {title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum'},
            {
                title: 'Action',
                dataIndex: 'operation',
                key: 'operation',
                render: () => (
                    <Space size="middle">
                        <a>Pause</a>
                        <a>Stop</a>
                        <Dropdown overlay={menu}>
                            <a>
                                More <DownOutlined />
                            </a>
                        </Dropdown>
                    </Space>
                )
            }
        ];

        const data = [];
        for (let i = 0; i < 3; ++i) {
            data.push({
                key: i,
                date: '2014-12-24 23:12:00',
                name: 'This is production name',
                upgradeNum: 'Upgraded: 56'
            });
        }
        return <Table columns={columns} dataSource={data} pagination={false} />;
    };
    return (
        <ViewWrapper>
            <Title>算子视图</Title>
            <Configure>
                <div className="title">耗时情况</div>
                <EchartPie>
                    <div className="wraper">
                        <PieChart className={'Content'} />
                    </div>
                    <div className="wraper">
                        <PieChart className={'Content'} />
                    </div>
                </EchartPie>
            </Configure>
            <Configure>
                <div className="title">耗时情况</div>
                <Wraper>
                    <Table
                        columns={columns}
                        dataSource={data}
                        bordered
                        size="middle"
                        pagination={false}
                        expandable={{expandedRowRender}}
                        scroll={{x: 'calc(700px + 50%)', y: 240}}
                    />
                </Wraper>
                <Pagination>
                        <div className="Pagination_left">
                            <div className='buttons'>
                                <Button block>
                                    上一页
                                </Button>
                            </div>
                            <div className='buttons next'>
                                <Button block>
                                    下一页
                                </Button>
                            </div>
                        </div>
                        <div className="Pagination_right">
                            <div className='describe'>共5页，跳转至</div>
                            <div className='input_wrapper'>
                                <Input placeholder="Basic usage" />;
                            </div>
                            <div className='buttons'>
                                <Button block>
                                    确定
                                </Button>
                            </div>
                        </div>
                    </Pagination>
            </Configure>
        </ViewWrapper>
    );
};

export default OperatorView;
