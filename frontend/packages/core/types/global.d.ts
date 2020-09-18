declare global {
    interface Window {
        webkitAudioContext: AudioContext;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _hmt: any[];
    }
}

export {};
