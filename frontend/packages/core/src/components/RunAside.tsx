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

import Aside, {AsideSection} from '~/components/Aside';
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
import {ellipsis, em, rem, size} from '~/utils/style';

import Checkbox from '~/components/Checkbox';
import Field from '~/components/Field';
import type {Run} from '~/types';
import RunningToggle from '~/components/RunningToggle';
import SearchInput from '~/components/SearchInput';
import styled from 'styled-components';
import uniqBy from 'lodash/uniqBy';
import {useTranslation} from 'react-i18next';

const StyledAside = styled(Aside)`
    ${AsideSection}.run-section {
        flex: auto;
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        margin-bottom: 0;

        .run-select {
            flex: auto;
            overflow-x: hidden;
            overflow-y: auto;
            display: flex;
            flex-direction: column;

            > * {
                flex: none;
            }

            .search-input {
                margin-bottom: ${rem(15)};
            }

            .run-list {
                flex: auto;
                overflow-x: hidden;
                overflow-y: auto;

                margin-top: ${rem(5)};

                > div {
                    margin-top: ${rem(11)};

                    > * {
                        width: 100%;
                    }

                    .run-item {
                        display: flex;
                        align-items: center;
                        ${ellipsis()}

                        > i {
                            display: inline-block;
                            ${size(em(12), em(12))};
                            border-radius: ${em(6)};
                            margin-right: ${em(8)};
                        }
                    }
                }
            }
        }
    }
`;

type RunAsideProps = {
    runs?: Run[];
    selectedRuns?: Run[];
    onChangeRuns?: (runs: Run[]) => unknown;
    running?: boolean;
    onToggleRunning?: (running: boolean) => unknown;
};

const RunAside: FunctionComponent<RunAsideProps> = ({
    runs,
    selectedRuns,
    onChangeRuns,
    running,
    onToggleRunning,
    children
}) => {
    const {t} = useTranslation('common');

    const [search, setSearch] = useState('');

    const selectAll = useMemo(() => runs?.length === selectedRuns?.length, [runs, selectedRuns]);
    const toggleSelectAll = useCallback(
        (toggle: boolean) => {
            onChangeRuns?.(toggle ? runs ?? [] : []);
        },
        [onChangeRuns, runs]
    );

    const filteredRuns = useMemo(() => (search ? runs?.filter(run => run.label.indexOf(search) >= 0) : runs) ?? [], [
        runs,
        search
    ]);

    const setSelectedRuns = useCallback(
        (run: Run, toggle) => {
            let selected = selectedRuns ?? [];
            if (toggle) {
                selected = uniqBy([...selected, run], r => r.label);
            } else {
                selected = selected.filter(r => r.label !== run.label);
            }
            onChangeRuns?.(selected);
        },
        [onChangeRuns, selectedRuns]
    );

    const bottom = useMemo(
        () => <RunningToggle className="running-toggle" running={running} onToggle={onToggleRunning} />,
        [running, onToggleRunning]
    );

    return (
        <StyledAside bottom={bottom}>
            {children}
            <AsideSection className="run-section">
                <Field className="run-select" label={t('common:select-runs')}>
                    <SearchInput
                        className="search-input"
                        value={search}
                        onChange={setSearch}
                        placeholder={t('common:search-runs')}
                        rounded
                    />
                    <Checkbox value={selectAll} onChange={toggleSelectAll}>
                        {t('common:select-all')}
                    </Checkbox>
                    <div className="run-list">
                        {filteredRuns.map((run, index) => (
                            <div key={index}>
                                <Checkbox
                                    value={selectedRuns?.map(r => r.label)?.includes(run.label)}
                                    title={run.label}
                                    onChange={value => setSelectedRuns(run, value)}
                                >
                                    <span className="run-item">
                                        <i style={{backgroundColor: run.colors[0]}}></i>
                                        {run.label}
                                    </span>
                                </Checkbox>
                            </div>
                        ))}
                    </div>
                </Field>
            </AsideSection>
        </StyledAside>
    );
};

export default RunAside;
