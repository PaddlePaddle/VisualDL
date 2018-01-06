from __future__ import absolute_import

import os
import sys
from distutils.spawn import find_executable
from distutils import sysconfig, dep_util, log
import setuptools.command.build_py
import setuptools
from setuptools import setup
import subprocess

TOP_DIR = os.path.realpath(os.path.dirname(__file__))
PYTHON_SDK_DIR = os.path.join(TOP_DIR, 'visualdl/python')
BUILD_DIR = os.path.join(TOP_DIR, 'build')


def read(name):
    return open(os.path.join(TOP_DIR, name)).read()


def readlines(name):
    return read(name).split('\n')


VERSION_NUMBER = open(os.path.join(TOP_DIR, 'VERSION_NUMBER'))
LICENSE = readlines('LICENSE')[0].strip()

install_requires = ['Flask', 'numpy', 'Pillow', 'protobuf']
execute_requires = ['npm', 'node', 'protoc', 'bash']


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


class build(BaseCommand):
    def run(self):
        subprocess.check_call(['bash', 'build.sh'])


class build_py(setuptools.command.build_py.build_py):
    def run(self):
        self.run_command('build')
        return setuptools.command.build_py.build_py.run(self)


cmdclass = {
    'build': build,
    'build_py': build_py,
}

setup(
    name="VisualDL",
    version=VERSION_NUMBER,
    author="PaddlePaddle and Echarts team.",
    description="Visualize Deep Learning.",
    license=LICENSE,
    keywords="visualization deeplearning",
    long_description=read('README.md'),
    install_requires=install_requires,
    cmdclass=cmdclass)
