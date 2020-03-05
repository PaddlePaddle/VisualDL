export const removeSubpath = (url: string | undefined, subpath: string) =>
    url?.replace(subpath, '').replace(/(https?:\/\/)|(\/)+/g, '$1$2') || '';
