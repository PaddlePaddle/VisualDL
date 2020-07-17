declare global {
    interface Window {
        __visualdl_instance_id__?: string | string[];
    }

    namespace globalThis {
        /* eslint-disable no-var */
        var __visualdl_instance_id__: string | string[] | undefined;
        var webkitAudioContext: AudioContext | undefined;
        /* eslint-enable no-var */
    }
}

declare namespace NodeJS {
    interface Global {
        __visualdl_instance_id__?: string | string[];
    }
}

export {};
