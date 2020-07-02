declare global {
    interface Window {
        __visualdl_instance_id__?: string | string[];
        __vdl_api_token_key__?: string;
    }

    namespace globalThis {
        // eslint-disable-next-line no-var
        var __visualdl_instance_id__: string | string[] | undefined;
        // eslint-disable-next-line no-var
        var __vdl_api_token_key__: string | undefined;
    }
}

declare namespace NodeJS {
    interface Global {
        __visualdl_instance_id__?: string | string[];
        __vdl_api_token_key__?: string;
    }
}

export {};
