import numpy as np
import re
import storage
from PIL import Image
from tempfile import NamedTemporaryFile
import pprint
import urllib


def get_scalar_tags(storage, mode):
    result = {}
    print 'modes', storage.modes()
    for mode in storage.modes():
        result[mode] = {}
        reader = storage.as_mode(mode)
        for tag in reader.tags('scalar'):
            result[mode][tag] = {
                'displayName': reader.scalar(tag).caption(),
                'description': "",
            }
    return result


def get_image_tags(storage, mode):
    result = {}

    print 'modes', storage.modes()
    for mode in storage.modes():
        reader = storage.as_mode(mode)
        print 'tags', reader.tags('image')
        result[mode] = {}
        for tag in reader.tags('image'):
            image = reader.image(tag)
            if image.num_samples() == 1:
                result[mode][tag] = {
                    'displayName': mage.caption(),
                    'description': "",
                    'samples': 1,
                }
            else:
                for i in xrange(image.num_samples()):
                    result[mode][tag + '/%d' % i] = {
                        'displayName': image.caption(),
                        'description': "",
                        'samples': 1,
                    }
    return result


def get_image_tag_steps(storage, mode, tag):
    # remove suffix '/x'
    res = re.search(r".*/([0-9]+$)", tag)
    step_index = 0
    if res:
        tag = tag[:tag.rfind('/')]
        step_index = int(res.groups()[0])

    reader = storage.as_mode(mode)
    image = reader.image(tag)
    res = []

    for i in range(image.num_samples()):
        record = image.record(step_index, i)
        shape = record.shape()
        query = urllib.urlencode({
            'sample': 0,
            'index': i,
            'tag': tag,
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


def get_invididual_image(storage, mode, tag, step_index):
    reader = storage.as_mode(mode)
    res = re.search(r".*/([0-9]+$)", tag)
    # remove suffix '/x'
    if res:
        offset = int(res.groups()[0])
        tag = tag[:tag.rfind('/')]

    image = reader.image(tag)
    record = image.record(step_index, offset)

    data = np.array(record.data(), dtype='uint8').reshape(record.shape())
    tempfile = NamedTemporaryFile(mode='w+b', suffix='.png')
    with Image.fromarray(data) as im:
        im.save(tempfile)
    tempfile.seek(0, 0)
    return tempfile


if __name__ == '__main__':
    reader = storage.StorageReader('./tmp/mock')
    tags = get_image_tags(reader, 'train')

    tags = get_image_tag_steps(reader, 'train', 'layer1/layer2/image0/0')
    print 'image step tags'
    pprint.pprint(tags)

    image = get_invididual_image(reader, "train", 'layer1/layer2/image0/0', 2)
    print image
