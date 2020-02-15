// we have to do this now...
// https://github.com/nuxt/typescript/issues/44#issuecomment-582861879
declare module 'nuxt' {
    const Nuxt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const Builder: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    export {Nuxt, Builder};
}
