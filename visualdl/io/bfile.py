# Copyright (c) 2020 VisualDL Authors. All Rights Reserve.
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

import os
import tempfile

# Note: Some codes here refer to TensorBoardX.
# A good default block size depends on the system in question.
# A somewhat conservative default chosen here.
_DEFAULT_BLOCK_SIZE = 16 * 1024 * 1024


class FileFactory(object):
    def __init__(self):
        self._register_factories = {}

    def register_filesystem(self, path, filesystem):
        self._register_factories.update({path: filesystem})

    def get_filesystem(self, path):
        prefix = ""
        index = path.find("://")
        if index >= 0:
            prefix = path[:index]
        fs = self._register_factories.get(prefix, None)
        if fs is None:
            raise ValueError("No recognized filesystem for prefix %s" % prefix)
        return fs


default_file_factory = FileFactory()


class LocalFileSystem(object):
    def __init__(self):
        pass

    @staticmethod
    def exists(path):
        return os.path.exists(path)

    @staticmethod
    def makedirs(path):
        os.makedirs(path)

    @staticmethod
    def join(path, *paths):
        return os.path.join(path, *paths)

    def read(self, filename, binary_mode=False, size=None, continue_from=None):
        mode = "rb" if binary_mode else "r"
        encoding = None if binary_mode else "utf-8"
        offset = None
        if continue_from is not None:
            offset = continue_from.get("last_offset", None)
        with open(filename, mode=mode, encoding=encoding) as fp:
            if offset is not None:
                fp.seek(offset)
            data = fp.read(size)
            continue_from_token = {"last_offset": fp.tell()}
            return data, continue_from_token

    def _write(self, filename, file_content, mode):
        encoding = None if "b" in mode else "utf-8"
        with open(filename, mode, encoding=encoding) as fp:
            fp.write(file_content)

    def append(self, filename, file_content, binary_mode=False):
        self._write(filename, file_content, "ab" if binary_mode else "a")

    def write(self, filename, file_content, binary_mode=False):
        self._write(filename, file_content, "wb" if binary_mode else "w")

    def walk(self, dir):
        return os.walk(dir)


default_file_factory.register_filesystem("", LocalFileSystem())


class BFile(object):
    def __init__(self, filename, mode):
        if mode not in ('r', 'rb', 'br', 'w', 'wb', 'bw'):
            raise NotImplementedError("mode {} not supported by "
                                      "BFile.".format(mode))
        self._filename = filename
        self.fs = default_file_factory.get_filesystem(filename)
        self.fs_supports_append = hasattr(self.fs, 'append')
        self.buff = None
        self.buff_chunk_size = _DEFAULT_BLOCK_SIZE
        self.buff_offset = 0
        self.continuation_token = None
        self.write_temp = None
        self.write_started = False
        self.binary_mode = 'b' in mode
        self.write_mode = 'w' in mode
        self.closed = False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        self.buff = None
        self.buff_offset = 0
        self.continuation_token = None

    def __iter__(self):
        return self

    def _read_buffer_to_offset(self, new_buff_offset):
        """Read buffer from index self.buffer_offset to index new_buff_offset.

        self.buff_offset marks the last position of the last read,
        new_buff_offset indicates the last position of this read.
        self.buff_offset will be updated by new_buff_offset after this read.

        Returns:
            self.buff[i1: i2]: Content of self.buff.
        """
        old_buff_offset = self.buff_offset
        read_size = min(len(self.buff), new_buff_offset) - old_buff_offset
        self.buff_offset += read_size
        return self.buff[old_buff_offset:old_buff_offset + read_size]

    def read(self, n=None):
        """Read `n` or all contents of self.buff or file.

        Returns:
            result: Data from self.buff or file.
        """
        result = None
        # If self.buff is not none and length of self.buff more than
        # self.buff_offset, means there are some content in self.buff have
        # not been read.
        if self.buff and len(self.buff) > self.buff_offset:
            if n is not None:
                chunk = self._read_buffer_to_offset(self.buff_offset + n)
                # If length of data in self.buff is more than `n`, then read `n`
                # data from local buffer.
                if len(chunk) == n:
                    return chunk
                result = chunk
                # The length of all data in self.buff may less than `n`,
                # so we should read other `n-length(self.buff)` data.
                n -= len(chunk)
            # If n is none, read all data in self.buff.
            else:
                # add all local buffer and update offsets
                result = self._read_buffer_to_offset(len(self.buff))

        # self.buff is empty if program is here.
        # Read from filesystem.
        # If n is not none, read max(n, self.buff_chunk_size) data from file,
        # otherwise read all data from file.
        # TODO(shenhuhan) N is limited to max_buff, but all-data is unlimited?
        read_size = max(self.buff_chunk_size, n) if n is not None else None
        self.buff, self.continuation_token = self.fs.read(
            self._filename, self.binary_mode, read_size,
            self.continuation_token)
        self.buff_offset = 0

        if n is not None:
            chunk = self._read_buffer_to_offset(n)
        else:
            # add all local buffer and update offsets
            chunk = self._read_buffer_to_offset(len(self.buff))
        result = result + chunk if result else chunk

        return result

    def write(self, file_content):
        """Write contents to file.

        Args:
            file_content: Contents waiting to be written to file.
        """
        if not self.write_mode:
            raise RuntimeError("File not opened in write mode")
        if self.closed:
            raise RuntimeError("File already closed")

        if self.fs_supports_append:
            if not self.write_started:
                self.fs.write(self._filename, file_content, self.binary_mode)
                self.write_started = True
            else:
                self.fs.append(self._filename, file_content, self.binary_mode)
        else:
            # add to temp file, but wait for flush to write to final filesystem
            if self.write_temp is None:
                mode = "w+b" if self.binary_mode else "w+"
                self.write_temp = tempfile.TemporaryFile(mode)
            self.write_temp.write(file_content)

    def __next__(self):
        line = None
        while True:
            if not self.buff:
                # read one unit into the buffer
                line = self.read(1)
                if line and (line[-1] == '\n' or not self.buff):
                    return line
                if not self.buff:
                    raise StopIteration()
            else:
                index = self.buff.find('\n', self.buff_offset)
                if index != -1:
                    # include line until now plus newline
                    chunk = self.read(index + 1 - self.buff_offset)
                    line = line + chunk if line else chunk
                    return line

                # read one unit past end of buffer
                chunk = self.read(len(self.buff) + 1 - self.buff_offset)
                line = line + chunk if line else chunk
                if line and (line[-1] == '\n' or not self.buff):
                    return line
                if not self.buff:
                    raise StopIteration()

    def next(self):
        return self.__next__()

    def flush(self):
        """Flush data to disk.
        """
        if self.closed:
            raise RuntimeError("File already closed")
        if not self.fs_supports_append:
            if self.write_temp is not None:
                # read temp file from the beginning
                self.write_temp.flush()
                self.write_temp.seek(0)
                chunk = self.write_temp.read()
                if chunk is not None:
                    # write full contents and keep in temp file
                    self.fs.write(self._filename, chunk, self.binary_mode)
                    self.write_temp.seek(len(chunk))

    def close(self):
        self.flush()
        if self.write_temp is not None:
            self.write_temp.close()
            self.write_temp = None
            self.write_started = False
        self.closed = True


def exists(path):
    return default_file_factory.get_filesystem(path).exists(path)


def makedirs(path):
    return default_file_factory.get_filesystem(path).makedirs(path)


def join(path, *paths):
    return default_file_factory.get_filesystem(path).join(path, *paths)


def walk(dir):
    return default_file_factory.get_filesystem(dir).walk(dir)
