// TODO: use this instead
// https://github.com/zeit/swr/blob/master/examples/axios-typescript/libs/useRequest.ts

import fetch from 'isomorphic-unfetch';

const API_TOKEN_HEADER = 'X-VisualDL-Instance-ID';

function addApiToken(options?: RequestInit): RequestInit | undefined {
    if (!process.env.API_TOKEN_KEY || !globalThis.__visualdl_instance_id__) {
        return options;
    }
    const {headers, ...rest} = options || {};
    return {
        ...rest,
        headers: {
            ...(headers || {}),
            [API_TOKEN_HEADER]: globalThis.__visualdl_instance_id__
        }
    };
}

export function setApiToken(id?: string | string[] | null) {
    const instanceId = Array.isArray(id) ? id[0] : id;
    globalThis.__visualdl_instance_id__ = instanceId || '';
}

export function getApiToken() {
    return globalThis.__visualdl_instance_id__ || '';
}

export const fetcher = async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(process.env.API_URL + url, addApiToken(options));
    const response = await res.json();

    return response && 'data' in response ? response.data : response;
};

export type BlobResponse = {
    data: Blob;
    type: string | null;
    filename: string | null;
};

export const blobFetcher = async (url: string, options?: RequestInit): Promise<BlobResponse> => {
    const res = await fetch(process.env.API_URL + url, addApiToken(options));
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

export const cycleFetcher = async <T = unknown>(urls: string[], options?: RequestInit): Promise<T[]> => {
    return await Promise.all(urls.map(url => fetcher<T>(url, options)));
};
