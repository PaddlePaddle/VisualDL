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
    saved with data format defined in storage.proto. A User can get
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

        :param mode: The log reader will read the data grouped by mode.
        :type mode: basestring
        :return: the log reader itself
        :rtype: LogReader
        """
        check_mode_name_valid(mode)
        self.reader.set_mode(mode)
        return self

    def as_mode(self, mode):
        """
        create a new LogReader with mode and return it to user.

        :param mode: The log reader will read the data grouped by mode.
        :type mode: basestring
        :return: a new log reader instance
        :rtype: LogReader
        """
        check_mode_name_valid(mode)
        tmp = LogReader(dir, self.reader.as_mode(mode))
        return tmp

    def modes(self):
        """
        Get all modes of the log file

        :return: a list of all modes
        :rtype: list
        """
        return self.reader.modes()

    def tags(self, component):
        """
        Get all tags from the current log file for one kind of component

        :param component:  scalar|histogram|image
        :return: all the tags
        :type: list
        """
        return self.reader.tags(component)

    def scalar(self, tag, type='float'):
        """
        Get a scalar reader with tag and data type

        :param tag:  The reader will read the scalar data marked with tag
        :type tag: basestring
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

        :param tag:  The reader will read the image data marked with tag
        :type tag: basestring
        """
        check_tag_name_valid(tag)
        return self.reader.get_image(tag)

    def histogram(self, tag, type='float'):
        """
        Get a histogram reader with tag and data type

        :param tag:  The reader will read the histogram data marked with tag
        :type tag: basestring
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
    format defined in storage.proto. A User can get Scalar Reader/Image Reader/
    Histogram Reader from this module and use them to write the data to log file.
    """

    cur_mode = None

    def __init__(self, dir, sync_cycle, writer=None):
        self.dir = dir
        self.sync_cycle = sync_cycle
        self.writer = writer if writer else core.LogWriter(dir, sync_cycle)

    def mode(self, mode):
        """
        Set the current mode of writer.

        :param mode: The logger will group data under mode.
        :type mode: basestring
        :return: a new LogWriter instance with mode
        :rtype: LogWriter
        """
        check_mode_name_valid(mode)
        self.writer.set_mode(mode)
        return self

    def as_mode(self, mode):
        """
        create a new LogWriter with mode and return it.

        :param mode: The logger will group data under mode.
        :type mode: basestring
        :return: the logWriter itself
        :rtype: LogWriter
        """
        check_mode_name_valid(mode)
        LogWriter.cur_mode = LogWriter(self.dir, self.sync_cycle,
                                       self.writer.as_mode(mode))
        return LogWriter.cur_mode

    def scalar(self, tag, type='float'):
        """
        Create a scalar writer with tag and type to write scalar data.

        :param tag: The scalar writer will label the data with tag
        :type tag: basestring
        :return: A scalar writer to handle step and value records
        :rtype: ScalarWriter
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

        :param tag: The image writer will label the image with tag
        :type tag: basestring
        :param num_samples: how many samples to take in a step.
        :type num_samples: integer
        :param step_cycle: store every `step_cycle` as a record.
        :type step_cycle: integer
        :return: A image writer to sample images
        :rtype: ImageWriter
        """
        check_tag_name_valid(tag)
        return self.writer.new_image(tag, num_samples, step_cycle)

    def histogram(self, tag, num_buckets, type='float'):
        """
        Create a histogram writer that used to write
        histogram related data.

        :param tag: The histogram writer will label the data with tag
        :type tag: basestring
        :return: A histogram writer to record distribution
        :rtype: HistogramWriter
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
