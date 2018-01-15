from __future__ import absolute_import

from visualdl import core

dtypes = ("float", "double", "int32", "int64")

def check_tag_name_valid(tag):
    assert '%' not in tag, "character % is a reserved word, it is not allowed in tag."

def check_mode_name_valid(tag):
    for char in ['%', '/']:
        assert char not in tag, "character %s is a reserved word, it is not allowed in mode." % char

class LogReader(object):
    """LogReader is a Python wrapper to read and analysis the data that
    saved with data format defined in storage.proto. user can get
    Scalar Reader/Image Reader/Histogram Reader from this module and use
    them to reade the data you need.
    """

    def __init__(self, dir, reader=None):
        """
        create a LogReader
        :param dir: the dir where log file is.
        :param reader: create a new LogReader with a formal one
        """
        self.dir = dir
        self.reader = reader if reader else core.LogReader(dir)

    def mode(self, mode):
        """
        Set the current mode of reader.

        :param mode: the mode is something like a scope, it's used to
        put some related data together. for example: train or test.
        data generated during training can be marked mode train, and data
        generated during testing can be marked test.
        :return: the reader itself
        """
        check_mode_name_valid(mode)
        self.reader.set_mode(mode)
        return self

    def as_mode(self, mode):
        """
        create a new LogReader with mode and return it to user.
        """
        check_mode_name_valid(mode)
        tmp = LogReader(dir, self.reader.as_mode(mode))
        return tmp

    def modes(self):
        """
        Get all modes of the log file
        :return:
        """
        return self.reader.modes()

    def tags(self, component):
        """
        Get all tags from the current log file for one kind of component
        :param component:  Scalar|Histogram|Images
        :return: all the tags
        """
        return self.reader.tags(component)

    def scalar(self, tag, type='float'):
        """
        Get a scalar reader with tag and data type
        """
        check_tag_name_valid(tag)
        type2scalar = {
            'float': self.reader.get_scalar_float,
            'double': self.reader.get_scalar_double,
            'int': self.reader.get_scalar_int,
        }
        return type2scalar[type](tag)

    def image(self, tag):
        """
        Get a image reader with tag
        """
        check_tag_name_valid(tag)
        return self.reader.get_image(tag)

    def histogram(self, tag, type='float'):
        """
        Get a histogram reader with tag and data type
        """
        type2scalar = {
            'float': self.reader.get_histogram_float,
            'double': self.reader.get_histogram_double,
            'int': self.reader.get_histogram_int,
        }
        check_tag_name_valid(tag)
        return type2scalar[type](tag)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.reader.set_mode("default")


class LogWriter(object):
    """LogWriter is a Python wrapper to write data to log file with the data
    format defined in storage.proto. user can get Scalar Reader/Image Reader/
    Histogram Reader from this module and use them to write the data to log file.
    """

    cur_mode = None

    def __init__(self, dir, sync_cycle, writer=None):
        self.dir = dir
        self.sync_cycle = sync_cycle
        self.writer = writer if writer else core.LogWriter(dir, sync_cycle)

    def mode(self, mode):
        check_mode_name_valid(mode)
        self.writer.set_mode(mode)
        return self

    def as_mode(self, mode):
        """
        create a new LogWriter with mode and return it.
        """
        check_mode_name_valid(mode)
        LogWriter.cur_mode = LogWriter(self.dir, self.sync_cycle, self.writer.as_mode(mode))
        return LogWriter.cur_mode

    def scalar(self, tag, type='float'):
        """
        Create a scalar writer with tag and type to write scalar data.
        """
        check_tag_name_valid(tag)
        type2scalar = {
            'float': self.writer.new_scalar_float,
            'double': self.writer.new_scalar_double,
            'int': self.writer.new_scalar_int,
        }
        return type2scalar[type](tag)

    def image(self, tag, num_samples, step_cycle=1):
        """
        Create an image writer that used to write image data.
        """
        check_tag_name_valid(tag)
        return self.writer.new_image(tag, num_samples, step_cycle)

    def histogram(self, tag, num_buckets, type='float'):
        """
        Create a histogram writer that used to write
        histogram related data.
        """
        check_tag_name_valid(tag)
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
