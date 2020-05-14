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

import os
import sys
from sys import platform
from distutils.spawn import find_executable
from distutils import log
import setuptools.command.build_py
import setuptools
from setuptools import setup
from setuptools import find_packages
from visualdl import __version__
import subprocess

TOP_DIR = os.path.realpath(os.path.dirname(__file__))
PYTHON_SDK_DIR = os.path.join(TOP_DIR, 'visualdl/python')
BUILD_DIR = os.path.join(TOP_DIR, 'build')
MODE = os.environ.get('VS_BUILD_MODE', 'RELEASE')


def read(name):
    return open(os.path.join(TOP_DIR, name)).read()


def readlines(name):
    return read(name).split('\n')


LICENSE = readlines('LICENSE')[0].strip()

# use memcache to reduce disk read frequency.
REQUIRED_PACKAGES = read("requirements.txt")

execute_requires = ['npm', 'node', 'bash', 'cmake', 'unzip']
if platform == "win32":
    execute_requires = ['node', 'powershell', 'cmake']


def die(msg):
    log.error(msg)
    sys.exit(1)


def CHECK(cond, msg):
    if not cond:
        die(msg)


for exe in execute_requires:
    CHECK(find_executable(exe), "{} should be installed.".format(exe))


class BaseCommand(setuptools.Command):
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass


class build_py(setuptools.command.build_py.build_py):
    def run(self):
        cmd = ['bash', 'scripts/build.sh']
        if platform == "win32":
            cmd = ['powershell', '-NoProfile', './scripts/build.ps1']
        env = dict(os.environ)
        if MODE == "travis-CI":
            cmd.append('travis-CI')
        if sys.version_info[0] >= 3:
            env["WITH_PYTHON3"] = "ON"
        subprocess.check_call(cmd, env=env)
        return setuptools.command.build_py.build_py.run(self)


cmdclass = {
    'build_py': build_py,
}

setup(
    name="visualdl",
    version=__version__,
    author="PaddlePaddle and Echarts team",
    description="Visualize Deep Learning",
    license=LICENSE,
    keywords="visualization deeplearning",
    long_description=read('README.md'),
    long_description_content_type='text/markdown',
    install_requires=REQUIRED_PACKAGES,
    package_data={
        'visualdl.server': [('dist' + ('/*' * n)) for n in range(1, 20)] + [('static' + ('/*' * n)) for n in
                                                                            range(1, 20)],
        'visualdl.python': ['dog.jpg', 'testing.wav']
    },
    packages=find_packages(),
    cmdclass=cmdclass,
    entry_points={'console_scripts': ['visualdl=visualdl.server.app:main']})
