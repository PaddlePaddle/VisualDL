import pprint
import os
import random
import re
import urllib
from tempfile import NamedTemporaryFile
from log import logger

import numpy as np
from PIL import Image


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

        data = zip(timestamps, ids, records)
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
        return sampled_data[::-1]


def get_image_tags(storage):
    result = {}

    for mode in storage.modes():
        with storage.mode(mode) as reader:
            tags = reader.tags('image')
            if tags:
                result[mode] = {}
                for tag in tags:
                    image = reader.image(tag)
                    for i in xrange(max(1, image.num_samples())):
                        caption = tag if image.num_samples(
                        ) <= 1 else '%s/%d' % (tag, i)
                        result[mode][caption] = {
                            'displayName': caption,
                            'description': "",
                            'samples': 1,
                        }
    return result


def get_image_tag_steps(storage, mode, tag):
    print 'image_tag_steps,mode,tag:', mode, tag
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
        try:
            # the latest step may have less samples than `num_samples`, and this
            # operation should fail in that situation.
            record = image.record(step_index, sample_index)
        except:
            # just break it, because if no more than `num_samples`, only the preceding
            # records are valid.
            break
        shape = record.shape()
        # TODO(ChunweiYan) remove this trick, some shape will be empty
        # if not shape: continue
        query = urllib.urlencode({
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
    return res


def get_invididual_image(storage, imagedir, mode, tag, step_index,
                         max_size=80):
    with storage.mode(mode) as reader:
        image_name = (mode + "/" + tag + '.png').replace('/', '__')
        image_path = os.path.join(imagedir, image_name)

        res = re.search(r".*/([0-9]+$)", tag)
        # remove suffix '/x'
        if res:
            offset = int(res.groups()[0])
            tag = tag[:tag.rfind('/')]

        image = reader.image(tag)

        try:
            record = image.record(step_index, offset)
            shape = record.shape()
            if shape[2] == 1:
                shape = shape[0], shape[1]
            data = np.array(
                record.data(), dtype='uint8').reshape(record.shape())

            tempfile = open(image_path, mode='w+b')
            #tempfile = NamedTemporaryFile(mode='w+b', suffix='.png')
            with Image.fromarray(data) as im:
                size = max(shape[0], shape[1])
                if size > max_size:
                    scale = max_size * 1. / size
                    scaled_shape = (int(shape[0] * scale), int(
                        shape[1] * scale))
                    im = im.resize(scaled_shape)
                im.save(tempfile)
            tempfile.seek(0, 0)
        except:
            logger.info("failed to get image record, step:%d, offset:%d" %
                        (step_index, offset))
            tempfile = open(image_path, mode='r+b')
        return tempfile


def get_histogram_tags(storage):
    return get_tags(storage, 'histogram')


def get_histogram(storage, mode, tag):
    with storage.mode(mode) as reader:
        histogram = reader.histogram(tag)
        res = []

        for i in xrange(histogram.num_records()):
            try:
                # some bug with protobuf, some times may overflow
                record = histogram.record(i)
            except:
                continue

            res.append([])
            py_record = res[-1]
            py_record.append(record.timestamp())
            py_record.append(record.step())
            py_record.append([])

            data = py_record[-1]
            for j in xrange(record.num_instances()):
                instance = record.instance(j)
                data.append(
                    [instance.left(),
                     instance.right(),
                     instance.frequency()])
        return res


if __name__ == '__main__':
    reader = storage.LogReader('./tmp/mock')
    tags = get_image_tags(reader)

    tags = get_image_tag_steps(reader, 'train', 'layer1/layer2/image0/0')
    pprint.pprint(tags)

    image = get_invididual_image(reader, "train", 'layer1/layer2/image0/0', 2)
    print image
