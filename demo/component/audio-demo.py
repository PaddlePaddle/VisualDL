# coding=utf-8
import numpy as np
import wave
from visualdl import LogWriter


def read_audio_data(audio_path):
    """
      读取音频数据
    """
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


# 创建一个 LogWriter 对象
log_writter = LogWriter("./log", sync_cycle=10)

# 创建audio组件，模式为train
ns = 2
with log_writter.mode("train") as logger:
    input_audio = logger.audio(tag="test", num_samples=ns)

# 一般要设定一个变量audio_sample_num，用来记录当前已采样了几段audio数据
audio_sample_num = 0
for step in range(9):
    # 设置start_sampling() 的条件，满足条件时，开始采样
    if audio_sample_num == 0:
        input_audio.start_sampling()

    # 获取 idx
    idx = input_audio.is_sample_taken()
    # 如果 idx != -1，采样，否则跳过
    if idx != -1:
        # 读取数据，音频文件的格式可以为.wav .mp3等
        audio_path = "test.wav"
        audio_shape, audio_data = read_audio_data(audio_path)

        # 使用 set_sample()函数添加数据
        input_audio.set_sample(idx, audio_shape, audio_data)
        audio_sample_num += 1

        # 如果完成了当前轮的采样，则调用finish_sample()
        if audio_sample_num % ns == 0:
            input_audio.finish_sampling()
            audio_sample_num = 0
