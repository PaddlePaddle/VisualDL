import numpy as np
import wave
from visualdl import LogWriter

num_samples = 1


def read_audio_data(audio_path):
    CHUNK = 4096
    f = wave.open(audio_path, "rb")
    wavdata = []
    chunk = f.readframes(CHUNK)

    while chunk:
        data = np.fromstring(chunk, dtype='uint8')
        wavdata.extend(data)
        chunk = f.readframes(CHUNK)

    # 8k sample rate, 16bit frame, 1 channel
    shape = [8000, 2, 1]

    return shape, wavdata


def record_audio(vdl_audio_comp):
    sample_num = 0
    record_times = num_samples * 3
    audio_path = "test.wav"
    for i in range(record_times):
        if sample_num % num_samples == 0:
            vdl_audio_comp.start_sampling()
        idx = vdl_audio_comp.is_sample_taken()
        if idx != -1:
            audio_shape, audio_data = read_audio_data(audio_path)
            vdl_audio_comp.set_sample(idx, audio_shape, audio_data)
            sample_num += 1
            if sample_num % num_samples == 0:
                vdl_audio_comp.finish_sampling()
                sample_num = 0


def main():
    log_writter = LogWriter("./vdl_log", sync_cycle=10)
    with log_writter.mode("train") as logger:
        vdl_audio_comp = logger.audio(tag="test", num_samples=num_samples)

    # after record, use visualdl --logdir vdl_log to load the log info,
    # and view the data in webpage
    record_audio(vdl_audio_comp)


if __name__ == "__main__":
    main()
