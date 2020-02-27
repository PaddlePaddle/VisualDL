// TODO: use this instead
// https://github.com/zeit/swr/blob/master/examples/axios-typescript/libs/useRequest.ts
import fetch from 'isomorphic-unfetch';
import {NextPageContext} from 'next';
import {Request} from 'express';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const fetcher = async (url: string, options?: any, baseUrl = ''): Promise<any> => {
    const res = await fetch(baseUrl + process.env.API_URL + url, options);
    return await res.json();
};

export const cycleFetcher = async (urls: string[], options?: any, baseUrl = ''): Promise<any> => {
    return await Promise.all(urls.map(url => fetcher(url, options, baseUrl)));
};

type GetInitialProps<T = any> = (context: NextPageContext, f: typeof fetcher) => T | Promise<T>;

export const withFetcher = (getInitialProps: GetInitialProps) => (context: NextPageContext) => {
    const {req} = context;
    // FIXME
    const baseUrl = req ? `${((req as unknown) as Request).protocol}://${req.headers.host}` : '';
    return getInitialProps(context, (url: string, options: unknown) => fetcher(url, options, baseUrl));
};
