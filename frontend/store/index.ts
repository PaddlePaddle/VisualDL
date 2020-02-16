import {getAccessorType, mutationTree, actionTree, getterTree} from 'typed-vuex';
import i18next from 'i18next';
import axios from 'axios';

// Import all your submodules
// import * as submodule from '~/store/submodule'

// Keep your existing vanilla Vuex code for state, getters, mutations, actions, plugins, etc.
export const state = () => ({
    locale: '',
    locales: process.env.LOCALES ? process.env.LOCALES.split(',') : ([] as string[])
});
export type RootState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
    SET_LANG(state, lang: string): void {
        state.locale = lang;
    }
});

export const getters = getterTree(state, {});

export const actions = actionTree(
    {state, getters, mutations},
    {
        async changeLanguage({commit, state}, lang: string): Promise<void> {
            if (state.locale === lang) {
                return;
            }
            if (state.locales.includes(lang)) {
                commit('SET_LANG', lang);
                await i18next.changeLanguage(lang);
                axios.defaults.headers.common['Accept-Language'] = lang;
                // TODO: set html lang attribute on ssr
                if (process.client) {
                    document.querySelector('html')?.setAttribute('lang', lang);
                }
            }
        }
    }
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
