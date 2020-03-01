import {useReducer, useEffect, useCallback, useMemo} from 'react';
import useSWR from 'swr';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';
import intersection from 'lodash/intersection';
import {Tag} from '~/types';
import {useRouter} from 'next/router';

type Runs = string[];
type Tags = Record<string, string[]>;

type State = {
    runs: Runs;
    initTags: Tags;
    tags: Tag[];
    filteredTags: Tag[];
};

enum ActionType {
    setRuns,
    initTags,
    setTags,
    setFilteredTags
}

type ActionSetRuns = {
    type: ActionType.setRuns;
    payload: Runs;
};

type ActionInitTags = {
    type: ActionType.initTags;
    payload: Tags;
};

type ActionSetTags = {
    type: ActionType.setTags;
    payload: Tag[];
};

type ActionSetFilteredTags = {
    type: ActionType.setFilteredTags;
    payload: Tag[];
};

type Action = ActionSetRuns | ActionInitTags | ActionSetTags | ActionSetFilteredTags;

const groupTags = (runs: Runs, tags?: Tags): Tag[] =>
    Object.entries(
        groupBy<{label: Tag['label']; run: Tag['runs'][number]}>(
            runs
                // get tags of selected runs
                .filter(run => runs.includes(run))
                // group by runs
                .reduce((prev, run) => {
                    if (tags && tags[run]) {
                        Array.prototype.push.apply(
                            prev,
                            tags[run].map(label => ({label, run}))
                        );
                    }
                    return prev;
                }, []),
            tag => tag.label
        )
    ).map(([label, tags]) => ({label, runs: tags.map(tag => tag.run)}));

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionType.setRuns:
            const runTags = groupTags(action.payload, state.initTags);
            return {
                ...state,
                runs: action.payload,
                tags: runTags,
                filteredTags: runTags
            };
        case ActionType.initTags:
            const newTags = groupTags(state.runs, action.payload);
            return {
                ...state,
                initTags: action.payload,
                tags: newTags,
                filteredTags: newTags
            };
        case ActionType.setTags:
            return {
                ...state,
                tags: action.payload,
                filteredTags: action.payload
            };
        case ActionType.setFilteredTags:
            return {
                ...state,
                filteredTags: action.payload
            };
        default:
            throw new Error();
    }
};

const useTagFilters = (type: string) => {
    const router = useRouter();

    const {data: runs} = useSWR<Runs>('/runs');
    const {data: tags} = useSWR<Tags>(`/${type}/tags`);

    const selectedRuns = useMemo(
        () =>
            runs
                ? router.query.runs
                    ? intersection(
                          uniq(Array.isArray(router.query.runs) ? router.query.runs : router.query.runs.split(',')),
                          runs
                      )
                    : runs
                : [],
        [router, runs]
    );

    const [state, dispatch] = useReducer(
        reducer,
        {
            runs: selectedRuns,
            initTags: {},
            tags: groupTags(selectedRuns, tags)
        },
        initArgs => ({...initArgs, filteredTags: initArgs.tags})
    );

    const onChangeRuns = useCallback((runs: Runs) => dispatch({type: ActionType.setRuns, payload: runs}), [dispatch]);
    const onInitTags = useCallback((tags: Tags) => dispatch({type: ActionType.initTags, payload: tags}), [dispatch]);
    const onFilterTags = useCallback((tags: Tag[]) => dispatch({type: ActionType.setFilteredTags, payload: tags}), [
        dispatch
    ]);

    useEffect(() => onInitTags(tags || {}), [onInitTags, tags]);
    useEffect(() => onChangeRuns(selectedRuns), [onChangeRuns, selectedRuns]);

    return {
        runs,
        tags: state.tags,
        selectedRuns: state.runs,
        selectedTags: state.filteredTags,
        onChangeRuns,
        onFilterTags
    };
};

export default useTagFilters;
