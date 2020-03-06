// TODO: use this instead
// https://github.com/zeit/swr/blob/master/examples/axios-typescript/libs/useRequest.ts
import fetch from 'isomorphic-unfetch';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const fetcher = async <T = any>(url: string, options?: any): Promise<T> => {
    const res = await fetch(process.env.API_URL + url, options);
    const response = await res.json();

    return response && 'data' in response ? response.data : response;
};

export const blobFetcher = async (url: string, options?: any): Promise<Blob> => {
    const res = await fetch(process.env.API_URL + url, options);
    return await res.blob();
};

export const cycleFetcher = async <T = any>(urls: string[], options?: any): Promise<T[]> => {
    return await Promise.all(urls.map(url => fetcher<T>(url, options)));
};
