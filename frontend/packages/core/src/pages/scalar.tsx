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

import ChartPage, {RenderChart} from '~/components/ChartPage';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import ScalarChart, {Loader as ChartLoader} from '~/components/ScalarPage/ScalarChart';
import {SortingMethod, XAxis, parseSmoothing, sortingMethod as toolTipSortingValues} from '~/resource/scalar';

import {AsideSection} from '~/components/Aside';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import RunAside from '~/components/RunAside';
import Select from '~/components/Select';
import Slider from '~/components/Slider';
import type {Tag} from '~/types';
import TimeModeSelect from '~/components/TimeModeSelect';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import useLocalStorage from '~/hooks/useLocalStorage';
import useQuery from '~/hooks/useQuery';
import useTagFilter from '~/hooks/useTagFilter';
import {useTranslation} from 'react-i18next';

const TooltipSortingDiv = styled.div`
    margin-top: ${rem(20)};
    display: flex;
    align-items: center;

    > :last-child {
        margin-left: ${rem(20)};
        flex-shrink: 1;
        flex-grow: 1;
    }
`;

const Scalar: FunctionComponent = () => {
    const {t} = useTranslation(['scalar', 'common']);
    const query = useQuery();

    const [running, setRunning] = useState(true); // 是否运行中

    const {runs, tags, selectedRuns, onChangeRuns, loading} = useTagFilter('scalar', running);
    // runs 为 运行中的数据

    const [smoothingFromLocalStorage, setSmoothingFromLocalStorage] = useLocalStorage('scalar_smoothing');
    const parsedSmoothing = useMemo(() => {
        if (query.smoothing != null) {
            return parseSmoothing(query.smoothing);
        }
        return parseSmoothing(smoothingFromLocalStorage);
    }, [query.smoothing, smoothingFromLocalStorage]);
    const [smoothing, setSmoothing] = useState(parsedSmoothing); // 平滑度
    useEffect(() => setSmoothingFromLocalStorage(String(smoothing)), [smoothing, setSmoothingFromLocalStorage]);

    const [xAxis, setXAxis] = useState<XAxis>(XAxis.Step); // x轴三个值

    const [tooltipSorting, setTooltipSorting] = useState<SortingMethod>(toolTipSortingValues[0]);  // 排序值

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);  // 是否忽略极端值

    const [smoothedDataOnly, setSmoothedDataOnly] = useState(false); // 是否显示平滑后的数据

    const [showMostValue, setShowMostValue] = useState(false); // 是否显示最值

    const aside = useMemo(
        () => (
            // 选择数据流 搜索框 和 全选
            <RunAside
                runs={runs}
                selectedRuns={selectedRuns}
                onChangeRuns={onChangeRuns}
                running={running}
                onToggleRunning={setRunning}
                loading={loading}
            >
                <AsideSection>
                    {/* 第一子项 */}
                    <Field>
                        <Checkbox checked={ignoreOutliers} onChange={setIgnoreOutliers}>
                            {t('scalar:ignore-outliers')}
                        </Checkbox>
                    </Field>
                    {/* 第二子项 */}
                    <Field>
                        <Checkbox checked={showMostValue} onChange={setShowMostValue}>
                            {t('scalar:show-most-value')}
                        </Checkbox>
                    </Field>
                    {/* 第三子项 */}
                    <TooltipSortingDiv>
                        <span>{t('scalar:tooltip-sorting')}</span>
                        <Select
                            list={toolTipSortingValues.map(value => ({
                                label: t(`scalar:tooltip-sorting-value.${value}`),
                                value
                            }))}
                            value={tooltipSorting}
                            onChange={setTooltipSorting}
                        />
                    </TooltipSortingDiv>
                </AsideSection>
                <AsideSection>
                    <Field label={t('scalar:smoothing')}>
                        <Slider min={0} max={0.99} step={0.01} value={smoothing} onChangeComplete={setSmoothing} />
                    </Field>
                    <Field>
                        <Checkbox checked={smoothedDataOnly} onChange={setSmoothedDataOnly}>
                            {t('scalar:smoothed-data-only')}
                        </Checkbox>
                    </Field>
                </AsideSection>
                <AsideSection>
                    <Field label={t('scalar:x-axis')}>
                        {/* X轴选择 */}
                        <TimeModeSelect value={xAxis} onChange={setXAxis} />
                    </Field>
                </AsideSection>
            </RunAside>
        ),
        [
            ignoreOutliers,
            loading,
            onChangeRuns,
            running,
            runs,
            selectedRuns,
            showMostValue,
            smoothedDataOnly,
            smoothing,
            t,
            tooltipSorting,
            xAxis
        ]
    );
    // scalar Chart图形组件
    const renderChart = useCallback<RenderChart<Tag>>(
        ({label, runs}) => (
            <ScalarChart
                runs={runs}
                tag={label}
                smoothing={smoothing} 
                xAxis={xAxis} 
                sortingMethod={tooltipSorting}
                outlier={ignoreOutliers}
                smoothedOnly={smoothedDataOnly}
                showMostValue={showMostValue}
                running={running}
            />
        ),
        [smoothing, xAxis, tooltipSorting, ignoreOutliers, showMostValue, smoothedDataOnly, running]
    );

    return (
        <>
            {/* 作用未知，删除后页面无明显变化 */}
            <Title>{t('common:scalar')}</Title>
            {/* content中右侧包含了高级搜索器 */}
            <Content aside={aside}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    // <div>1</div>
                    <ChartPage items={tags} renderChart={renderChart} loader={<ChartLoader />} loading={loading} />
                )}
            </Content>
        </>
    );
};

export default Scalar;
