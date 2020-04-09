export const enabled = () => process.env.NODE_ENV !== 'development' || !!process.env.WITH_WASM;
