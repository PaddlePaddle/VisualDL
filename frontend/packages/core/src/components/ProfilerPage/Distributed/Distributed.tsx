/* eslint-disable sort-imports */
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

import React, {FunctionComponent, useState, useEffect, useCallback} from 'react';
import StackColumnChart from '~/components/StackColumnChart';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {fetcher} from '~/utils/fetch';
import {Configure, EchartPie, ArgumentOperation, Title, ViewWrapper, FullWidthSelect} from '../../components';
import {asideWidth, rem} from '~/utils/style';
import type {infoType, histogramType} from './type';
import {Popover} from 'antd';
import logo from '~/assets/images/question-circle.svg';
asideWidth;
const Configures = styled(Configure)`
    .border {
        border-top: none;
    }
`;
const Card = styled.div`
    width: 100%;
    height: ${rem(142)};
    border: 1px solid #dddddd;
    font-family: PingFangSC-Regular;
    font-size: ${rem(14)};
    font-weight: 400;
    display: flex;
    .item_list {
        flex: 1;
        display: flex;
        align-items: center;
        div:nth-of-type(1) {
            padding-left: ${rem(20)};
        }
        div:nth-of-type(3) {
            border-right: none;
        }
        .items {
            padding-left: ${rem(30)};
            padding-right: ${rem(30)};
        }
        .items:nth-of-type(2) {
            border-right: 1px solid #dddddd;
            border-left: 1px solid #dddddd;
        }
    }
    .info_list {
        flex: 1;
        .items:nth-of-type(1) {
            margin-top: ${rem(14)};
        }
        .items {
            display: flex;
            margin-top: ${rem(8)};
            justify-content: center;
            .label {
                width: ${rem(220)};
                padding-right: ${rem(30)};
                text-align: right;
                color: #666666;
            }
            .info {
                width: ${rem(220)};
                text-align: left;
                color: #000000;
            }
        }
    }
`;
const EchartPies = styled(EchartPie)`
    padding: ${rem(24)};
    border: 1px solid #dddddd;
    height: ${rem(366)};
`;
export type NuclearViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
    units: string;
    descriptions: any;
};
type SelectListItem<T> = {
    value: T;
    label: string;
};
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
const NuclearView: FunctionComponent<NuclearViewProps> = ({runs, views, workers, spans, units, descriptions}) => {
    const {t} = useTranslation(['profiler', 'common']);
    const [computation, setComputation] = useState<histogramType>();
    const [distributedData, setDistributedData] = useState<infoType[]>();
    const [stepsList, setStepsList] = useState<SelectListItem<string>[]>();
    const [steps, setSteps] = useState<string>();
    useEffect(() => {
        if (runs && workers && spans) {
            fetcher('/profiler/distributed/info' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const result = res as infoType[];
                    setDistributedData(result);
                }
            );
            fetcher('/profiler/distributed/steps' + `?run=${runs}` + `&worker=${workers}` + `&span=${spans}`).then(
                (res: unknown) => {
                    const stepData = res as string[] | number[];
                    const stepList = stepData.map(item => {
                        return {label: item + '', value: item + ''};
                    });
                    setStepsList(stepList);
                    setSteps(stepData[0] + '');
                }
            );
        }
    }, [runs, workers, spans]);
    useEffect(() => {
        if (runs && workers && spans && steps && units) {
            fetcher(
                '/profiler/distributed/histogram' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&step=${steps}` +
                    `&time_unit=${units}`
            ).then((res: unknown) => {
                const Data = res as histogramType;
                setComputation(Data);
            });
        }
    }, [runs, workers, spans, views, steps, units]);
    const gettTooltip: (name: string) => JSX.Element = useCallback(
        (name: string) => {
            const tooltips = (
                <div
                    style={{
                        width: rem(700),
                        color: '#333333',
                        fontWeight: 400
                    }}
                    dangerouslySetInnerHTML={{__html: descriptions ? descriptions[name] : ''}}
                ></div>
            );
            return tooltips;
        },
        [descriptions]
    );
    const getPopupContainers = (trigger: any) => {
        return trigger.parentElement;
    };
    return (
        <ViewWrapper>
            <Title>{t('Distribution-view')}</Title>
            <Configures style={{marginTop: `${rem(24)}`}}>
                <div className="titleContent">
                    <div className="titles">
                        <div>{t('Device-Information')}</div>
                    </div>
                </div>
                <div>
                    {distributedData &&
                        distributedData.map((items, index) => {
                            return (
                                <Card className={index === 1 ? 'border' : ''} key={index}>
                                    <div className="item_list">
                                        <div className="items">{items.worker_name}</div>
                                        <div className="items">{items.process_id}</div>
                                        <div className="items">{items.device_id}</div>
                                    </div>
                                    <div className="info_list">
                                        <div className="items">
                                            <div className="label">Name:</div>
                                            <div className="info">{items.name}</div>
                                        </div>
                                        <div className="items">
                                            <div className="label">Memory:</div>
                                            <div className="info">{items.memory}</div>
                                        </div>
                                        <div className="items">
                                            <div className="label">ComputeCapability:</div>
                                            <div className="info">{items.computeCapability}</div>
                                        </div>
                                        <div className="items">
                                            <div className="label">Utilization:</div>
                                            <div className="info">{items.utilization}</div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                </div>
            </Configures>
            <Configure style={{marginBottom: `${rem(20)}`}}>
                <div className="titleContent" style={{marginBottom: rem(15)}}>
                    <div className="titles" style={{marginBottom: `${rem(0)}`}}>
                        <div>{t('comparisons')}</div>
                        <Popover
                            content={gettTooltip('distributed_histogram')}
                            getPopupContainer={getPopupContainers}
                            placement="right"
                        >
                            <ArgumentOperation>
                                <img src={PUBLIC_PATH + logo} alt="" />
                            </ArgumentOperation>
                        </Popover>
                    </div>
                    <div className="searchContent">
                        <div className="select_label">{t('training-steps')}</div>
                        <div className="select_wrapper">
                            <FullWidthSelect list={stepsList} value={steps} onChange={setSteps} />
                        </div>
                    </div>
                </div>
                <EchartPies>
                    <StackColumnChart
                        className={'Content'}
                        data={computation}
                        isWorkerName={true}
                        units={units}
                        istotal={true}
                    ></StackColumnChart>
                </EchartPies>
            </Configure>
        </ViewWrapper>
    );
};

export default NuclearView;
