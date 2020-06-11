// TODO: use this instead
// https://github.com/zeit/swr/blob/master/examples/axios-typescript/libs/useRequest.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

import fetch from 'isomorphic-unfetch';

export const fetcher = async <T = any>(url: string, options?: any): Promise<T> => {
    const res = await fetch(process.env.API_URL + url, options);
    const response = await res.json();

    return response && 'data' in response ? response.data : response;
};

export type BlobResponse = {
    data: Blob;
    type: string | null;
    filename: string | null;
};

export const blobFetcher = async (url: string, options?: any): Promise<BlobResponse> => {
    const res = await fetch(process.env.API_URL + url, options);
    const data = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    let filename: string | null = null;
    if (disposition && disposition.indexOf('attachment') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }
    return {data, type: res.headers.get('Content-Type'), filename};
};

export const cycleFetcher = async <T = any>(urls: string[], options?: any): Promise<T[]> => {
    return await Promise.all(urls.map(url => fetcher<T>(url, options)));
};
