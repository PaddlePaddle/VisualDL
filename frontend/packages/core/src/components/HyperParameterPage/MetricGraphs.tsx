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

import React, {FunctionComponent} from 'react';

import type {Run} from '~/types';
import ScalarChart from '~/components/HyperParameterPage/ScalarChart';
import {Trans} from 'react-i18next';
import {rem} from '~/utils/style';
import styled from 'styled-components';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: flex-start;

    > * {
        margin: 0 ${rem(20)} ${rem(20)} 0;
        flex-shrink: 0;
        flex-grow: 0;

        &.maximized {
            margin-right: 0;
        }
    }
`;

const Empty = styled.div`
    width: 100%;
    height: ${rem(370)};
    background-image: url(${`${PUBLIC_PATH}/images/empty.svg`});
    background-repeat: no-repeat;
    background-position: calc(50% + ${rem(12)}) ${rem(50)};
    background-size: ${rem(200)} ${rem(200)};
    padding-top: ${rem(250)};
    font-size: ${rem(16)};
    text-align: center;
    line-height: 2;

    > .subtitle {
        font-size: 0.875em;
        color: var(--text-lighter-color);
    }
`;

export interface MetricGraphsProps {
    metrics: string[];
    run: Run;
}

const MetricGraphs: FunctionComponent<MetricGraphsProps> = ({metrics, run}) => {
    return (
        <Wrapper>
            {metrics.length ? (
                metrics.map(metric => <ScalarChart key={metric} metric={metric} run={run} />)
            ) : (
                <Empty>
                    <Trans i18nKey="hyper-parameter:metric-graphs-empty">
                        <div>No metrics selected.</div>
                        <div className="subtitle">Please select some metrics to view graphs here.</div>
                    </Trans>
                </Empty>
            )}
        </Wrapper>
    );
};

export default MetricGraphs;
