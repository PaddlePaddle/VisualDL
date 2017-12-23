__all__ = [
    'StorageReader',
    'StorageWriter',
]
import core

dtypes = ("float", "double", "int32", "int64")


class StorageReader(object):

    def __init__(self, mode, dir):
        self.reader = core.Reader(mode, dir)

    def scalar(self, tag, type='float'):
        type2scalar = {
            'float': self.reader.get_scalar_float,
            'double': self.reader.get_scalar_double,
            'int': self.reader.get_scalar_int,
        }
        return type2scalar[type](tag)


class StorageWriter(object):

    def __init__(self, mode, dir):
        self.writer = core.Writer(mode, dir)

    def scalar(self, tag, type='float'):
        type2scalar = {
            'float': self.writer.new_scalar_float,
            'double': self.writer.new_scalar_double,
            'int': self.writer.new_scalar_int,
        }
        return type2scalar[type](tag)
