import Vue, {ComponentOptions} from 'vue';

declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare module 'vue' {
    interface VueConstructor<V extends Vue = Vue> {
        options: ComponentOptions<Vue>;
    }
}
