declare module '@nuxt/utils' {
    import {NuxtRouteConfig} from '@nuxt/types/config/router';

    export function sortRoutes(routes: NuxtRouteConfig[]): NuxtRouteConfig[];
}
