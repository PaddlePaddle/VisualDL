import pprint
import random
import re
import urllib
from tempfile import NamedTemporaryFile

import numpy as np
from PIL import Image

import storage


def get_modes(storage):
    return storage.modes()


def get_scalar_tags(storage, mode):
    result = {}
    for mode in storage.modes():
        with storage.mode(mode) as reader:
            tags = reader.tags('scalar')
            if tags:
                result[mode] = {}
                for tag in tags:
                    result[mode][tag] = {
                        'displayName': tag,
                        'description': "",
                    }
    return result


def get_scalar(storage, mode, tag, num_records=100):
    with storage.mode(mode) as reader:
        scalar = reader.scalar(tag)

        records = scalar.records()
        ids = scalar.ids()
        timestamps = scalar.timestamps()

        data = zip(timestamps, ids, records)
        if len(data) <= num_records:
            return data

        samples = sorted(random.sample(xrange(len(data)), num_records))
        return [data[i] for i in samples]


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
                        caption = tag if image.num_samples() <= 1 else '%s/%d'%(tag, i)
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
        record = image.record(step_index, sample_index)
        shape = record.shape()
        # TODO(ChunweiYan) remove this trick, some shape will be empty
        if not shape: continue
        # assert shape, "%s,%s" % (mode, tag)
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


def get_invididual_image(storage, mode, tag, step_index, max_size=80):
    with storage.mode(mode) as reader:
        res = re.search(r".*/([0-9]+$)", tag)
        # remove suffix '/x'
        if res:
            offset = int(res.groups()[0])
            tag = tag[:tag.rfind('/')]

        image = reader.image(tag)
        record = image.record(step_index, offset)

        shape = record.shape()

        data = np.array(record.data(), dtype='uint8').reshape(record.shape())
        tempfile = NamedTemporaryFile(mode='w+b', suffix='.png')
        with Image.fromarray(data) as im:
            size = max(shape[0], shape[1])
            if size > max_size:
                scale = max_size * 1. / size
                scaled_shape = (int(shape[0]*scale), int(shape[1]*scale))
                im = im.resize(scaled_shape)
            im.save(tempfile)
        tempfile.seek(0, 0)
        return tempfile


if __name__ == '__main__':
    reader = storage.LogReader('./tmp/mock')
    tags = get_image_tags(reader)

    tags = get_image_tag_steps(reader, 'train', 'layer1/layer2/image0/0')
    pprint.pprint(tags)

    image = get_invididual_image(reader, "train", 'layer1/layer2/image0/0', 2)
    print image
