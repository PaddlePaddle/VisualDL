/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-imports */
import React, {Fragment, FunctionComponent} from 'react';
import {rem} from '~/utils/style';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import BarsChart from '~/components/BarsChart';
import {Tabs} from 'antd';
import type {performanceType, Callingtimes} from './types';
const PerformanceContent = styled.div`
    border: 1px solid #dddddd;
    border-radius: ${rem(4)};
    width: 100%;
    height: ${rem(378)};
    .titles {
        height: ${rem(63)};
        display: flex;
        justify-content: flex-end;
        padding-right: ${rem(30)};
        .legend {
            display: flex;
            align-items: center;
            margin-left: ${rem(20)};
            .labels {
                width: ${rem(17)};
                height: ${rem(5)};
                border-radius: ${rem(2.5)};
                background: yellow;
                line-height: ${rem(22)};
            }
            .legend_name {
                margin-left: ${rem(8)};
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: #666666;
                letter-spacing: 0;
                line-height: ${rem(14)};
                font-weight: 400;
            }
        }
    }
    .chartContent {
        width: 100%;
        height: ${rem(315)};
        display: flex;
        padding: ${rem(0)} ${rem(24)};
        .chart {
            .Content {
                height: 100%;
            }
            flex: 1;
            margin-right: ${rem(43)};
        }
    }
`;
export type EnvironmentProps = {
    performanceData: performanceType;
    units: string;
};
const {TabPane} = Tabs;
const PerformanceContents: FunctionComponent<EnvironmentProps> = ({performanceData, units}) => {
    const color = ['#2932E1', '#00CC88', '#981EFF', '#FF6D6D', '#25C9FF', '#E71ED5', '#FFAA00', '#00307D'];
    return (
        <Fragment>
            <Tabs defaultActiveKey="1" centered>
                {performanceData &&
                    performanceData.order.map((item: string, index: number) => {
                        return (
                            <TabPane tab={item} key={index}>
                                <PerformanceContent>
                                    <div className="titles">
                                        {(performanceData as any)[item]?.calling_times?.key.map(
                                            (items: string, index: number) => {
                                                return (
                                                    <div className="legend" key={index}>
                                                        <div
                                                            className="labels"
                                                            style={{background: `${color[index]}`}}
                                                        ></div>
                                                        <div className="legend_name">{items}</div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                    <div className="chartContent">
                                        <div className="chart">
                                            <BarsChart
                                                className={'Content'}
                                                data={(performanceData as any)[item]?.calling_times as Callingtimes}
                                                text={1}
                                                isLegend={false}
                                            ></BarsChart>
                                        </div>
                                        <div className="chart">
                                            <BarsChart
                                                className={'Content'}
                                                data={(performanceData as any)[item]?.durations as Callingtimes}
                                                text={2}
                                                isLegend={false}
                                                units={units}
                                            ></BarsChart>
                                        </div>
                                        <div className="chart" style={{marginRight: `${rem(0)}`}}>
                                            <BarsChart
                                                className={'Content'}
                                                data={(performanceData as any)[item]?.ratios as Callingtimes}
                                                text={3}
                                                isLegend={true}
                                            ></BarsChart>
                                        </div>
                                    </div>
                                </PerformanceContent>
                            </TabPane>
                        );
                    })}
            </Tabs>
        </Fragment>
    );
};
export default PerformanceContents;
