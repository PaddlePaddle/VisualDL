# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =======================================================================

from __future__ import absolute_import

from visualdl import core

dtypes = ("float", "double", "int32", "int64")
EMBEDDING_TAG = 'embedding'


def check_tag_name_valid(tag):
    assert '%' not in tag, "character % is a reserved word, it is not allowed in tag."
    assert tag != EMBEDDING_TAG, "embedding is a reserved word, it is not allowed in tag."


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

    def text(self, tag):
        """
        Get a text reader with tag

        :param tag:  The reader will read the text data marked with tag
        :type tag: basestring
        """
        check_tag_name_valid(tag)
        return self.reader.get_text(tag)

    def embedding(self):
        """
        Get the embedding reader.
        """
        return self.reader.get_embedding(EMBEDDING_TAG)

    def audio(self, tag):
        """
        Get an audio reader with tag

        :param tag:  The reader will read the audio data marked with tag
        :type tag: basestring
        """
        check_tag_name_valid(tag)
        return self.reader.get_audio(tag)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.reader.set_mode("default")


class LogWriter(object):
    """LogWriter is a Python wrapper to write data to log file with the data
    format defined in storage.proto. A User can get Scalar Reader/Image Reader/
    Histogram Reader from this module and use them to write the data to log file.

    :param dir: The directory path to the saved log files.
    :type dir: basestring
    :param sync_cycle: Specify how often should the system store data into the file system.
        Typically adding a record requires 6 operations.
        System will save the data into the file system once operations count reaches sync_cycle.
    :type sync_cycle: integer
    :return: a new LogWriter instance
    :rtype: LogWriter
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

    def audio(self, tag, num_samples, step_cycle=1):
        """
        Create an audio writer that used to write audio data.

        :param tag: The audio writer will label the audio with tag
        :type tag: basestring
        :param num_samples: how many samples to take in a step.
        :type num_samples: integer
        :param step_cycle: store every `step_cycle` as a record.
        :type step_cycle: integer
        :return: A audio writer to sample audio
        :rtype: AudioWriter
        """
        check_tag_name_valid(tag)
        return self.writer.new_audio(tag, num_samples, step_cycle)

    def text(self, tag):
        """
        Create a text writer that used to write
        text related data.

        :param tag: The text writer will label the data with tag
        :type tag: basestring
        :return: A text writer to record distribution
        :rtype: TextWriter
        """
        check_tag_name_valid(tag)
        return self.writer.new_text(tag)

    def embedding(self):
        """
        Create an embedding writer that is used to write
        embedding data.

        :return: An embedding writer to record embedding data
        :rtype: embeddingWriter
        """
        return self.writer.new_embedding(EMBEDDING_TAG)

    def save(self):
        """
        Force the VisualDL to sync with the file system.
        """
        self.writer.save()

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.writer.set_mode("default")
