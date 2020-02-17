import {Module} from '@nuxt/types';
import i18next from 'i18next';
import {accessorType} from '~/store';
import {GetThis} from './utils';

declare module '@nuxt/types' {
    interface NuxtAppOptions {
        $i18n: typeof i18next;
        $accessor: typeof accessorType;
    }

    export type ModuleThis = GetThis<Module>;
}
