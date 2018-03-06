from __future__ import absolute_import
import re
import sys
import time
from tempfile import NamedTemporaryFile
import numpy as np
from PIL import Image
from .log import logger

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
                result[mode] = {}
                for tag in tags:
                    result[mode][tag] = {
                        'displayName': tag,
                        'description': "",
                    }
    return result


def get_scalar_tags(storage):
    return get_tags(storage, 'scalar')


def get_scalar(storage, mode, tag, num_records=300):
    assert num_records > 1

    with storage.mode(mode) as reader:
        scalar = reader.scalar(tag)

        records = scalar.records()
        ids = scalar.ids()
        timestamps = scalar.timestamps()

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


def get_image_tags(storage):
    result = {}

    for mode in storage.modes():
        with storage.mode(mode) as reader:
            tags = reader.tags('image')
            if tags:
                result[mode] = {}
                for tag in tags:
                    image = reader.image(tag)
                    for i in range(max(1, image.num_samples())):
                        caption = tag if image.num_samples(
                        ) <= 1 else '%s/%d' % (tag, i)
                        result[mode][caption] = {
                            'displayName': caption,
                            'description': "",
                            'samples': 1,
                        }
    return result


def get_image_tag_steps(storage, mode, tag):
    # remove suffix '/x'
    res = re.search(r".*/([0-9]+$)", tag)
    sample_index = 0
    origin_tag = tag
    if res:
        tag = tag[:tag.rfind('/')]
        sample_index = int(res.groups()[0])

    with storage.mode(mode) as reader:
        image = reader.image(tag)
        res = []

    for step_index in range(image.num_records()):
        record = image.record(step_index, sample_index)
        shape = record.shape()
        # TODO(ChunweiYan) remove this trick, some shape will be empty
        if not shape:
            continue
        try:
            query = urlencode({
                'sample': 0,
                'index': step_index,
                'tag': origin_tag,
                'run': mode,
            })
            res.append({
                'height': shape[0],
                'width': shape[1],
                'step': record.step_id(),
                'wall_time': image.timestamp(step_index),
                'query': query,
            })
        except Exception:
            logger.error("image sample out of range")

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


def get_histogram_tags(storage):
    return get_tags(storage, 'histogram')


def get_histogram(storage, mode, tag, num_samples=100):
    with storage.mode(mode) as reader:
        histogram = reader.histogram(tag)
        res = []

        for i in range(histogram.num_records()):
            try:
                # some bug with protobuf, some times may overflow
                record = histogram.record(i)
            except Exception:
                continue

            res.append([])
            py_record = res[-1]
            py_record.append(record.timestamp())
            py_record.append(record.step())
            py_record.append([])

            data = py_record[-1]
            for j in range(record.num_instances()):
                instance = record.instance(j)
                data.append(
                    [instance.left(), instance.right(), instance.frequency()])
        if len(res) < num_samples:
            return res

        # sample some steps
        span = float(len(res)) / (num_samples - 1)
        span_offset = 0
        data_idx = 0

        sampled_data = []
        data_size = len(res)
        while data_idx < data_size:
            sampled_data.append(res[data_size - data_idx - 1])
            span_offset += 1
            data_idx = int(span_offset * span)
        sampled_data.append(res[0])
        return sampled_data[::-1]


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
