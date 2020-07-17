interface AudioPlayerOptions {
    volumn: number;
    onplay?: () => void;
    onstop?: () => void;
}

export class AudioPlayer {
    protected context: AudioContext;
    private gain: GainNode;
    private source: AudioBufferSourceNode | null = null;
    private buffer: AudioBuffer | null = null;
    private decodedSampleRate: number = Number.NaN;

    private startAt = 0;
    private stopAt = 0;
    private offset = 0;

    private toggleVolumn = 100;

    public playing = false;

    public readonly options: AudioPlayerOptions;

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
        return Number.isNaN(this.decodedSampleRate) ? this.buffer.sampleRate : this.decodedSampleRate;
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

    constructor(options?: Partial<AudioPlayerOptions>) {
        this.options = {
            volumn: 100,
            ...options
        };
        this.context = new AudioContext();
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

    load(buffer: ArrayBuffer, type?: string) {
        this.reset();
        if (type === 'audio/wave') {
            this.decodedSampleRate = AudioPlayer.getWavSampleRate(buffer);
        } else {
            this.decodedSampleRate = Number.NaN;
        }

        return this.context.decodeAudioData(buffer, audioBuffer => {
            this.buffer = audioBuffer;
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
            this.options.onstop?.();
            this.source = null;
        });
        if (this.offset >= this.duration) {
            this.offset = 0;
        }
        this.source.start(0, this.offset);
        this.startAt = this.context.currentTime;
        this.playing = true;
        this.options.onplay?.();
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
        this.context.close();
        this.source = null;
        this.buffer = null;
    }
}
