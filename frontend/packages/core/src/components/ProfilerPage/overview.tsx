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
import PieChart, {LineChartRef} from '~/components/pieChart';
import StackColumnChart from '~/components/StackColumnChart';
import Trainchart from '~/components/Trainchart';

import {asideWidth, rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

// const ImportanceButton = styled(Button)`
//     width: 100%;
// `;

// const HParamsImportanceDialog = styled(ImportanceDialog)`
//     position: fixed;
//     right: calc(${asideWidth} + ${rem(20)});
//     bottom: ${rem(20)};
// `;
// NOTICE: remove it!!!
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
const Processes = styled.div`
    background: #f3f8fe;
    border-radius: 4px;
    padding-left: ${rem(20)};
    height: ${rem(60)};
    display: flex;
    align-items: center;
    .Processes_items {
        display: flex;
        margin-right: ${rem(100)};
        .label {
            margin-right: ${rem(20)};
            color: #666666;
            font-size: ${rem(14)};
            line-height: ${rem(30)};
        }
        .conent {
            font-size: 18px;
            color: #333333;
        }
    }
`;
const CPU = styled.div`
    border: 1px solid #dddddd;
    border-radius: 4px;
    height: ${rem(150)};
    width: 100%;
    padding-top: ${rem(24)};
    padding-left: ${rem(20)};
    padding-bottom: ${rem(20)};
    display: flex;
    .CPU_content {
        flex: 1;
        padding-right: ${rem(30)};
        border-right: 1px solid #dddddd;
    }
    .CPU_title {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: #333333;
        text-align: left;
        line-height: 16px;
        font-weight: 600;
        margin-bottom: ${rem(20)};
    }
    .GPU_content {
        flex: 2;
        padding-left: ${rem(20)};
        padding-right: ${rem(20)};
    }
    .GPU_title {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: #333333;
        text-align: left;
        line-height: 16px;
        font-weight: 600;
        margin-bottom: ${rem(20)};
    }
    .itemlist {
        display: flex;
        .items {
            margin-right: 82px;
            .percentage {
                text-align: center;
                font-size: 28px;
                color: #333333;
            }
            .items_label {
                font-size: 12px;
                color: #999999;
                text-align: center;
                white-space: nowrap;
            }
        }
        .items_last {
            margin-right: 0px;
        }
    }
    .GPU_itemlist {
        display: flex;
        .items {
            flex: 1;
            .percentage {
                text-align: center;
                font-size: ${rem(28)};
                color: #333333;
            }
            .items_label {
                font-size: ${rem(12)};
                color: #999999;
                text-align: center;
                white-space: nowrap;
            }
        }
        .itemt_last {
            margin-right: 0px;
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

const overView: FunctionComponent = () => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    return (
        <ViewWrapper>
            <Title>总览视图</Title>
            <Configure>
                <div className="title">配置详情</div>
                <Processes>
                    <div className="Processes_items">
                        <div className="label">进程数</div>
                        <div className="conent">12</div>
                    </div>
                    <div className="Processes_items">
                        <div className="label">设备类型</div>
                        <div className="conent">qwer-sdf</div>
                    </div>
                </Processes>
            </Configure>
            <Configure>
                <div className="title">设备详情</div>
                <CPU>
                    <div className="CPU_content">
                        <div className="CPU_title">CPU</div>
                        <div className="itemlist">
                            <div className="items">
                                <div className="percentage">12%</div>
                                <div className="items_label">进程利用率</div>
                            </div>
                            <div className="items items_last">
                                <div className="percentage">23%</div>
                                <div className="items_label">系统利用率</div>
                            </div>
                        </div>
                    </div>
                    <div className="GPU_content">
                        <div className="GPU_title">
                            <div>GPU</div>
                            {/* <div>GPU</div> */}
                        </div>
                        <div className="GPU_itemlist">
                            <div className="items">
                                <div className="percentage">23%</div>
                                <div className="items_label">利用率</div>
                            </div>
                            <div className="items">
                                <div className="percentage">20%</div>
                                <div className="items_label">流量处理器效率</div>
                            </div>
                            <div className="items">
                                <div className="percentage">18%</div>
                                <div className="items_label">流量处理器占用率</div>
                            </div>
                            <div className="items items_last">
                                <div className="percentage">45%</div>
                                <div className="items_label">tensor core使用时间占比</div>
                            </div>
                        </div>
                    </div>
                </CPU>
            </Configure>
            <Configure>
                <div className="title">运行耗时</div>
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
                <div className="title">训练步数耗时</div>
                <EchartPie>
                    <Trainchart className={'Content'}></Trainchart>
                </EchartPie>
            </Configure>
            <Configure>
                <div className="title">性能消耗</div>
            </Configure>
            <Configure>
                <div className="title">模型各阶段消耗分布</div>
                <EchartPie>
                    <StackColumnChart className={'Content'}></StackColumnChart>
                </EchartPie>
            </Configure>
        </ViewWrapper>
    );
};

export default overView;
