__all__ = [
    'StorageReader',
    'StorageWriter',
]
import core

dtypes = ("float", "double", "int32", "int64")


class StorageReader(object):

    cur_mode = None

    def __init__(self, dir, reader=None):
        self.dir = dir
        self.reader = reader if reader else core.Reader(dir)

    def mode(self, mode):
        StorageReader.cur_mode = self.as_mode(mode)
        return StorageReader.cur_mode

    def as_mode(self, mode):
        tmp = StorageReader(dir, self.reader.as_mode(mode))
        return tmp

    def modes(self):
        return self.reader.modes()

    def tags(self, kind):
        return self.reader.tags(kind)

    def scalar(self, tag, type='float'):
        type2scalar = {
            'float': self.reader.get_scalar_float,
            'double': self.reader.get_scalar_double,
            'int': self.reader.get_scalar_int,
        }
        return type2scalar[type](tag)

    def image(self, tag):
        return self.reader.get_image(tag)

    def __enter__(self):
        return StorageReader.cur_mode

    def __exit__(self, type, value, traceback):
        pass


class StorageWriter(object):

    cur_mode = None

    def __init__(self, dir, sync_cycle, writer=None):
        self.dir = dir
        self.sync_cycle = sync_cycle
        self.writer = writer if writer else core.Writer(dir, sync_cycle)

    def mode(self, mode):
        StorageWriter.cur_mode = self.as_mode(mode)
        return StorageWriter.cur_mode

    def as_mode(self, mode):
        StorageWriter.cur_mode = StorageWriter(self.dir, self.sync_cycle, self.writer.as_mode(mode))
        return StorageWriter.cur_mode

    def scalar(self, tag, type='float'):
        type2scalar = {
            'float': self.writer.new_scalar_float,
            'double': self.writer.new_scalar_double,
            'int': self.writer.new_scalar_int,
        }
        return type2scalar[type](tag)

    def image(self, tag, num_samples, step_cycle):
        return self.writer.new_image(tag, num_samples, step_cycle)

    def __enter__(self):
        return StorageWriter.cur_mode

    def __exit__(self, type, value, traceback):
        pass
