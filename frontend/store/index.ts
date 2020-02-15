import {getAccessorType, mutationTree, actionTree, getterTree} from 'typed-vuex';

// Import all your submodules
// import * as submodule from '~/store/submodule'

// Keep your existing vanilla Vuex code for state, getters, mutations, actions, plugins, etc.
export const state = () => ({
    locale: '',
    locales: process.env.LOCALES ? process.env.LOCALES.split(',') : ([] as string[])
});
export type RootState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
    setLanguage(state, lang: string): void {
        if (state.locales.includes(lang)) {
            state.locale = lang;
        }
    }
});

export const getters = getterTree(state, {});

export const actions = actionTree(
    {state, getters, mutations},
    {}
);

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
