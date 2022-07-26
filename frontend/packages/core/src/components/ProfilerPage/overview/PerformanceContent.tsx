import React, {Fragment, FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import {rem} from '~/utils/style';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import BarsChart from '~/components/BarsChart';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
import {Tabs} from 'antd';
import type {performanceType} from './types';
const PerformanceContent = styled.div`
    border: 1px solid #dddddd;
    border-radius: 4px;
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
            margin-left: 20px;
            .labels {
                width: 17px;
                height: 5px;
                background: yellow;
                line-height: 22px;
            }
            .legend_name {
                margin-left: 20px;
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: #666666;
                letter-spacing: 0;
                line-height: 14px;
                font-weight: 400;
            }
        }
    }
    .chartContent {
        width: 100%;
        height: ${rem(315)};
        display: flex;
        padding: ${rem(0)} ${rem(33)};
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
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const tooltips = (
        <div>
            <p>Content</p>
            <p>Content</p>
        </div>
    );
    const onChange = (key: string) => {
        console.log(key);
    };
    const color = [
        '#2932E1',
        '#00CC88',
        '#981EFF',
        '#066BFF',
        '#3AEB0D',
        '#E71ED5',
        '#25C9FF',
        '#0DEBB0',
        '#FF0287',
        '#00E2FF',
        '#00FF9D',
        '#D50505'
    ];
    return (
        <Fragment>
            <Tabs defaultActiveKey="1" onChange={onChange} centered>
                {performanceData &&
                    performanceData.order.map((item: string, index: number) => {
                        return (
                            <TabPane tab={item} key={index}>
                                <PerformanceContent>
                                    <div className="titles">
                                        {(performanceData as any).item?.calling_times?.key.map(
                                            (item: string, index: number) => {
                                                return (
                                                    <div className="legend">
                                                        <div
                                                            className="labels"
                                                            style={{background: `${color[index]}`}}
                                                        ></div>
                                                        <div className="legend_name">{item}</div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                    <div className="chartContent">
                                        <div className="chart">
                                            <BarsChart
                                                className={'Content'}
                                                data={(performanceData as any)[item]?.calling_times}
                                                text={1}
                                                isLegend={false}
                                            ></BarsChart>
                                        </div>
                                        <div className="chart">
                                            <BarsChart
                                                className={'Content'}
                                                data={(performanceData as any)[item]?.durations}
                                                text={2}
                                                isLegend={false}
                                                units={units}
                                            ></BarsChart>
                                        </div>
                                        <div className="chart" style={{marginRight: `${rem(0)}`}}>
                                            <BarsChart
                                                className={'Content'}
                                                data={(performanceData as any)[item]?.ratios}
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
