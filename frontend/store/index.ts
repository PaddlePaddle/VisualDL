import {GetterTree, ActionTree, MutationTree} from 'vuex';
import {getAccessorType} from 'typed-vuex';

// Import all your submodules
// import * as submodule from '~/store/submodule'

// Keep your existing vanilla Vuex code for state, getters, mutations, actions, plugins, etc.
export const state = (): object => ({});
export type RootState = ReturnType<typeof state>;

export const actions: ActionTree<RootState, RootState> = {};

export const mutations: MutationTree<RootState> = {};

export const getters: GetterTree<RootState, RootState> = {};

// This compiles to nothing and only serves to return the correct type of the accessor
export const accessorType = getAccessorType({
    state,
    getters,
    mutations,
    actions,
    modules: {
        // The key (submodule) needs to match the Nuxt namespace (e.g. ~/store/submodule.ts)
        // submodule
    }
});
