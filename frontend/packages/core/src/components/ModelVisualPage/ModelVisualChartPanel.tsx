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

import React, {FunctionComponent, useState, useMemo} from 'react';

import {primaryColor, rem, transitionProps} from '~/utils/style';
import GridLoader from 'react-spinners/GridLoader';
import Tab from '~/components/Tab';
import ModelVisualLineChart, {
    ModelVisualLineChartProps
} from '~/components/ModelVisualPage/ModelVisualLineChart';
import ModelVisualBarChart, {
    ModelVisualBarChartProps
} from '~/components/ModelVisualPage/ModelVisualBarChart';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

export enum ChartType {
    line = 'line',
    bar = 'bar'
}

export type ChartOptions = {
    type: ChartType;
    config: ModelVisualLineChartProps | ModelVisualBarChartProps;
};

export type CollapseOptions = {
    [index: string]: ChartOptions[];
};

export type TabLoading = {
    [index: string]: boolean;
};

type ModelVisualChartPanelProps = {
    chartGroup: CollapseOptions;
    tabLoading: TabLoading;
};

const Loading = styled.div`
    width: 100%;
    height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Empty = styled.div`
    padding: ${rem(100)} 0;
    text-align: center;
    color: var(--text-light-color);
    ${transitionProps('color')}
`;

const ModelVisualChartPanel: FunctionComponent<ModelVisualChartPanelProps> = ({chartGroup, tabLoading}) => {
    const {t} = useTranslation(['model-visual', 'common']);

    const tabs = useMemo(
        () =>
            ['basic', 'index', 'indexGrad', 'num', 'numGrad'].map(value => ({
                value,
                label: t(`model-visual:tabs.${value}`)
            })),
        [t]
    );

    const [tabView, setTabView] = useState(tabs[0].value);

    return (
        <>
            <Tab
                list={tabs}
                value={tabView}
                size={8}
                onChange={setTabView}
            />
            {
                tabLoading[tabView]
                    ? <Loading>
                        <GridLoader color={primaryColor} size="10px" />
                    </Loading>
                    : chartGroup[tabView].length
                        ? chartGroup[tabView].map((item: ChartOptions, idx: number) => {
                            if(item.type == 'line') {
                                return <ModelVisualLineChart
                                    {...(item.config as ModelVisualLineChartProps)}
                                    key={idx}
                                />
                            }
                            else if (item.type == 'bar'){
                                return <ModelVisualBarChart
                                    {...(item.config as ModelVisualBarChartProps)}
                                    key={idx}
                                />
                            }
                            else {
                                return null;
                            }
                        })
                        : <Empty>{t('model-visual:tabs.empty-data')}</Empty>
            }
        </>
    );
};

export default ModelVisualChartPanel;
