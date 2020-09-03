declare global {
    interface Window {
        __visualdl_instance_id__?: string | string[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _hmt: any[];
    }

    namespace globalThis {
        /* eslint-disable no-var */
        var __visualdl_instance_id__: string | string[] | undefined;
        var webkitAudioContext: AudioContext | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var _hmt: any[];
        /* eslint-enable no-var */
    }
}

export {};
