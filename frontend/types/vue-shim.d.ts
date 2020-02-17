import Vue, {ComponentOptions} from 'vue';
import i18next from 'i18next';
import {accessorType} from '~/store';

declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare module 'vue/types/vue' {
    interface Vue {
        $accessor: typeof accessorType;
        $i18n: typeof i18next;
    }
}

declare module 'vue' {
    interface VueConstructor<V extends Vue = Vue> {
        options: ComponentOptions<Vue>;
    }
}
