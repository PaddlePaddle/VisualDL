// TODO: use this instead
// https://github.com/zeit/swr/blob/master/examples/axios-typescript/libs/useRequest.ts
import fetch from 'isomorphic-unfetch';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetcher = async (url: string, options?: any, baseUrl = ''): Promise<any> => {
    const res = await fetch(baseUrl + process.env.API_URL + url, options);
    const response = await res.json();

    return response && 'data' in response ? response.data : response;
};

export const cycleFetcher = async (urls: string[], options?: any, baseUrl = ''): Promise<any> => {
    return await Promise.all(urls.map(url => fetcher(url, options, baseUrl)));
};
