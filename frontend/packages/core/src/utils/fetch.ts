import type {TFunction} from 'i18next';
import i18next from 'i18next';
import queryString from 'query-string';

const API_TOKEN_KEY: string = import.meta.env.SNOWPACK_PUBLIC_API_TOKEN_KEY;
const API_URL: string = import.meta.env.SNOWPACK_PUBLIC_API_URL;

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

interface SuccessData<D> {
    status: 0;
    data: D;
}

interface ErrorData {
    status: number;
    msg?: string;
}

type Data<D> = SuccessData<D> | ErrorData;

export type BlobResponse = {
    data: Blob;
    type: string | null;
    filename: string | null;
};

function getT(): Promise<TFunction> {
    return new Promise(resolve => {
        // Bug of i18next
        i18next.changeLanguage((undefined as unknown) as string).then(t => resolve(t));
    });
}

function logErrorAndReturnT(e: unknown) {
    if (import.meta.env.MODE === 'development') {
        console.error(e); // eslint-disable-line no-console
    }
    return getT();
}

export function fetcher(url: string, options?: RequestInit): Promise<BlobResponse>;
export function fetcher<T = unknown>(url: string, options?: RequestInit): Promise<T>;
export async function fetcher<T = unknown>(url: string, options?: RequestInit): Promise<BlobResponse | T> {
    let res: Response;
    try {
        res = await fetch(API_URL + url, addApiToken(options));
    } catch (e) {
        const t = await logErrorAndReturnT(e);
        throw new Error(t('errors:network-error'));
    }

    if (!res.ok) {
        const t = await logErrorAndReturnT(res);
        throw new Error(t([`errors:response-error.${res.status}`, 'errors:response-error.unknown']));
    }

    let response: Data<T> | T;
    if (res.headers.get('content-type')?.includes('application/json')) {
        try {
            response = await res.json();
        } catch (e) {
            const t = await logErrorAndReturnT(e);
            throw new Error(t('errors:parse-error'));
        }
        if (response && 'status' in response) {
            if (response.status !== 0) {
                const t = await logErrorAndReturnT(response);
                throw new Error((response as ErrorData).msg || t('errors:error'));
            } else {
                return (response as SuccessData<T>).data;
            }
        }
        return response;
    } else {
        let data: Blob;
        try {
            data = await res.blob();
        } catch (e) {
            const t = await logErrorAndReturnT(e);
            throw new Error(t('errors:parse-error'));
        }
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
    }
}

export const cycleFetcher = async <T = unknown>(urls: string[], options?: RequestInit): Promise<T[]> => {
    return await Promise.all(urls.map(url => fetcher<T>(url, options)));
};
