import ChartPage, {WithChart} from '~/components/ChartPage';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useMemo, useState} from 'react';
import {SortingMethod, XAxis, sortingMethod as toolTipSortingValues} from '~/resource/scalar';

import {AsideSection} from '~/components/Aside';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Error from '~/components/Error';
import Field from '~/components/Field';
import Preloader from '~/components/Preloader';
import RunAside from '~/components/RunAside';
import ScalarChart from '~/components/ScalarPage/ScalarChart';
import Select from '~/components/Select';
import Slider from '~/components/Slider';
import {Tag} from '~/types';
import TimeModeSelect from '~/components/TimeModeSelect';
import Title from '~/components/Title';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import useTagFilter from '~/hooks/useTagFilter';

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

const Scalar: NextI18NextPage = () => {
    const {t} = useTranslation(['scalar', 'common']);

    const [running, setRunning] = useState(true);

    const {runs, tags, selectedRuns, onChangeRuns, loading} = useTagFilter('scalar', running);

    const [smoothing, setSmoothing] = useState(0.6);

    const [xAxis, setXAxis] = useState<XAxis>(XAxis.Step);

    const [tooltipSorting, setTooltipSorting] = useState<SortingMethod>(toolTipSortingValues[0]);

    const [ignoreOutliers, setIgnoreOutliers] = useState(false);

    const aside = useMemo(
        () =>
            runs.length ? (
                <RunAside
                    runs={runs}
                    selectedRuns={selectedRuns}
                    onChangeRuns={onChangeRuns}
                    running={running}
                    onToggleRunning={setRunning}
                >
                    <AsideSection>
                        <Checkbox value={ignoreOutliers} onChange={setIgnoreOutliers}>
                            {t('scalar:ignore-outliers')}
                        </Checkbox>
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
                    </AsideSection>
                    <AsideSection>
                        <Field label={t('scalar:x-axis')}>
                            <TimeModeSelect value={xAxis} onChange={setXAxis} />
                        </Field>
                    </AsideSection>
                </RunAside>
            ) : null,
        [t, ignoreOutliers, onChangeRuns, running, runs, selectedRuns, smoothing, tooltipSorting, xAxis]
    );

    const withChart = useCallback<WithChart<Tag>>(
        ({label, runs, ...args}) => (
            <ScalarChart
                runs={runs}
                tag={label}
                {...args}
                smoothing={smoothing}
                xAxis={xAxis}
                sortingMethod={tooltipSorting}
                outlier={ignoreOutliers}
                running={running}
            />
        ),
        [smoothing, xAxis, tooltipSorting, ignoreOutliers, running]
    );

    return (
        <>
            <Preloader url="/scalar/tags" />
            <Title>{t('common:scalar')}</Title>
            <Content aside={aside} loading={loading}>
                {!loading && !runs.length ? (
                    <Error />
                ) : (
                    <ChartPage items={tags} withChart={withChart} loading={loading} />
                )}
            </Content>
        </>
    );
};

Scalar.getInitialProps = () => ({
    namespacesRequired: ['scalar', 'common']
});

export default Scalar;
