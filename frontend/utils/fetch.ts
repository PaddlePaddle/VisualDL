import fetch from 'isomorphic-unfetch';
import {NextPageContext} from 'next';
import {Request} from 'express';

const fetcher = async (url: string, options?: any, baseUrl = ''): Promise<any> => {
    const res = await fetch(baseUrl + process.env.API_URL + url, options);
    return await res.json();
};

type GetInitialProps = (context: NextPageContext, f: typeof fetcher) => any;

export const withFetcher = (getInitialProps: GetInitialProps) => (context: NextPageContext) => {
    const {req} = context;
    // FIXME
    const baseUrl = req ? `${((req as unknown) as Request).protocol}://${req.headers.host}` : '';
    return getInitialProps(context, (url: string, options: unknown) => fetcher(url, options, baseUrl));
};

export default fetcher;
