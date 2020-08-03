# Copyright (c) 2020 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =======================================================================
# coding=utf-8
from visualdl import LogWriter
import numpy as np
import wave


def read_audio_data(audio_path):
    """
    Get audio data.
    """
    CHUNK = 4096
    f = wave.open(audio_path, "rb")
    rate = f.getframerate()
    width = f.getsampwidth()
    channel = f.getnchannels()
    wavdata = []
    chunk = f.readframes(CHUNK)

    while chunk:
        data = np.frombuffer(chunk, dtype='uint8')
        wavdata.extend(data)
        chunk = f.readframes(CHUNK)
    shape = [rate, width, channel]
    return shape, wavdata


if __name__ == '__main__':
    with LogWriter(logdir="vdl_audio_0713") as writer:
        audio_shape, audio_data = read_audio_data("./test.wav")
        audio_data = np.array(audio_data)
        writer.add_audio(tag="audio_tag",
                         audio_array=audio_data,
                         step=0,
                         sample_rate=audio_shape[0])
