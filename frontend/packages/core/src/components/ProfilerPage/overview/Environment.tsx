/* eslint-disable sort-imports */
import React, {Fragment, FunctionComponent} from 'react';
import {rem} from '~/utils/style';
import {Configure, ArgumentOperation} from '../../components';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import logo from '~/assets/images/question-circle.svg';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
import {Popover} from 'antd';
import type {environmentType} from './types';
const Processes = styled.div`
    background: #f3f8fe;
    border-radius: ${rem(4)};
    padding-left: ${rem(20)};
    height: ${rem(60)};
    display: flex;
    align-items: center;
`;
const Processes_items = styled.div`
    display: flex;
    padding-right: ${rem(50)};
    border-right: 1px solid #dddddd;
`;
const Processes_label = styled.div`
    margin-right: ${rem(20)};
    color: #666666;
    font-size: ${rem(14)};
    line-height: ${rem(30)};
`;
const Processes_content = styled.div`
    font-size: ${rem(18)};
    color: #333333;
    line-height: ${rem(32)};
`;
const CPU = styled.div`
    border: 1px solid #dddddd;
    border-radius: ${rem(4)};
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
        font-size: ${rem(16)};
        color: #333333;
        text-align: left;
        line-height: ${rem(16)};
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
        font-size: ${rem(16)};
        color: #333333;
        text-align: left;
        line-height: ${rem(16)};
        font-weight: 600;
        margin-bottom: ${rem(20)};
        margin-left: ${rem(49)};
        display: flex;
        justify-content: space-between;
        .title_list {
            font-size: ${rem(12)};
            color: #666666;
            display: flex;
            .list_items {
                padding-right: ${rem(10)};
                padding-left: ${rem(10)};
                border-right: 1px solid #dddddd;
            }
        }
    }
    .itemlist {
        display: flex;
        .items {
            margin-right: ${rem(82)};
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
export type EnvironmentProps = {
    environment: environmentType;
};
const Environment: FunctionComponent<EnvironmentProps> = ({environment}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const tooltips = (
        <div>
            <p>Content</p>
            <p>Content</p>
        </div>
    );
    return (
        <Fragment>
            <Configure>
                <div className="title">配置详情</div>
                <Processes>
                    <Processes_items>
                        <Processes_label>进程数</Processes_label>
                        <Processes_content>{environment?.num_workers}</Processes_content>
                    </Processes_items>
                    <Processes_items style={{paddingLeft: `${rem(50)}`, borderRight: 'none'}}>
                        <Processes_label>设备类型</Processes_label>
                        <Processes_content>{environment?.device_type}</Processes_content>
                    </Processes_items>
                </Processes>
            </Configure>
            <Configure>
                <div className="title">
                    <div>设备详情</div>
                    <Popover content={tooltips} placement="right">
                        <ArgumentOperation
                            onClick={() => {
                                console.log('1111');
                            }}
                        >
                            <img src={PUBLIC_PATH + logo} alt="" />
                        </ArgumentOperation>
                    </Popover>
                </div>
                <CPU>
                    <div className="CPU_content">
                        <div className="CPU_title">CPU</div>
                        <div className="itemlist">
                            <div className="items">
                                <div className="percentage">{environment?.CPU.process_utilization}%</div>
                                <div className="items_label">进程利用率</div>
                            </div>
                            <div className="items items_last">
                                <div className="percentage">{environment?.CPU.system_utilization}%</div>
                                <div className="items_label">系统利用率</div>
                            </div>
                        </div>
                    </div>
                    <div className="GPU_content">
                        <div className="GPU_title">
                            <div>GPU</div>
                            <div className="title_list">
                                <div className="list_items">{environment?.GPU?.name ? environment?.GPU?.name : 0}</div>
                                <div className="list_items">
                                    {environment?.GPU?.memory ? environment?.GPU?.memory : 0}
                                </div>
                                <div className="list_items" style={{borderRight: 'none'}}>
                                    算力
                                    {environment?.GPU?.compute_capability ? environment?.GPU?.compute_capability : 0}
                                </div>
                            </div>
                        </div>
                        <div className="GPU_itemlist">
                            <div className="items">
                                <div className="percentage">
                                    {environment?.GPU?.utilization ? environment?.GPU?.utilization : 0}%
                                </div>
                                <div className="items_label">利用率</div>
                            </div>
                            <div className="items">
                                <div className="percentage">
                                    {environment?.GPU?.sm_efficiency ? environment?.GPU?.sm_efficiency : 0}%
                                </div>
                                <div className="items_label">流量处理器效率</div>
                            </div>
                            <div className="items">
                                <div className="percentage">
                                    {environment?.GPU.achieved_occupancy ? environment?.GPU.achieved_occupancy : 0}%
                                </div>
                                <div className="items_label">流量处理器占用率</div>
                            </div>
                            <div className="items items_last">
                                <div className="percentage">
                                    {environment?.GPU?.tensor_core_percentage
                                        ? environment?.GPU?.tensor_core_percentage
                                        : 0}
                                    %
                                </div>
                                <div className="items_label">tensor core使用时间占比</div>
                            </div>
                        </div>
                    </div>
                </CPU>
            </Configure>
        </Fragment>
    );
};
export default Environment;
