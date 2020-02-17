import i18next from 'i18next';

declare module 'vuex/types/index' {
    interface Store<S> {
        $i18n: typeof i18next;
    }
}
