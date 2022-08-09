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

import React, {FunctionComponent, useState, useEffect} from 'react';
import StackColumnChart from '~/components/StackColumnChart';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {fetcher} from '~/utils/fetch';
import {Configure, EchartPie, color, Title, ViewWrapper, FullWidthSelect} from '../../components';
import {asideWidth, rem} from '~/utils/style';
import type {infoType, histogramType} from './type';
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
    font-size: 14px;
    font-weight: 400;
    display: flex;
    .item_list {
        flex: 1;
        display: flex;
        align-items: center;
        div:nth-of-type(1) {
            padding-left: 20px;
        }
        div:nth-of-type(3) {
            border-right: none;
        }
        .items {
            padding-left: 30px;
            padding-right: 30px;
        }
        .items:nth-of-type(2) {
            border-right: 1px solid #dddddd;
            border-left: 1px solid #dddddd;
        }
    }
    .info_list {
        flex: 1;
        .items:nth-of-type(1) {
            margin-top: 14px;
        }
        .items {
            display: flex;
            margin-top: 8px;
            justify-content: center;
            .label {
                width: 220px;
                padding-right: 30px;
                text-align: right;
                color: #666666;
            }
            .info {
                width: 220px;
                text-align: left;
                color: #000000;
            }
        }
    }
`;
const EchartPies = styled(EchartPie)`
    padding: ${rem(24)};
    border: 1px solid #dddddd;
`;
export type NuclearViewProps = {
    runs: string;
    views: string;
    workers: string;
    spans: string;
    units: string;
};
type SelectListItem<T> = {
    value: T;
    label: string;
};
const NuclearView: FunctionComponent<NuclearViewProps> = ({runs, views, workers, spans, units}) => {
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
                    console.log('info,', res);
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
                console.log('distributed,', Data);
                setComputation(Data);
            });
        }
    }, [runs, workers, spans, views, steps, units]);
    return (
        <ViewWrapper>
            <Title>{t('Distribution-view')}</Title>
            <Configures style={{marginTop: '24px'}}>
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
                                            <div className="label">utilization:</div>
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
                    <div className="title">
                        <div>{t('comparisons')}</div>
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
                        color={color}
                        isWorkerName={true}
                        units={units}
                    ></StackColumnChart>
                </EchartPies>
            </Configure>
        </ViewWrapper>
    );
};

export default NuclearView;
