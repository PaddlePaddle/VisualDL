import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';
import {borderColor, ellipsis, em, rem, size} from '~/utils/style';

import Checkbox from '~/components/Checkbox';
import Field from '~/components/Field';
import {Run} from '~/types';
import RunningToggle from '~/components/RunningToggle';
import SearchInput from '~/components/SearchInput';
import styled from 'styled-components';
import uniqBy from 'lodash/uniqBy';
import {useTranslation} from '~/utils/i18n';

const Aside = styled.div`
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    > section {
        margin: ${rem(20)} ${rem(20)} 0;
        flex: 0 0 auto;

        &:not(:last-child) {
            border-bottom: 1px solid ${borderColor};
            padding-bottom: ${rem(20)};
        }

        &.run-section {
            flex: 1 1 auto;
            overflow-x: hidden;
            overflow-y: auto;
            display: flex;
            flex-direction: column;

            .running-toggle {
                flex: 0 0 auto;
                box-shadow: 0 -${rem(5)} ${rem(16)} 0 rgba(0, 0, 0, 0.03);
            }

            .run-select {
                flex: 1 1 auto;
                overflow-x: hidden;
                overflow-y: auto;
                display: flex;
                flex-direction: column;

                > * {
                    flex: 0 0 auto;
                }

                .search-input {
                    margin-bottom: ${rem(15)};
                }

                .run-list {
                    flex: 1 1 auto;
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

    return (
        <Aside>
            {children}
            <section className="run-section">
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
                <RunningToggle className="running-toggle" running={running} onToggle={onToggleRunning} />
            </section>
        </Aside>
    );
};

export default RunAside;
