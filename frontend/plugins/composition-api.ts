/**
 * composition api plugin
 * @file composition-api.ts
 * @author PeterPan
 */

import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';

export default (): void => {
    Vue.use(VueCompositionApi);
};
