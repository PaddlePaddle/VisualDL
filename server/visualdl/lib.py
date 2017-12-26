import numpy as np
import re
import storage
from PIL import Image
from tempfile import NamedTemporaryFile


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
                    'displayName': reader.scalar(tag).caption(),
                    'description': "",
                    'samples': 1,
                }
            else:
                for i in xrange(image.num_samples()):
                    result[mode][tag + '/%d' % i] = {
                        'displayName': reader.scalar(tag).caption(),
                        'description': "",
                        'samples': 1,
                    }
    return result


def get_image_tag_steps(storage, mode, tag):
    # remove suffix '/x'
    res = re.search(r".*/([0-9]+$)", tag)
    if res:
        tag = tag[:tag.rfind('/')]

    reader = storage.as_mode(mode)
    image = reader.image(tag)
    # TODO(ChunweiYan) make max_steps a config
    max_steps = 10
    res = []
    steps = []
    if image.num_records() > max_steps:
        span = int(image.num_records() / max_steps)
        steps = [image.num_records() - i * span - 1 for i in xrange(max_steps)]
        steps = [i for i in reversed(steps)]
        steps[0] = max(steps[0], 0)
    else:
        steps = [i for i in xrange(image.num_records())]

    for step in steps:
        res.append({
            'wall_time': image.timestamp(step),
            'step': step,
        })
    return res


def get_invididual_image(storage, mode, tag, index):
    reader = storage.as_mode(mode)
    res = re.search(r".*/([0-9]+$)", tag)
    # remove suffix '/x'
    if res:
        offset = int(res.groups()[0])
        tag = tag[:tag.rfind('/')]

    image = reader.image(tag)
    data = image.data(offset, index)
    shape = image.shape(offset, index)
    # print data
    # print shape
    data = np.array(data, dtype='uint8').reshape(shape)
    tempfile = NamedTemporaryFile(mode='w+b', suffix='.png')
    with Image.fromarray(data) as im:
        im.save(tempfile)
    tempfile.seek(0, 0)
    return tempfile


if __name__ == '__main__':
    reader = storage.StorageReader('./tmp/mock')
    tags = get_image_tags(reader, 'train')

    tags = get_image_tag_steps(reader, 'train', 'layer1/layer2/image0/0')
    print 'image step tags', tags

    image = get_invididual_image(reader, "train", 'layer1/layer2/image0/0', 2)
    print image
