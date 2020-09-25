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

import type {Run, Tag, TagWithSingleRun, TagsData} from '~/types';
import {actions, selectors} from '~/store';
import {color, colorAlt} from '~/utils/chart';
import {useCallback, useEffect, useMemo, useReducer} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {Page} from '~/store/runs/types';
import {cache} from 'swr';
import groupBy from 'lodash/groupBy';
import intersection from 'lodash/intersection';
import intersectionBy from 'lodash/intersectionBy';
import uniq from 'lodash/uniq';
import useQuery from '~/hooks/useQuery';
import {useRunningRequest} from '~/hooks/useRequest';

type Tags = Record<string, string[]>;

type State = {
    initRuns: string[];
    globalRuns: string[];
    runs: Run[];
    selectedRuns: Run[];
    initTags: Tags;
    tags: Tag[];
    selectedTags: Tag[];
};

enum ActionType {
    initRuns,
    setRuns,
    setSelectedRuns,
    initTags,
    setTags,
    setSelectedTags
}

type ActionInitRuns = {
    type: ActionType.initRuns;
    payload: string[];
};

type ActionSetRuns = {
    type: ActionType.setRuns | ActionType.setSelectedRuns;
    payload: Run[];
};

type ActionInitTags = {
    type: ActionType.initTags;
    payload: Tags;
};

type ActionSetTags = {
    type: ActionType.setTags | ActionType.setSelectedTags;
    payload: Tag[];
};

type Action = ActionInitRuns | ActionSetRuns | ActionInitTags | ActionSetTags;

type SingleTag = {label: Tag['label']; run: Tag['runs'][number]};

const groupTags = (runs: Run[], tags?: Tags): Tag[] =>
    Object.entries(
        groupBy<SingleTag>(
            runs
                // get tags of selected runs
                .filter(run => !!runs.find(r => r.label === run.label))
                // group by runs
                .reduce<SingleTag[]>((prev, run) => {
                    if (tags && tags[run.label]) {
                        Array.prototype.push.apply(
                            prev,
                            tags[run.label].map(label => ({label, run}))
                        );
                    }
                    return prev;
                }, []),
            tag => tag.label
        )
    ).map(([label, tags]) => ({label, runs: tags.map(tag => tag.run)}));

const attachRunColor = (runs: string[]): Run[] =>
    runs?.map((run, index) => {
        const i = index % color.length;
        return {
            label: run,
            colors: [color[i], colorAlt[i]]
        };
    });

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionType.initRuns: {
            const initRuns = action.payload;
            const validGlobalRuns = initRuns.length ? intersection(initRuns, state.globalRuns) : state.globalRuns;
            const globalRuns = validGlobalRuns.length ? validGlobalRuns : initRuns;
            const runs = attachRunColor(initRuns);
            const selectedRuns = runs.filter(run => globalRuns.includes(run.label));
            const tags = groupTags(selectedRuns, state.initTags);
            return {
                ...state,
                initRuns,
                globalRuns,
                runs,
                selectedRuns,
                tags,
                selectedTags: tags
            };
        }
        case ActionType.setRuns: {
            const runs = action.payload;
            const selectedRuns = intersectionBy(state.selectedRuns, runs, r => r.label);
            const tags = groupTags(selectedRuns, state.initTags);
            return {
                ...state,
                runs,
                selectedRuns,
                tags,
                selectedTags: tags
            };
        }
        case ActionType.setSelectedRuns: {
            const selectedRuns = action.payload;
            const globalRuns = selectedRuns.map(run => run.label);
            const tags = groupTags(selectedRuns, state.initTags);
            return {
                ...state,
                globalRuns,
                selectedRuns,
                tags,
                selectedTags: tags
            };
        }
        case ActionType.initTags: {
            const initTags = action.payload;
            const tags = groupTags(state.selectedRuns, initTags);
            return {
                ...state,
                initTags,
                tags,
                selectedTags: tags
            };
        }
        case ActionType.setTags: {
            const tags = action.payload;
            return {
                ...state,
                tags,
                selectedTags: tags
            };
        }
        case ActionType.setSelectedTags: {
            const selectedTags = action.payload;
            return {
                ...state,
                selectedTags
            };
        }
        default:
            throw new Error();
    }
};

// TODO: refactor to improve performance
const useTagFilter = (type: Page, running: boolean) => {
    const query = useQuery();

    const {data, loading, error} = useRunningRequest<TagsData>(`/${type}/tags`, running);

    // clear cache in order to fully reload data when switching page
    useEffect(() => () => cache.delete(`/${type}/tags`), [type]);

    const storeDispatch = useDispatch();
    const selector = useMemo(() => selectors.runs.getRunsByPage(type), [type]);
    const storedRuns = useSelector(selector);

    const runs: string[] = useMemo(() => data?.runs ?? [], [data]);
    const tags: Tags = useMemo(
        () =>
            data
                ? runs.reduce<Tags>((m, run, i) => {
                      if (m[run]) {
                          m[run] = [...m[run], ...(data.tags?.[i] ?? [])];
                      } else {
                          m[run] = data.tags[i] ?? [];
                      }
                      return m;
                  }, {})
                : {},
        [runs, data]
    );

    const [state, dispatch] = useReducer(reducer, {
        initRuns: [],
        globalRuns: storedRuns,
        runs: [],
        selectedRuns: [],
        initTags: {},
        tags: [],
        selectedTags: []
    });

    const queryRuns = useMemo(
        () => (query.runs ? uniq(Array.isArray(query.runs) ? query.runs : query.runs.split(',')) : []),
        [query]
    );

    const onChangeRuns = useCallback((runs: Run[]) => dispatch({type: ActionType.setSelectedRuns, payload: runs}), []);
    const onChangeTags = useCallback((tags: Tag[]) => dispatch({type: ActionType.setSelectedTags, payload: tags}), []);

    useEffect(() => dispatch({type: ActionType.initRuns, payload: runs || []}), [runs]);
    useEffect(() => dispatch({type: ActionType.initTags, payload: tags || {}}), [tags]);

    useEffect(() => {
        if (queryRuns.length) {
            const runs = state.runs.filter(run => queryRuns.includes(run.label));
            dispatch({
                type: ActionType.setSelectedRuns,
                payload: runs.length ? runs : state.runs
            });
        }
    }, [queryRuns, state.runs]);
    useEffect(() => {
        storeDispatch(actions.runs.setSelectedRuns(type, state.globalRuns));
    }, [storeDispatch, state.globalRuns, type]);

    const tagsWithSingleRun = useMemo(
        () =>
            state.tags.reduce<TagWithSingleRun[]>((prev, {runs, ...item}) => {
                Array.prototype.push.apply(
                    prev,
                    runs.map(run => ({...item, run, id: `${item.label}-${run.label}`}))
                );
                return prev;
            }, []),
        [state.tags]
    );

    const runsInTags = useMemo(() => state.selectedRuns.filter(run => !!tags?.[run.label]?.length), [
        state.selectedRuns,
        tags
    ]);

    return {
        ...state,
        tagsWithSingleRun,
        runsInTags,
        onChangeRuns,
        onChangeTags,
        loading,
        error
    };
};

export default useTagFilter;
