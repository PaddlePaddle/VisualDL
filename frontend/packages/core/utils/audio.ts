interface AudioPlayerOptions {
    context?: AudioContext;
    volumn?: number;
    onplay?: () => void;
    onstop?: () => void;
}

export class AudioPlayer {
    protected context: AudioContext;
    private gain: GainNode;
    private source: AudioBufferSourceNode | null = null;
    private buffer: AudioBuffer | null = null;
    private decodedSampleRate: number = Number.NaN;
    private contextFromOptions: boolean;

    private startAt = 0;
    private stopAt = 0;
    private offset = 0;

    private toggleVolumn = 100;

    public playing = false;

    public readonly options: Required<AudioPlayerOptions>;

    get current() {
        if (this.playing) {
            return this.context.currentTime - this.startAt + this.offset;
        }
        return this.offset;
    }

    get duration() {
        if (!this.buffer) {
            return Number.NaN;
        }
        return this.buffer.duration;
    }

    get sampleRate() {
        if (!this.buffer) {
            return Number.NaN;
        }
        return this.decodedSampleRate;
    }

    get volumn() {
        return this.gain.gain.value * 100;
    }
    set volumn(value: number) {
        if (value > 100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }
        this.gain.gain.value = value / 100;
    }

    constructor(options?: AudioPlayerOptions) {
        this.options = {
            context: options?.context ?? new AudioContext(),
            volumn: 100,
            onplay: () => void 0,
            onstop: () => void 0,
            ...options
        };
        this.contextFromOptions = !!options?.context;
        this.context = this.options.context;
        this.gain = this.context.createGain();
        this.volumn = this.options.volumn;
    }

    private reset() {
        if (this.buffer) {
            if (this.playing) {
                this.source?.stop(0);
            }
            this.startAt = 0;
            this.stopAt = 0;
            this.offset = 0;
            this.buffer = null;
        }
    }

    static getWavSampleRate(buffer: ArrayBuffer) {
        const intArr = new Int8Array(buffer);
        const sampleRateArr = intArr.slice(24, 28);
        return (
            (sampleRateArr[0] & 0xff) |
            ((sampleRateArr[1] & 0xff) << 8) |
            ((sampleRateArr[2] & 0xff) << 16) |
            ((sampleRateArr[3] & 0xff) << 24)
        );
    }

    static getMp3SampleRate(buffer: ArrayBuffer) {
        let arr = new Uint8Array(buffer);
        if (String.fromCharCode.apply(null, Array.from(arr.slice(0, 3))) === 'ID3') {
            arr = arr.slice(10);
            let i = 0;
            while (arr[i] !== 0x00) {
                const size = arr[i + 4] * 0x100000000 + arr[i + 5] * 0x10000 + arr[i + 6] * 0x100 + arr[i + 7];
                i += 10 + size;
            }
        }
        let j = 0;
        while (arr[j++] !== 0xff) {}
        j--;
        const header = arr.slice(j, j + 4);
        const version = (header[1] & 0b00011000) >> 3;
        const sampleRate = (header[2] & 0b00001100) >> 2;
        if (version === 0b11) {
            if (sampleRate === 0b00) {
                return 44100;
            } else if (sampleRate === 0b01) {
                return 48000;
            } else if (sampleRate === 0b10) {
                return 32000;
            }
        } else if (version === 0b10) {
            if (sampleRate === 0b00) {
                return 22050;
            } else if (sampleRate === 0b01) {
                return 24000;
            } else if (sampleRate === 0b10) {
                return 16000;
            }
        } else if (version === 0b00) {
            if (sampleRate === 0b00) {
                return 11025;
            } else if (sampleRate === 0b01) {
                return 12000;
            } else if (sampleRate === 0b10) {
                return 8000;
            }
        }
        return Number.NaN;
    }

    load(buffer: ArrayBuffer, type?: string) {
        this.reset();
        if (type === 'wav') {
            this.decodedSampleRate = AudioPlayer.getWavSampleRate(buffer);
        } else if (type === 'mpga' || type === 'mp3') {
            this.decodedSampleRate = AudioPlayer.getMp3SampleRate(buffer);
        } else {
            this.decodedSampleRate = Number.NaN;
        }
        // safari doesn't return promise here
        return new Promise<void>((resolve, reject) => {
            this.context.decodeAudioData(
                buffer,
                audioBuffer => {
                    this.buffer = audioBuffer;
                    resolve();
                },
                reject
            );
        });
    }

    play() {
        if (!this.buffer) {
            throw new Error('No audio loaded');
        }
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gain).connect(this.context.destination);
        this.source.addEventListener('ended', () => {
            this.stopAt = this.context.currentTime;
            this.offset += this.stopAt - this.startAt;
            this.playing = false;
            this.options.onstop();
            this.source = null;
        });
        if (this.offset >= this.duration) {
            this.offset = 0;
        }
        this.source.start(0, this.offset);
        this.startAt = this.context.currentTime;
        this.playing = true;
        this.options.onplay();
    }

    pause() {
        if (!this.buffer) {
            throw new Error('No audio loaded');
        }
        this.source?.stop(0);
    }

    toggle() {
        this.playing ? this.pause() : this.play();
    }

    stop() {
        this.pause();
        this.startAt = 0;
        this.stopAt = 0;
        this.offset = 0;
    }

    seek(offset: number) {
        if (offset != null && (offset < 0 || offset > this.duration)) {
            throw new Error('Invalid offset');
        }
        this.offset = offset;
    }

    toggleMute() {
        if (this.volumn === 0) {
            this.volumn = this.toggleVolumn || 100;
        } else {
            this.toggleVolumn = this.volumn;
            this.volumn = 0;
        }
    }

    dispose() {
        this.reset();
        if (!this.contextFromOptions) {
            this.context.close();
        }
        this.source = null;
        this.buffer = null;
    }
}
