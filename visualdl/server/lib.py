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
import sys
import time
import numpy as np
from visualdl.server.log import logger
from visualdl.utils.string_util import encode_tag, decode_tag


def get_components(log_reader):
    return log_reader.components()


def get_runs(log_reader):
    return log_reader.runs()


def get_tags(log_reader):
    return log_reader.tags()


def get_logs(log_reader, component):
    all_tag = log_reader.data_manager.get_reservoir(component).keys
    tags = {}
    for item in all_tag:
        index = item.rfind('/')
        run = item[0:index]
        tag = encode_tag(item[index + 1:])
        if run in tags.keys():
            tags[run].append(tag)
        else:
            tags[run] = [tag]
    return tags


def get_scalar_tags(log_reader):
    return get_logs(log_reader, "scalar")


def get_scalar(log_reader, run, tag):
    log_reader.load_new_data()
    records = log_reader.data_manager.get_reservoir("scalar").get_items(
        run, decode_tag(tag))
    results = [[item.timestamp, item.id, item.value] for item in records]
    return results


def get_image_tags(log_reader):
    return get_logs(log_reader, "image")


def get_image_tag_steps(log_reader, run, tag):
    log_reader.load_new_data()
    records = log_reader.data_manager.get_reservoir("image").get_items(
        run, decode_tag(tag))
    result = [{
        "step": item.id,
        "wallTime": item.timestamp
    } for item in records]
    return result


def get_individual_image(log_reader, run, tag, step_index):
    log_reader.load_new_data()
    records = log_reader.data_manager.get_reservoir("image").get_items(
        run, decode_tag(tag))
    return records[step_index].image.encoded_image_string


def get_audio_tags(log_reader):
    return get_logs(log_reader, "audio")


def get_audio_tag_steps(log_reader, run, tag):
    log_reader.load_new_data()
    records = log_reader.data_manager.get_reservoir("audio").get_items(
        run, decode_tag(tag))
    result = [{
        "step": item.id,
        "wallTime": item.timestamp
    } for item in records]
    return result


def get_individual_audio(log_reader, run, tag, step_index):
    log_reader.load_new_data()
    records = log_reader.data_manager.get_reservoir("audio").get_items(
        run, decode_tag(tag))
    result = records[step_index].audio.encoded_image_string
    return result


def get_embeddings_tags(log_reader):
    return get_logs(log_reader, "embeddings")


def get_embeddings(log_reader, run, tag, reduction, dimension=2):
    log_reader.load_new_data()
    records = log_reader.data_manager.get_reservoir("embeddings").get_items(
        run, decode_tag(tag))

    labels = []
    vectors = []
    for item in records[0].embeddings.embeddings:
        labels.append(item.label)
        vectors.append(item.vectors)
    vectors = np.array(vectors)

    if reduction == 'tsne':
        import visualdl.server.tsne as tsne
        low_dim_embs = tsne.tsne(
            vectors, dimension, initial_dims=50, perplexity=30.0)

    elif reduction == 'pca':
        low_dim_embs = simple_pca(vectors, dimension)

    return {"embedding": low_dim_embs.tolist(), "labels": labels}


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
