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

import type {Indicator, ListItem} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useMemo} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {borderRadius, rem} from '~/utils/style';

import Table from './TableView/Table';
import styled from 'styled-components';

const Wrapper = styled.div`
    background-color: var(--background-color);
    border-radius: ${borderRadius};
    padding: ${rem(20)};

    &:not(:first-child) {
        margin-top: ${rem(20)};
    }
`;

const Empty = styled.div`
    min-height: ${rem(188)};

    h3 {
        font-size: ${rem(16)};
        line-height: 1;
        margin: 0 0 1em 0;
    }

    ol {
        padding-left: 1.2em;
        color: var(--text-light-color);
        line-height: 1.5;

        li:empty {
            display: none;
        }
    }
`;

interface SessionTableProps {
    indicators: Indicator[];
    data: ListItem | null;
    showMetricsGraph: boolean;
}

const SessionTable: FunctionComponent<SessionTableProps> = ({indicators, data, showMetricsGraph}) => {
    useTranslation('hyper-parameter');

    const dataList = useMemo(() => (data ? [data] : []), [data]);

    return (
        <Wrapper>
            {data ? (
                <Table indicators={indicators} list={dataList} data={dataList} expandAll={showMetricsGraph} />
            ) : (
                <Empty>
                    <Trans i18nKey="hyper-parameter:session-table-empty">
                        <h3>Click or hover over a line to display its values here.</h3>
                        <ol>
                            <li>Hover to display values;</li>
                            <li>Click to display metrics graph.</li>
                        </ol>
                    </Trans>
                </Empty>
            )}
        </Wrapper>
    );
};

export default SessionTable;
