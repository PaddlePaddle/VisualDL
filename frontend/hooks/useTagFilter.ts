import {useReducer} from 'react';
import useSWR from 'swr';
import groupBy from 'lodash/groupBy';
import {Tag} from '~/types';

type Runs = string[];
type Tags = Record<string, string[]>;

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

type State = {
    runs: Runs;
    tags: Tag[];
    filteredTags: Tag[];
};

enum ActionType {
    setRuns,
    setTags,
    setFilteredTags
}

type ActionSetRuns = {
    type: ActionType.setRuns;
    payload: Runs;
};

type ActionSetTags = {
    type: ActionType.setTags;
    payload: Tag[];
};

type ActionSetFilteredTags = {
    type: ActionType.setFilteredTags;
    payload: Tag[];
};

type Action = ActionSetRuns | ActionSetTags | ActionSetFilteredTags;

type InitData = {
    runs: Runs;
    tags: Tags;
};

const useTagFilters = (selectedRuns: string[], initData: InitData) => {
    const {data: runs} = useSWR('/runs', {initialData: initData.runs});
    const {data: tags} = useSWR('/scalars/tags', {initialData: initData.tags});

    const reducer = (state: State, action: Action): State => {
        switch (action.type) {
            case ActionType.setRuns:
                const newTags = groupTags(action.payload, tags);
                return {
                    ...state,
                    runs: action.payload,
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
                throw Error();
        }
    };

    const [state, dispatch] = useReducer(
        reducer,
        {
            runs: selectedRuns,
            tags: groupTags(selectedRuns, tags)
        },
        initArgs => ({...initArgs, filteredTags: initArgs.tags})
    );

    const onChangeRuns = (runs: Runs) => dispatch({type: ActionType.setRuns, payload: runs});
    const onFilterTags = (tags: Tag[]) => dispatch({type: ActionType.setFilteredTags, payload: tags});

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
