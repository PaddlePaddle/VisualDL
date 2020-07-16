import {Run, Tag, TagWithSingleRun} from '~/types';
import {color, colorAlt} from '~/utils/chart';
import {useCallback, useEffect, useMemo, useReducer} from 'react';

import groupBy from 'lodash/groupBy';
import intersectionBy from 'lodash/intersectionBy';
import uniq from 'lodash/uniq';
import {useRouter} from 'next/router';
import {useRunningRequest} from '~/hooks/useRequest';

type Tags = Record<string, string[]>;

type State = {
    initRuns: string[];
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
        case ActionType.initRuns:
            const initRuns = action.payload;
            const initRunsRuns = attachRunColor(initRuns);
            const initRunsSelectedRuns = state.selectedRuns.filter(run => initRuns.includes(run.label));
            const initRunsTags = groupTags(initRunsSelectedRuns, state.initTags);
            return {
                ...state,
                initRuns,
                runs: initRunsRuns,
                selectedRuns: initRunsSelectedRuns,
                tags: initRunsTags,
                selectedTags: initRunsTags
            };
        case ActionType.setRuns:
            const setRunsSelectedRuns = intersectionBy(state.selectedRuns, action.payload, r => r.label);
            const setRunsTags = groupTags(setRunsSelectedRuns, state.initTags);
            return {
                ...state,
                runs: action.payload,
                selectedRuns: setRunsSelectedRuns,
                tags: setRunsTags,
                selectedTags: setRunsTags
            };
        case ActionType.setSelectedRuns:
            const setSelectedRunsTags = groupTags(action.payload, state.initTags);
            return {
                ...state,
                selectedRuns: action.payload,
                tags: setSelectedRunsTags,
                selectedTags: setSelectedRunsTags
            };
        case ActionType.initTags:
            const initTagsTags = groupTags(state.selectedRuns, action.payload);
            return {
                ...state,
                initTags: action.payload,
                tags: initTagsTags,
                selectedTags: initTagsTags
            };
        case ActionType.setTags:
            return {
                ...state,
                tags: action.payload,
                selectedTags: action.payload
            };
        case ActionType.setSelectedTags:
            return {
                ...state,
                selectedTags: action.payload
            };
        default:
            throw new Error();
    }
};

const useTagFilter = (type: string, running: boolean) => {
    const router = useRouter();

    const {data: runs, loading: loadingRuns} = useRunningRequest<string[]>('/runs', running);
    const {data: tags, loading: loadingTags} = useRunningRequest<Tags>(`/${type}/tags`, running);

    const [state, dispatch] = useReducer(reducer, {
        initRuns: [],
        runs: [],
        selectedRuns: [],
        initTags: {},
        tags: [],
        selectedTags: []
    });

    const queryRuns = useMemo(
        () =>
            router.query.runs
                ? uniq(Array.isArray(router.query.runs) ? router.query.runs : router.query.runs.split(','))
                : [],
        [router]
    );

    const runsFromQuery = useMemo(
        () => (queryRuns.length ? state.runs.filter(run => queryRuns.includes(run.label)) : state.runs),
        [state.runs, queryRuns]
    );

    const onChangeRuns = useCallback((runs: Run[]) => dispatch({type: ActionType.setSelectedRuns, payload: runs}), []);
    const onChangeTags = useCallback((tags: Tag[]) => dispatch({type: ActionType.setSelectedTags, payload: tags}), []);

    useEffect(() => dispatch({type: ActionType.initRuns, payload: runs || []}), [runs]);
    useEffect(() => dispatch({type: ActionType.setSelectedRuns, payload: runsFromQuery}), [runsFromQuery]);
    useEffect(() => dispatch({type: ActionType.initTags, payload: tags || {}}), [tags]);

    return {
        ...state,
        onChangeRuns,
        onChangeTags,
        loadingRuns,
        loadingTags
    };
};

export default useTagFilter;

export function ungroup(tags: Tag[]) {
    return tags.reduce<TagWithSingleRun[]>((prev, {runs, ...item}) => {
        Array.prototype.push.apply(
            prev,
            runs.map(run => ({...item, run, id: `${item.label}-${run.label}`}))
        );
        return prev;
    }, []);
}
