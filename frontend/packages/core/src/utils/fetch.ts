import queryString from 'query-string';

const API_TOKEN_KEY: string = import.meta.env.SNOWPACK_PUBLIC_API_TOKEN_KEY;
const API_URL: string = import.meta.env.SNOWPACK_PUBLIC_API_URL || '/api';

const API_TOKEN_HEADER = 'X-VisualDL-Instance-ID';

const instanceId = API_TOKEN_KEY ? queryString.parse(window.location.search)[API_TOKEN_KEY] : '';

export function getApiToken(): string | string[] | null {
    return instanceId ?? null;
}

function addApiToken(options?: RequestInit): RequestInit | undefined {
    const id = getApiToken();
    if (!API_TOKEN_KEY || !id) {
        return options;
    }
    const {headers, ...rest} = options || {};
    const newHeaders = new Headers(headers);
    if (Array.isArray(id)) {
        id.forEach(value => newHeaders.append(API_TOKEN_HEADER, value));
    } else {
        newHeaders.append(API_TOKEN_HEADER, id);
    }
    return {
        ...rest,
        headers: newHeaders
    };
}

export const fetcher = async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(API_URL + url, addApiToken(options));
    const response = await res.json();

    return response && 'data' in response ? response.data : response;
};

export type BlobResponse = {
    data: Blob;
    type: string | null;
    filename: string | null;
};

export const blobFetcher = async (url: string, options?: RequestInit): Promise<BlobResponse> => {
    const res = await fetch(API_URL + url, addApiToken(options));
    const data = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    // support safari
    if (!data.arrayBuffer) {
        data.arrayBuffer = async () =>
            new Promise<ArrayBuffer>((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.addEventListener('load', e =>
                    e.target ? resolve(e.target.result as ArrayBuffer) : reject()
                );
                fileReader.readAsArrayBuffer(data);
            });
    }
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
