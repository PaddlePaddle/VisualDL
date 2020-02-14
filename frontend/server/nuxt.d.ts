// we have to do this now...
// https://github.com/nuxt/typescript/issues/44#issuecomment-582861879
declare module 'nuxt' {
    const Nuxt: any;
    const Builder: any;
    export {Nuxt, Builder};
}
