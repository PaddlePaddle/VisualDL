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
interface Theobj {
    [propname: string]: any;
}
const Scalar: FunctionComponent = () => {
    const {t} = useTranslation(['scalar', 'common']);
    const query = useQuery();

    const [running, setRunning] = useState(true);
    const scalarsData = useTagFilter('scalars', running, 3);
    const scalarData = useTagFilter('scalar', running);
    const runs = [...scalarData.runs, ...scalarsData.runs];
    const selectedRuns = [...scalarData.selectedRuns, ...scalarsData.selectedRuns];
    const onChangeRuns = scalarData.onChangeRuns;
    const loading = scalarData.loading || scalarsData.loading;
    const [smoothingFromLocalStorage, setSmoothingFromLocalStorage] = useLocalStorage('scalar_smoothing');
    const parsedSmoothing = useMemo(() => {
        if (query.smoothing != null) {
            return parseSmoothing(query.smoothing);
        }
        return parseSmoothing(smoothingFromLocalStorage);
    }, [query.smoothing, smoothingFromLocalStorage]);
    const [smoothing, setSmoothing] = useState(parsedSmoothing);
    useEffect(() => setSmoothingFromLocalStorage(String(smoothing)), [smoothing, setSmoothingFromLocalStorage]);
    const [xAxis, setXAxis] = useState<XAxis>(XAxis.Step);

    const [tooltipSorting, setTooltipSorting] = useState<SortingMethod>(toolTipSortingValues[0]);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const [smoothedDataOnly, setSmoothedDataOnly] = useState(false);

    const [showMostValue, setShowMostValue] = useState(false);
    const aside = useMemo(
        () => (
            <RunAside
                runs={runs}
                selectedRuns={selectedRuns}
                onChangeRuns={onChangeRuns}
                running={running}
                onToggleRunning={setRunning}
                loading={loading}
            >
                <AsideSection>
                    <Field>
                        <Checkbox checked={ignoreOutliers} onChange={setIgnoreOutliers}>
                            {t('scalar:ignore-outliers')}
                        </Checkbox>
                    </Field>
                    <Field>
                        <Checkbox checked={showMostValue} onChange={setShowMostValue}>
                            {t('scalar:show-most-value')}
                        </Checkbox>
                    </Field>
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
    const clone = (obj: any, o:any = undefined) => {
        //Object.prototype.toString.call(obj)返回类似[Object Array] 利用slice来截取我们需要的字符串
        let type = Object.prototype.toString.call(obj).slice(8, -1); //slice方法创建新的数组
        // 如果是Object
        if (type === 'Object') {
            o = {};
            for (let k in obj) {
                o[k] = clone(obj[k]);
            }
            // 如果是对象
        } else if (type === 'Array') {
            // 直接使用 = 赋值，只是指向相同的引用，如果原数组变化，克隆的数组也会跟着变化
            o = [];
            for (let i = 0; i < obj.length; i++) {
                o.push(clone(obj[i]));
            }
        } else {
            // 非引用类型
            o = obj;
        }
        return o; // 在Javascript里，如果克隆对象是基本类型，我们直接赋值就可以了
        // 把一个值赋给另一个变量时，当那个变量的值改变的时候，另一个值不会受到影响。
    };
    const sumTags = clone([...scalarsData.tags,...scalarData.tags]);
    const newtags:any = []
    const getTags = (tags: any,newtags:any) => {
        if (tags.length > 0) {
            const Objecttags: Theobj = {};
            for (const tag of tags) {
                if (!Objecttags[tag.label]) {
                    Objecttags[tag.label] = tag;
                } else {
                    const oldruns = Objecttags[tag.label].runs;
                    Objecttags[tag.label].runs = [...oldruns, ...tag.runs];
                }
            }
            for (const label of Object.keys(Objecttags)) {
                newtags.push(Objecttags[label]);
            }
            // return newtags;
        }
    };
    getTags(sumTags,newtags);
    const tags = newtags
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
            <Title>{t('common:scalar')}</Title>
            <Content aside={aside}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage items={tags} renderChart={renderChart} loader={<ChartLoader />} loading={loading} />
                )}
            </Content>
        </>
    );
};

export default Scalar;
