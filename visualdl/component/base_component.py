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
from visualdl.proto.record_pb2 import Record
import numpy as np
import cv2
from PIL import Image


def scalar(tag, value, step, walltime=None):
    """Package data to one scalar.

    Args:
        tag (string): Data identifier
        value (float): Value of scalar
        step (int): Step of scalar
        walltime (int): Wall time of scalar

    Return:
        Package with format of record_pb2.Record
    """
    value = float(value)
    return Record(values=[
        Record.Value(id=step, tag=tag, timestamp=walltime, value=value)
    ])


def imgarray2bytes(np_array):
    """Convert image ndarray to bytes.

    Args:
        np_array (numpy.ndarray): Array to converte.

    Returns:
        Binary bytes of np_array.
    """
    np_array = cv2.cvtColor(np_array, cv2.COLOR_BGR2RGB)
    ret, buf = cv2.imencode(".png", np_array)

    img_bin = Image.fromarray(np.uint8(buf)).tobytes("raw")
    return img_bin


def image(tag, image_array, step, walltime=None):
    """Package data to one image.

    Args:
        tag (string): Data identifier
        image_array (numpy.ndarray): Value of iamge
        step (int): Step of image
        walltime (int): Wall time of image

    Return:
        Package with format of record_pb2.Record
    """
    image_bytes = imgarray2bytes(image_array)
    image = Record.Image(encoded_image_string=image_bytes)
    return Record(values=[
        Record.Value(id=step, tag=tag, timestamp=walltime, image=image)
    ])


def embedding(tag, labels, hot_vectors, step, walltime=None):
    """Package data to one embedding.

    Args:
        tag (string): Data identifier
        labels (numpy.array or list): A list of labels.
        hot_vectors (numpy.array or list): A matrix which each row is
            feature of labels.
        step (int): Step of embeddings.
        walltime (int): Wall time of embeddings.

    Return:
        Package with format of record_pb2.Record
    """
    embeddings = Record.Embeddings()

    for index in range(len(hot_vectors)):
        embeddings.embeddings.append(
            Record.Embedding(label=labels[index], vectors=hot_vectors[index]))

    return Record(values=[
        Record.Value(
            id=step, tag=tag, timestamp=walltime, embeddings=embeddings)
    ])


def audio(tag, audio_array, sample_rate, step, walltime):
    """Package data to one audio.

    Args:
        tag (string): Data identifier
        audio_array (numpy.ndarray or list): audio represented by a numpy.array
        sample_rate (int): Sample rate of audio
        step (int): Step of audio
        walltime (int): Wall time of audio

    Return:
        Package with format of record_pb2.Record
    """
    import io
    import wave

    fio = io.BytesIO()
    wave_writer = wave.open(fio, 'wb')
    wave_writer.setnchannels(1)
    wave_writer.setsampwidth(2)
    wave_writer.setframerate(sample_rate)
    wave_writer.writeframes(audio_array)
    wave_writer.close()
    audio_string = fio.getvalue()
    fio.close()
    audio_data = Record.Audio(
        sample_rate=sample_rate,
        num_channels=1,
        length_frames=len(audio_array),
        encoded_audio_string=audio_string,
        content_type='audio/wav')
    return Record(values=[
        Record.Value(id=step, tag=tag, timestamp=walltime, audio=audio_data)
    ])
