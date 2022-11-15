# Copyright (c) 2020  PaddlePaddle Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"
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
import os
import tarfile
import zipfile
from typing import Callable
from typing import Generator
from typing import List

import rarfile


class XarInfo(object):
    '''Informational class which holds the details about an archive member given by a XarFile.'''

    def __init__(self, _xarinfo, arctype='tar'):
        self._info = _xarinfo
        self.arctype = arctype

    @property
    def name(self) -> str:
        if self.arctype == 'tar':
            return self._info.name
        return self._info.filename

    @property
    def size(self) -> int:
        if self.arctype == 'tar':
            return self._info.size
        return self._info.file_size


class XarFile(object):
    '''
    The XarFile Class provides an interface to tar/rar/zip archives.

    Args:
        name(str) : file or directory name to be archived
        mode(str) : specifies the mode in which the file is opened, it must be:
            ========   ==============================================================================================
            Charater   Meaning
            --------   ----------------------------------------------------------------------------------------------
            'r'        open for reading
            'w'        open for writing, truncating the file first, file will be saved according to the arctype field
            'a'        open for writing, appending to the end of the file if it exists
            ========   ===============================================================================================
        arctype(str) : archive type, support ['tar' 'rar' 'zip' 'tar.gz' 'tar.bz2' 'tar.xz' 'tgz' 'txz'], if
                       the mode if 'w' or 'a', the default is 'tar', if the mode is 'r', it will be based on actual
                       archive type of file
    '''

    def __init__(self, name: str, mode: str, arctype: str = 'tar', **kwargs):
        # if mode is 'w', adjust mode according to arctype field
        if mode == 'w':
            if arctype in ['tar.gz', 'tgz']:
                mode = 'w:gz'
                self.arctype = 'tar'
            elif arctype == 'tar.bz2':
                mode = 'w:bz2'
                self.arctype = 'tar'
            elif arctype in ['tar.xz', 'txz']:
                mode = 'w:xz'
                self.arctype = 'tar'
            else:
                self.arctype = arctype
        # if mode is 'r', adjust mode according to actual archive type of file
        elif mode == 'r':
            if tarfile.is_tarfile(name):
                self.arctype = 'tar'
                mode = 'r:*'
            elif zipfile.is_zipfile(name):
                self.arctype = 'zip'
            elif rarfile.is_rarfile(name):
                self.arctype = 'rar'
        elif mode == 'a':
            self.arctype = arctype
        else:
            raise RuntimeError('Unsupported mode {}'.format(mode))

        if self.arctype in [
                'tar.gz', 'tar.bz2', 'tar.xz', 'tar', 'tgz', 'txz'
        ]:
            self._archive_fp = tarfile.open(name, mode, **kwargs)
        elif self.arctype == 'zip':
            self._archive_fp = zipfile.ZipFile(name, mode, **kwargs)
        elif self.arctype == 'rar':
            self._archive_fp = rarfile.RarFile(name, mode, **kwargs)
        else:
            raise RuntimeError('Unsupported archive type {}'.format(
                self.arctype))

    def __del__(self):
        self._archive_fp.close()

    def __enter__(self):
        return self

    def __exit__(self, exit_exception, exit_value, exit_traceback):
        if exit_exception:
            print(exit_traceback)
            raise exit_exception(exit_value)
        self._archive_fp.close()
        return self

    def add(self,
            name: str,
            arcname: str = None,
            recursive: bool = True,
            exclude: Callable = None):
        '''
        Add the file `name' to the archive. `name' may be any type of file (directory, fifo, symbolic link, etc.).
        If given, `arcname' specifies an alternative name for the file in the archive. Directories are added
        recursively by default. This can be avoided by setting `recursive' to False. `exclude' is a function that
        should return True for each filename to be excluded.
        '''
        if self.arctype == 'tar':
            self._archive_fp.add(name, arcname, recursive, filter=exclude)
        else:
            self._archive_fp.write(name)
            if not recursive or not os.path.isdir(name):
                return
            items = []
            for _d, _sub_ds, _files in os.walk(name):
                items += [os.path.join(_d, _file) for _file in _files]
                items += [os.path.join(_d, _sub_d) for _sub_d in _sub_ds]

            for item in items:
                if exclude and not exclude(item):
                    continue
                self._archive_fp.write(item)

    def extract(self, name: str, path: str):
        '''Extract a file from the archive to the specified path.'''
        return self._archive_fp.extract(name, path)

    def extractall(self, path: str):
        '''Extract all files from the archive to the specified path.'''
        return self._archive_fp.extractall(path)

    def getnames(self) -> List[str]:
        '''Return a list of file names in the archive.'''
        if self.arctype == 'tar':
            return self._archive_fp.getnames()
        return self._archive_fp.namelist()

    def getxarinfo(self, name: str) -> List[XarInfo]:
        '''Return the instance of XarInfo given 'name'.'''
        if self.arctype == 'tar':
            return XarInfo(self._archive_fp.getmember(name), self.arctype)
        return XarInfo(self._archive_fp.getinfo(name), self.arctype)


def open(name: str, mode: str = 'w', **kwargs) -> XarFile:
    '''
    Open a xar archive for reading, writing or appending. Return
    an appropriate XarFile class.
    '''
    return XarFile(name, mode, **kwargs)


def archive(filename: str,
            recursive: bool = True,
            exclude: Callable = None,
            arctype: str = 'tar') -> str:
    '''
    Archive a file or directory

    Args:
        name(str) : file or directory path to be archived
        recursive(bool) : whether to recursively archive directories
        exclude(Callable) : function that should return True for each filename to be excluded
        arctype(str) : archive type, support ['tar' 'rar' 'zip' 'tar.gz' 'tar.bz2' 'tar.xz' 'tgz' 'txz']

    Returns:
        str: archived file path

    Examples:
        .. code-block:: python

            archive_path = '/PATH/TO/FILE'
            archive(archive_path, arcname='output.tar.gz', arctype='tar.gz')
    '''
    basename = os.path.splitext(os.path.basename(filename))[0]
    savename = '{}.{}'.format(basename, arctype)
    with open(savename, mode='w', arctype=arctype) as file:
        file.add(filename, recursive=recursive, exclude=exclude)

    return savename


def unarchive(name: str, path: str):
    '''
    Unarchive a file

    Args:
        name(str) : file or directory name to be unarchived
        path(str) : storage name of archive file

    Examples:
        .. code-block:: python

            unarchive_path = '/PATH/TO/FILE'
            unarchive(unarchive_path, path='./output')
    '''
    with open(name, mode='r') as file:
        file.extractall(path)


def unarchive_with_progress(name: str, path: str) -> Generator[str, int, int]:
    '''
    Unarchive a file and return the unarchiving progress -> Generator[filename, extrace_size, total_size]

    Args:
        name(str) : file or directory name to be unarchived
        path(str) : storage name of archive file

    Examples:
        .. code-block:: python

            unarchive_path = 'test.tar.gz'
            for filename, extract_size, total_szie in unarchive_with_progress(unarchive_path, path='./output'):
                print(filename, extract_size, total_size)
    '''
    with open(name, mode='r') as file:
        total_size = extract_size = 0
        for filename in file.getnames():
            total_size += file.getxarinfo(filename).size

        for filename in file.getnames():
            file.extract(filename, path)
            extract_size += file.getxarinfo(filename).size
            yield filename, extract_size, total_size


def is_xarfile(file: str) -> bool:
    '''Return True if xarfile supports specific file, otherwise False'''
    _x_func = [zipfile.is_zipfile, tarfile.is_tarfile, rarfile.is_rarfile]
    for _f in _x_func:
        if _f(file):
            return True
    return False
