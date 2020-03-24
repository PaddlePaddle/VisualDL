# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
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

from __future__ import absolute_import
import re
import sys
import time
from tempfile import NamedTemporaryFile
import numpy as np
from PIL import Image
from .log import logger
import wave
from .data_manager import default_data_manager

try:
    from urllib.parse import urlencode
except Exception:
    from urllib import urlencode


def get_modes(storage):
    return storage.modes()


def get_tags(storage, component):
    result = {}
    for mode in storage.modes():
        with storage.mode(mode) as reader:
            tags = reader.tags(component)
            if tags:
                result[mode] = tags
    return result


def get_scalar_tags(storage):
    return get_tags(storage, 'scalar')


def get_scalar(storage, mode, tag, num_records=300):
    with storage.mode(mode) as reader:
        scalar = reader.scalar(tag)

        data_reservoir = default_data_manager.get_reservoir("scalar")
        if not data_reservoir.exist_in_keys(mode=mode, tag=tag):
            records = scalar.records()
            ids = scalar.ids()
            timestamps = scalar.timestamps()

            data = list(zip(timestamps, ids, records))

            for index in range(len(data)):
                data_reservoir.add_item(mode=mode, tag=tag, item=data[index])
        else:
            num_items_index = data_reservoir.get_num_items_index(mode, tag)
            if num_items_index != scalar.size():
                records = scalar.records(num_items_index)
                ids = scalar.ids(num_items_index)
                timestamps = scalar.timestamps(num_items_index)

                data = list(zip(timestamps, ids, records))

                for index in range(len(data)):
                    data_reservoir.add_item(mode=mode, tag=tag, item=data[index])
        results = data_reservoir.get_items(mode, tag)
        # TODO(Superjomn) some bug here, sometimes there are zero here.
        if results[-1][-1] == 0:
            data_reservoir.cut_tail(mode=mode, tag=tag)
            results = data_reservoir.get_items(mode, tag)
        return results


def get_image_tags(storage):
    result = {}

    for mode in storage.modes():
        with storage.mode(mode) as reader:
            tags = reader.tags('image')
            if tags:
                result[mode] = []
                for tag in tags:
                    image = reader.image(tag)
                    for i in range(max(1, image.num_samples())):
                        caption = tag if image.num_samples(
                        ) <= 1 else '%s/%d' % (tag, i)
                        result[mode].append(caption)
    return result


def get_image_tag_steps(storage, mode, tag):
    # remove suffix '/x'
    res = re.search(r".*/([0-9]+$)", tag)
    sample_index = 0
    if res:
        tag = tag[:tag.rfind('/')]
        sample_index = int(res.groups()[0])

    with storage.mode(mode) as reader:
        image = reader.image(tag)
        res = []

    image_num_records = image.num_records()
    num_samples = 10
    if image_num_records <= num_samples:
        for step_index in range(image_num_records):
            record = image.record(step_index, sample_index)

            res.append({
                'step': record.step_id(),
                'wallTime': image.timestamp(step_index)
            })

    else:
        span = float(image_num_records) / num_samples
        for index in range(num_samples):
            step_index = round(span * index)
            record = image.record(step_index, sample_index)

            res.append({
                'step': record.step_id(),
                'wallTime': image.timestamp(step_index)
            })

    return res


def get_invididual_image(storage, mode, tag, step_index, max_size=80):
    with storage.mode(mode) as reader:
        res = re.search(r".*/([0-9]+$)", tag)
        # remove suffix '/x'
        offset = 0
        if res:
            offset = int(res.groups()[0])
            tag = tag[:tag.rfind('/')]

        image = reader.image(tag)
        record = image.record(step_index, offset)

        shape = record.shape()

        if shape[2] == 1:
            shape = [shape[0], shape[1]]
        data = np.array(record.data(), dtype='uint8').reshape(shape)
        tempfile = NamedTemporaryFile(mode='w+b', suffix='.png')
        with Image.fromarray(data) as im:
            im.save(tempfile)
        tempfile.seek(0, 0)
        return tempfile


def get_audio_tags(storage):
    result = {}

    for mode in storage.modes():
        with storage.mode(mode) as reader:
            tags = reader.tags('audio')
            if tags:
                result[mode] = {}
                for tag in tags:
                    audio = reader.audio(tag)
                    for i in range(max(1, audio.num_samples())):
                        caption = tag if audio.num_samples(
                        ) <= 1 else '%s/%d' % (tag, i)
                        result[mode].append(caption)

    return result


def get_audio_tag_steps(storage, mode, tag):
    # remove suffix '/x'
    res = re.search(r".*/([0-9]+$)", tag)
    sample_index = 0
    if res:
        tag = tag[:tag.rfind('/')]
        sample_index = int(res.groups()[0])

    with storage.mode(mode) as reader:
        audio = reader.audio(tag)
        res = []

    for step_index in range(audio.num_records()):
        record = audio.record(step_index, sample_index)

        res.append({
            'step': record.step_id(),
            'wallTime': audio.timestamp(step_index),
        })

    return res


def get_individual_audio(storage, mode, tag, step_index, max_size=80):

    with storage.mode(mode) as reader:
        res = re.search(r".*/([0-9]+$)", tag)
        # remove suffix '/x'
        offset = 0
        if res:
            offset = int(res.groups()[0])
            tag = tag[:tag.rfind('/')]

        audio = reader.audio(tag)
        record = audio.record(step_index, offset)

        shape = record.shape()
        sample_rate = shape[0]
        sample_width = shape[1]
        num_channels = shape[2]

        # sending a temp file to front end
        tempfile = NamedTemporaryFile(mode='w+b', suffix='.wav')

        # write audio file to that tempfile
        wavfile = wave.open(tempfile, 'wb')

        wavfile.setframerate(sample_rate)
        wavfile.setnchannels(num_channels)
        wavfile.setsampwidth(sample_width)

        # convert to binary string to write to wav file
        data = np.array(record.data(), dtype='uint8')
        wavfile.writeframes(data.tostring())

        # make sure the marker is at the start of file
        tempfile.seek(0, 0)

        return tempfile


def get_histogram_tags(storage):
    return get_tags(storage, 'histogram')


def get_texts_tags(storage):
    return get_tags(storage, 'text')


def get_texts(storage, mode, tag, num_records=100):
    with storage.mode(mode) as reader:
        texts = reader.text(tag)

        records = texts.records()
        ids = texts.ids()
        timestamps = texts.timestamps()

        data = list(zip(timestamps, ids, records))
        data_size = len(data)

        if data_size <= num_records:
            return data

        span = float(data_size) / (num_records - 1)
        span_offset = 0

        data_idx = int(span_offset * span)
        sampled_data = []

        while data_idx < data_size:
            sampled_data.append(data[data_size - data_idx - 1])
            span_offset += 1
            data_idx = int(span_offset * span)

        sampled_data.append(data[0])
        res = sampled_data[::-1]
        # TODO(Superjomn) some bug here, sometimes there are zero here.
        if res[-1] == 0.:
            res = res[:-1]
        return res


def get_embeddings(storage, mode, reduction, dimension=2, num_records=5000):
    with storage.mode(mode) as reader:
        embedding = reader.embedding()
        labels = embedding.get_all_labels()
        high_dimensional_vectors = np.array(embedding.get_all_embeddings())

        if reduction == 'tsne':
            import visualdl.server.tsne as tsne
            low_dim_embs = tsne.tsne(
                high_dimensional_vectors,
                dimension,
                initial_dims=50,
                perplexity=30.0)

        elif reduction == 'pca':
            low_dim_embs = simple_pca(high_dimensional_vectors, dimension)

        return {"embedding": low_dim_embs.tolist(), "labels": labels}


def get_histogram(storage, mode, tag):
    with storage.mode(mode) as reader:
        histogram = reader.histogram(tag)
        data_reservoir = default_data_manager.get_reservoir("histogram")
        if not data_reservoir.exist_in_keys(mode=mode, tag=tag):
            records = histogram.records()

            for record in records:
                data = []
                for j in range(record.num_instances()):
                    instance = record.instance(j)
                    data.append(
                        [instance.left(), instance.right(), instance.frequency()])
                data_reservoir.add_item(mode, tag, [record.timestamp(), record.step(), data])
        else:
            num_items_index = data_reservoir.get_num_items_index(mode, tag)
            if num_items_index != histogram.size():
                records = histogram.records(num_items_index)

                for record in records:
                    data = []
                    for j in range(record.num_instances()):
                        instance = record.instance(j)
                        data.append(
                            [instance.left(), instance.right(), instance.frequency()])
                    data_reservoir.add_item(mode, tag, [record.timestamp(), record.step(), data])
        return data_reservoir.get_items(mode, tag)


def retry(ntimes, function, time2sleep, *args, **kwargs):
    '''
    try to execute `function` `ntimes`, if exception catched, the thread will
    sleep `time2sleep` seconds.
    '''
    for i in range(ntimes):
        try:
            return function(*args, **kwargs)
        except Exception:
            error_info = '\n'.join(map(str, sys.exc_info()))
            logger.error("Unexpected error: %s" % error_info)
            time.sleep(time2sleep)


def cache_get(cache):
    def _handler(key, func, *args, **kwargs):
        data = cache.get(key)
        if data is None:
            logger.warning('update cache %s' % key)
            data = func(*args, **kwargs)
            cache.set(key, data)
            return data
        return data

    return _handler


def simple_pca(x, dimension):
    """
    A simple PCA implementation to do the dimension reduction.
    """

    # Center the data.
    x -= np.mean(x, axis=0)

    # Computing the Covariance Matrix
    cov = np.cov(x, rowvar=False)

    # Get eigenvectors and eigenvalues from the covariance matrix
    eigvals, eigvecs = np.linalg.eig(cov)

    # Sort the eigvals from high to low
    order = np.argsort(eigvals)[::-1]

    # Drop the eigenvectors with low eigenvalues
    eigvecs = eigvecs[:, order[:dimension]]

    return np.dot(x, eigvecs)
