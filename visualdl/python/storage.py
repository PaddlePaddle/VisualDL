from __future__ import absolute_import

from visualdl import core

dtypes = ("float", "double", "int32", "int64")


class LogReader(object):

    cur_mode = None

    def __init__(self, dir, reader=None):
        self.dir = dir
        self.reader = reader if reader else core.LogReader(dir)

    def mode(self, mode):
        self.reader.set_mode(mode)
        return self

    def as_mode(self, mode):
        tmp = LogReader(dir, self.reader.as_mode(mode))
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

    def histogram(self, tag, type='float'):
        type2scalar = {
            'float': self.reader.get_histogram_float,
            'double': self.reader.get_histogram_double,
            'int': self.reader.get_histogram_int,
        }
        return type2scalar[type](tag)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.reader.set_mode("default")


class LogWriter(object):

    cur_mode = None

    def __init__(self, dir, sync_cycle, writer=None):
        self.dir = dir
        self.sync_cycle = sync_cycle
        self.writer = writer if writer else core.LogWriter(dir, sync_cycle)

    def mode(self, mode):
        self.writer.set_mode(mode)
        return self

    def as_mode(self, mode):
        LogWriter.cur_mode = LogWriter(self.dir, self.sync_cycle,
                                       self.writer.as_mode(mode))
        return LogWriter.cur_mode

    def scalar(self, tag, type='float'):
        '''
        Create a scalar component.
        '''
        type2scalar = {
            'float': self.writer.new_scalar_float,
            'double': self.writer.new_scalar_double,
            'int': self.writer.new_scalar_int,
        }
        return type2scalar[type](tag)

    def image(self,
              tag,
              num_samples,
              step_cycle=1,
              max_width=-1,
              max_height=-1):
        '''
        Create an image component.
        '''
        return self.writer.new_image(tag, num_samples, step_cycle, max_width,
                                     max_height)

    def histogram(self, tag, num_buckets, type='float'):
        '''
        Create a histogram component.
        '''
        types = {
            'float': self.writer.new_histogram_float,
            'double': self.writer.new_histogram_double,
            'int': self.writer.new_histogram_int,
        }
        return types[type](tag, num_buckets)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.writer.set_mode("default")
